
import { randomInt } from "node:crypto";

const rooms = new Map();

const ROOM_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 2;

function generateRoomCode() {
  let code;

  do {
    code = Array.from(
      { length: 6 },
      () => ROOM_CODE_CHARACTERS[randomInt(ROOM_CODE_CHARACTERS.length)]
    ).join("");
  } while (rooms.has(code));

  return code;
}

function createPlayer(socketId, playerInfo, playerId) {
  return {
    id: playerId,
    socketId,
    name: playerInfo.name.trim(),
    teamName: playerInfo.teamName.trim(),
    ready: false,
    connected: true,
  };
}

function getRoomSnapshot(room) {
  return {
    roomCode: room.code,
    status: room.status,
    hostPlayerId: room.hostPlayerId,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      teamName: player.teamName,
      ready: player.ready,
      connected: player.connected,
    })),
  };
}

export function createRoom(socketId, playerInfo) {
  const code = generateRoomCode();

  const host = createPlayer(socketId, playerInfo, "player1");

  const room = {
    code,
    hostPlayerId: "player1",
    status: "waiting",
    players: [host],
    createdAt: Date.now(),
  };

  rooms.set(code, room);

  return getRoomSnapshot(room);
}

export function joinRoom(code, socketId, playerInfo) {
  const normalizedCode = code.trim().toUpperCase();
  const room = rooms.get(normalizedCode);

  if (!room) {
    throw new Error("Room not found. Check the room code.");
  }

  if (room.players.length >= MAX_PLAYERS) {
    throw new Error("This room already has two players.");
  }

  if (room.status !== "waiting") {
    throw new Error("This room is not accepting new players.");
  }

  const guest = createPlayer(socketId, playerInfo, "player2");

  room.players.push(guest);

  return getRoomSnapshot(room);
}

export function setPlayerReady(code, socketId, ready) {
  const room = rooms.get(code);

  if (!room) {
    throw new Error("Room not found.");
  }

  const player = room.players.find(
    (item) => item.socketId === socketId
  );

  if (!player) {
    throw new Error("You are not a member of this room.");
  }

  player.ready = Boolean(ready);

  const bothPlayersPresent = room.players.length === MAX_PLAYERS;
  const bothPlayersConnected = room.players.every(
    (item) => item.connected
  );
  const bothPlayersReady = room.players.every(
    (item) => item.ready
  );

  room.status =
    bothPlayersPresent && bothPlayersConnected && bothPlayersReady
      ? "ready"
      : "waiting";

  return getRoomSnapshot(room);
}

export function getRoom(code) {
  const room = rooms.get(code);

  return room ? getRoomSnapshot(room) : null;
}

export function getPlayerRoom(socketId) {
  for (const room of rooms.values()) {
    const player = room.players.find(
      (item) => item.socketId === socketId
    );

    if (player) {
      return room.code;
    }
  }

  return null;
}

export function removePlayer(socketId) {
  for (const [code, room] of rooms.entries()) {
    const playerIndex = room.players.findIndex(
      (item) => item.socketId === socketId
    );

    if (playerIndex === -1) {
      continue;
    }

    const removedPlayer = room.players[playerIndex];

    if (removedPlayer.id === room.hostPlayerId) {
      rooms.delete(code);

      return {
        roomCode: code,
        removedPlayerId: removedPlayer.id,
        roomDeleted: true,
        room: null,
      };
    }

    room.players.splice(playerIndex, 1);
    room.status = "waiting";

    return {
      roomCode: code,
      removedPlayerId: removedPlayer.id,
      roomDeleted: false,
      room: getRoomSnapshot(room),
    };
  }

  return null;
}
