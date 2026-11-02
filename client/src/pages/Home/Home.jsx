
import { useState } from "react";
import RoomSetup from "../../components/multiplayer/RoomSetup/RoomSetup";
import CameraSetup from "../../components/multiplayer/CameraSetup/CameraSetup";
import useMultiplayer from "../../hooks/useMultiplayer";

import "./Home.css";
import "./RoomLobby.css";

export default function Home() {
  const {
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
  } = useMultiplayer();

  const [copied, setCopied] = useState(false);

  const myPlayer = room?.players.find(
    (player) => player.id === room.myPlayerId
  );

  const opponent = room?.players.find(
    (player) => player.id !== room.myPlayerId
  );

  const bothPlayersJoined = room?.players.length === 2;
  const bothReady = room?.status === "ready";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!room) {
    return (
      <RoomSetup
        connected={connected}
        loading={loading}
        error={error}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />
    );
  }

  if (bothReady) {
    return (
      <CameraSetup
        room={room}
        myPlayer={myPlayer}
        opponent={opponent}
        connected={connected}
        remoteStream={remoteStream}
        peerStatus={peerStatus}
        onConnectPeer={connectPeer}
        onDisconnectPeer={disconnectPeer}
        onLeave={leaveRoom}
      />
    );
  }

  return (
    <main className="room-lobby">
      <section className="room-lobby-card">
        <header className="room-lobby-header">
          <div className="room-lobby-brand">
            <span className="room-lobby-brand-icon">🏏</span>
            <div>
              <strong>HAND CRICKET</strong>
              <span>THE DIGITAL CRICKET ARENA</span>
            </div>
          </div>
          <div className="room-lobby-live">
            <span />
            {connected ? "SERVER CONNECTED" : "RECONNECTING"}
          </div>
        </header>

        <div className="room-lobby-heading">
          <span className="room-lobby-eyebrow">MULTIPLAYER MATCH ROOM</span>
          <h1>YOUR MATCH IS TAKING SHAPE.</h1>
          <p>Invite your opponent and get ready to enter the cricket arena.</p>
        </div>

        <section className="room-lobby-code">
          <div>
            <span>YOUR PRIVATE ROOM CODE</span>
            <strong>{room.roomCode}</strong>
            <small>Share this code with your opponent.</small>
          </div>
          <button type="button" onClick={handleCopyCode} className="room-lobby-copy">
            {copied ? "COPIED!" : "COPY CODE"}
          </button>
        </section>

        <section className="room-lobby-player-section">
          <div className="room-lobby-section-heading">
            <h2>PLAYERS IN THE ROOM</h2>
            <span>{room.players.length}/2 CONNECTED</span>
          </div>

          <div className="room-lobby-players">
            {room.players.map((player) => (
              <article className="room-lobby-player" key={player.id}>
                <div className="room-lobby-player-top">
                  <div className="room-lobby-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="room-lobby-player-role">
                    {player.id === room.hostPlayerId ? "HOST" : "CHALLENGER"}
                  </span>
                </div>
                <h3>{player.name}</h3>
                <p>{player.teamName}</p>
                <div className={`room-lobby-player-status ${player.ready ? "is-ready" : ""}`}>
                  <span />
                  {player.ready ? "READY" : "WAITING"}
                </div>
              </article>
            ))}

            {!opponent && (
              <article className="room-lobby-player room-lobby-empty">
                <div className="room-lobby-avatar">?</div>
                <h3>Waiting for opponent</h3>
                <p>Share your room code to invite a player.</p>
                <div className="room-lobby-player-status">
                  <span />
                  WAITING TO JOIN
                </div>
              </article>
            )}
          </div>
        </section>

        <div className="room-lobby-readiness">
          <div className="room-lobby-readiness-icon">
            {myPlayer?.ready ? "✓" : "!"}
          </div>
          <div>
            <strong>{myPlayer?.ready ? "You're ready to play" : "Ready when you are"}</strong>
            <p>
              {myPlayer?.ready
                ? "Waiting for your opponent to confirm."
                : bothPlayersJoined
                  ? "Confirm your readiness to continue."
                  : "Your opponent needs to join before you can continue."}
            </p>
          </div>
        </div>

        {notice && <p className="room-lobby-notice">{notice}</p>}
        {error && <p className="room-lobby-error">{error}</p>}

        <div className="room-lobby-actions">
          <button
            type="button"
            className="room-lobby-ready"
            disabled={loading || !bothPlayersJoined || myPlayer?.ready}
            onClick={() => markReady(true)}
          >
            {loading ? "PLEASE WAIT..." : myPlayer?.ready ? "YOU ARE READY" : "I'M READY"}
          </button>
          <button type="button" className="room-lobby-leave" onClick={leaveRoom}>
            LEAVE ROOM
          </button>
        </div>

        <footer className="room-lobby-footer">
          TWO PLAYERS <span>•</span> ONE PITCH <span>•</span> ONE CHAMPION
        </footer>
      </section>
    </main>
  );
}
