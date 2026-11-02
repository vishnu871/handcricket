
import { useState } from "react";
import {
  ArrowRight,
  DoorOpen,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import "./RoomSetup.css";

export default function RoomSetup({
  connected,
  loading,
  error,
  onCreateRoom,
  onJoinRoom,
}) {
  const [mode, setMode] = useState("create");
  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const player = {
      name: playerName.trim(),
      teamName: teamName.trim(),
    };

    if (mode === "create") {
      await onCreateRoom(player);
    } else {
      await onJoinRoom(roomCode.trim().toUpperCase(), player);
    }
  };

  return (
    <main className="room-setup">
      <div className="room-setup-background">
        <div className="room-setup-light room-setup-light-one" />
        <div className="room-setup-light room-setup-light-two" />
        <div className="room-setup-pitch">
          <div />
        </div>
      </div>

      <form className="room-setup-card" onSubmit={handleSubmit}>
        <div className="room-setup-brand">
          <span>🏏</span>
          <p>HAND CRICKET ARENA</p>
        </div>

        <div className="room-setup-heading">
          <span>THE GAME IS BETTER TOGETHER</span>
          <h1>CHALLENGE A PLAYER.</h1>
          <p>
            Create a private room or join your friend's room to begin
            your cricket battle.
          </p>
        </div>

        <div className="room-setup-connection">
          <span className={connected ? "connection-dot online" : "connection-dot"} />
          {connected ? "GAME SERVER CONNECTED" : "CONNECTING TO GAME SERVER"}
        </div>

        <div className="room-setup-tabs">
          <button
            type="button"
            className={mode === "create" ? "active" : ""}
            onClick={() => setMode("create")}
          >
            <Plus size={17} />
            CREATE ROOM
          </button>

          <button
            type="button"
            className={mode === "join" ? "active" : ""}
            onClick={() => setMode("join")}
          >
            <DoorOpen size={17} />
            JOIN ROOM
          </button>
        </div>

        <div className="room-setup-fields">
          <label htmlFor="room-player-name">YOUR PLAYER NAME</label>
          <input
            id="room-player-name"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Enter your name"
            maxLength={30}
            required
          />

          <label htmlFor="room-team-name">YOUR TEAM NAME</label>
          <input
            id="room-team-name"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="Enter your team name"
            maxLength={30}
            required
          />

          {mode === "join" && (
            <>
              <label htmlFor="room-code">ROOM CODE</label>
              <input
                id="room-code"
                className="room-code-input"
                value={roomCode}
                onChange={(event) =>
                  setRoomCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="ENTER 6-CHARACTER CODE"
                maxLength={6}
                required
              />
            </>
          )}
        </div>

        {error && <p className="room-setup-error">{error}</p>}

        {!connected && (
          <p className="room-setup-hint">
            Waiting for a connection to the game server...
          </p>
        )}

        <button
          className="room-setup-submit"
          type="submit"
          disabled={!connected || loading}
        >
          {loading
            ? "PLEASE WAIT..."
            : mode === "create"
              ? "CREATE YOUR ROOM"
              : "JOIN THE MATCH"}

          {!loading && <ArrowRight size={19} />}
        </button>

        <div className="room-setup-footer">
          <ShieldCheck size={16} />
          <span>
            <Users size={14} />
            TWO PLAYERS · ONE PRIVATE ROOM
          </span>
        </div>
      </form>
    </main>
  );
}
