
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";

import {
  createRoom,
  joinRoom,
  setPlayerReady,
  getPlayerRoom,
  removePlayer,
} from "./services/roomManager.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.get("/", (_req, res) => {
  res.json({ message: "Hand Cricket server is running", status: "OK" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

function validatePlayerInfo(playerInfo) {
  if (!playerInfo || typeof playerInfo !== "object") {
    throw new Error("Player information is required.");
  }

  const name = typeof playerInfo.name === "string" ? playerInfo.name.trim() : "";
  const teamName = typeof playerInfo.teamName === "string" ? playerInfo.teamName.trim() : "";

  if (!name || name.length > 30) {
    throw new Error("Player name must contain 1–30 characters.");
  }

  if (!teamName || teamName.length > 30) {
    throw new Error("Team name must contain 1–30 characters.");
  }

  return { name, teamName };
}

function acknowledgeError(acknowledge, error) {
  if (typeof acknowledge === "function") {
    acknowledge({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
}

function broadcastRoom(roomCode, room) {
  io.to(roomCode).emit("room-updated", room);
}

function relayToOpponent(socket, eventName, payload) {
  const roomCode = socket.data.roomCode;

  if (!roomCode || getPlayerRoom(socket.id) !== roomCode) {
    return;
  }

  socket.to(roomCode).emit(eventName, payload);
}

function leaveCurrentRoom(socket) {
  const roomCode = getPlayerRoom(socket.id);

  if (!roomCode) return;

  const result = removePlayer(socket.id);

  socket.leave(roomCode);
  delete socket.data.roomCode;

  if (!result) return;

  if (result.roomDeleted) {
    io.to(roomCode).emit("room-closed", {
      message: "The room host has left. This room is now closed.",
    });
  } else {
    broadcastRoom(roomCode, result.room);
    io.to(roomCode).emit("opponent-left", {
      playerId: result.removedPlayerId,
    });
  }
}

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("create-room", (payload, acknowledge) => {
    try {
      if (getPlayerRoom(socket.id)) {
        throw new Error("Leave your current room before creating another.");
      }

      const room = createRoom(socket.id, validatePlayerInfo(payload?.player));

      socket.join(room.roomCode);
      socket.data.roomCode = room.roomCode;

      acknowledge?.({ success: true, room });

      console.log(`Room created: ${room.roomCode}`);
    } catch (error) {
      acknowledgeError(acknowledge, error);
    }
  });

  socket.on("join-room", (payload, acknowledge) => {
    try {
      if (getPlayerRoom(socket.id)) {
        throw new Error("Leave your current room before joining another.");
      }

      const code = typeof payload?.roomCode === "string"
        ? payload.roomCode.trim().toUpperCase()
        : "";

      if (!/^[A-Z0-9]{6}$/.test(code)) {
        throw new Error("Enter a valid 6-character room code.");
      }

      const room = joinRoom(code, socket.id, validatePlayerInfo(payload?.player));

      socket.join(room.roomCode);
      socket.data.roomCode = room.roomCode;

      broadcastRoom(room.roomCode, room);
      acknowledge?.({ success: true, room });

      console.log(`Player joined room: ${room.roomCode}`);
    } catch (error) {
      acknowledgeError(acknowledge, error);
    }
  });

  socket.on("player-ready", (payload, acknowledge) => {
    try {
      const roomCode = socket.data.roomCode;

      if (!roomCode) {
        throw new Error("You are not currently in a room.");
      }

      const room = setPlayerReady(roomCode, socket.id, payload?.ready);

      broadcastRoom(roomCode, room);
      acknowledge?.({ success: true, room });

      if (room.status === "ready") {
        io.to(roomCode).emit("room-ready", room);
      }
    } catch (error) {
      acknowledgeError(acknowledge, error);
    }
  });

  // WebRTC signaling: relay offers, answers and ICE candidates.
  socket.on("webrtc-offer", (payload) => {
    if (!payload?.offer) return;
    relayToOpponent(socket, "webrtc-offer", payload);
  });

  socket.on("webrtc-answer", (payload) => {
    if (!payload?.answer) return;
    relayToOpponent(socket, "webrtc-answer", payload);
  });

  socket.on("webrtc-ice-candidate", (payload) => {
    if (!payload?.candidate) return;
    relayToOpponent(socket, "webrtc-ice-candidate", payload);
  });

  socket.on("leave-room", () => {
    leaveCurrentRoom(socket);
  });

  socket.on("disconnect", () => {
    leaveCurrentRoom(socket);
    console.log(`Player disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Hand Cricket server running on port ${PORT}`);
});
