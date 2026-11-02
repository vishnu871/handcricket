
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const RTC_CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function useMultiplayer() {
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingIceRef = useRef([]);

  const myPlayerIdRef = useRef(null);
  const roomRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerStatus, setPeerStatus] = useState("disconnected");

  const updateRoom = useCallback((snapshot) => {
    if (!snapshot) return;

    const updatedRoom = {
      ...snapshot,
      myPlayerId: myPlayerIdRef.current,
    };

    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
  }, []);

  const closePeerConnection = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    pendingOfferRef.current = null;
    pendingIceRef.current = [];
    setRemoteStream(null);
    setPeerStatus("disconnected");
  }, []);

  const addPendingIceCandidates = useCallback(async (peer) => {
    const candidates = [...pendingIceRef.current];
    pendingIceRef.current = [];

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (candidateError) {
        console.warn("Unable to add queued ICE candidate:", candidateError);
      }
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(RTC_CONFIGURATION);
    peerRef.current = peer;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peer.ontrack = (event) => {
      const incomingStream = event.streams?.[0];

      if (incomingStream) {
        setRemoteStream(incomingStream);
      } else {
        setRemoteStream((currentStream) => {
          const stream = currentStream || new MediaStream();

          if (!stream.getTracks().some((track) => track.id === event.track.id)) {
            stream.addTrack(event.track);
          }

          return stream;
        });
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("webrtc-ice-candidate", {
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;

      if (state === "connected") {
        setPeerStatus("connected");
      } else if (state === "connecting") {
        setPeerStatus("connecting");
      } else if (state === "failed") {
        setPeerStatus("failed");
      } else if (state === "disconnected") {
        setPeerStatus("disconnected");
      } else if (state === "closed") {
        setPeerStatus("disconnected");
      }
    };

    setPeerStatus("connecting");
    return peer;
  }, []);

  const handleIncomingOffer = useCallback(async (offer) => {
    if (!localStreamRef.current) {
      pendingOfferRef.current = offer;
      return;
    }

    try {
      const peer = createPeerConnection();

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      await addPendingIceCandidates(peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current?.emit("webrtc-answer", {
        answer: peer.localDescription,
      });
    } catch (peerError) {
      console.error("WebRTC offer handling failed:", peerError);
      setPeerStatus("failed");
      setError("Unable to establish the video connection. Please retry.");
    }
  }, [addPendingIceCandidates, createPeerConnection]);

  const handleIncomingAnswer = useCallback(async (answer) => {
    const peer = peerRef.current;

    if (!peer || peer.signalingState !== "have-local-offer") return;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await addPendingIceCandidates(peer);
    } catch (peerError) {
      console.error("WebRTC answer handling failed:", peerError);
      setPeerStatus("failed");
      setError("Unable to complete the video connection.");
    }
  }, [addPendingIceCandidates]);

  const handleIncomingIce = useCallback(async (candidate) => {
    const peer = peerRef.current;

    if (!peer || !peer.remoteDescription) {
      pendingIceRef.current.push(candidate);
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (peerError) {
      console.warn("Unable to add ICE candidate:", peerError);
    }
  }, []);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError("");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setNotice("Connection to the server was interrupted.");
    });

    socket.on("connect_error", () => {
      setConnected(false);
      setError("Unable to connect to the game server.");
    });

    socket.on("room-updated", updateRoom);

    socket.on("room-ready", (snapshot) => {
      updateRoom(snapshot);
      setNotice("Both players are ready.");
    });

    socket.on("webrtc-offer", ({ offer }) => {
      if (offer) handleIncomingOffer(offer);
    });

    socket.on("webrtc-answer", ({ answer }) => {
      if (answer) handleIncomingAnswer(answer);
    });

    socket.on("webrtc-ice-candidate", ({ candidate }) => {
      if (candidate) handleIncomingIce(candidate);
    });

    socket.on("opponent-left", () => {
      closePeerConnection();
      setNotice("Your opponent has left the room.");
    });

    socket.on("room-closed", (payload) => {
      closePeerConnection();
      roomRef.current = null;
      myPlayerIdRef.current = null;
      setRoom(null);
      setNotice(payload?.message || "The room has been closed.");
    });

    return () => {
      closePeerConnection();
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    closePeerConnection,
    handleIncomingAnswer,
    handleIncomingIce,
    handleIncomingOffer,
    updateRoom,
  ]);

  const emitWithAcknowledgement = useCallback((eventName, payload) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;

      if (!socket?.connected) {
        reject(new Error("Not connected to the game server."));
        return;
      }

      const timeout = window.setTimeout(() => {
        reject(new Error("The server did not respond. Please try again."));
      }, 10000);

      socket.emit(eventName, payload, (response) => {
        window.clearTimeout(timeout);

        if (!response?.success) {
          reject(new Error(response?.message || "Request failed."));
          return;
        }

        resolve(response);
      });
    });
  }, []);

  const identifyCurrentPlayer = useCallback((snapshot, player) => {
    const currentPlayer = snapshot.players.find(
      (item) =>
        item.name === player.name &&
        item.teamName === player.teamName
    );

    myPlayerIdRef.current = currentPlayer?.id || null;

    return {
      ...snapshot,
      myPlayerId: myPlayerIdRef.current,
    };
  }, []);

  const createRoom = useCallback(async (player) => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await emitWithAcknowledgement("create-room", { player });
      const identifiedRoom = identifyCurrentPlayer(response.room, player);
      updateRoom(identifiedRoom);
      return identifiedRoom;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [emitWithAcknowledgement, identifyCurrentPlayer, updateRoom]);

  const joinRoom = useCallback(async (roomCode, player) => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await emitWithAcknowledgement("join-room", {
        roomCode,
        player,
      });

      const identifiedRoom = identifyCurrentPlayer(response.room, player);
      updateRoom(identifiedRoom);
      return identifiedRoom;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [emitWithAcknowledgement, identifyCurrentPlayer, updateRoom]);

  const markReady = useCallback(async (ready) => {
    setLoading(true);
    setError("");

    try {
      const response = await emitWithAcknowledgement("player-ready", { ready });
      updateRoom(response.room);
      return response.room;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [emitWithAcknowledgement, updateRoom]);

  const connectPeer = useCallback(async (stream) => {
    const currentRoom = roomRef.current;
    const socket = socketRef.current;

    if (!currentRoom || !socket?.connected) {
      throw new Error("Join a room and connect to the server first.");
    }

    if (!currentRoom.players || currentRoom.players.length !== 2) {
      throw new Error("Your opponent has not joined the room.");
    }

    closePeerConnection();
    localStreamRef.current = stream;

    const peer = createPeerConnection();

    // Only the host initiates the offer, avoiding offer collisions.
    if (currentRoom.myPlayerId === currentRoom.hostPlayerId) {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
          offer: peer.localDescription,
        });
      } catch (peerError) {
        closePeerConnection();
        throw peerError;
      }
    } else if (pendingOfferRef.current) {
      const offer = pendingOfferRef.current;
      pendingOfferRef.current = null;
      await handleIncomingOffer(offer);
    }

    return true;
  }, [closePeerConnection, createPeerConnection, handleIncomingOffer]);

  const disconnectPeer = useCallback(() => {
    localStreamRef.current = null;
    closePeerConnection();
  }, [closePeerConnection]);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("leave-room");
    localStreamRef.current = null;
    closePeerConnection();
    myPlayerIdRef.current = null;
    roomRef.current = null;
    setRoom(null);
    setError("");
    setNotice("");
  }, [closePeerConnection]);

  return {
    connected,
    room,
    loading,
    error,
    notice,
    remoteStream,
    peerStatus,
    createRoom,
    joinRoom,
    markReady,
    connectPeer,
    disconnectPeer,
    leaveRoom,
  };
}
