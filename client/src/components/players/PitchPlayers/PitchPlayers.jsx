
import { UserRound } from "lucide-react";
import "./PitchPlayers.css";

function PitchPlayer({ player, position, role }) {
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`pitch-player pitch-player-${position}`}>
      <div className="pitch-player-label">
        <strong>{player.name}</strong>
        <span>{player.team}</span>
        <small>{role}</small>
      </div>

      <div className={`pitch-player-character pitch-character-${position}`}>
        <div className="pitch-player-head">
          {initials || <UserRound size={20} />}
        </div>

        <div className="pitch-player-body">
          <span />
          <span />
        </div>

        <div className="pitch-player-legs">
          <i />
          <i />
        </div>

        {position === "striker" && (
          <div className="pitch-player-bat" />
        )}
      </div>
    </div>
  );
}

export default function PitchPlayers({ players, matchState }) {
  if (!players?.player1 || !players?.player2) return null;

  const battingPlayer = matchState
    ? players[matchState.battingPlayerId]
    : players.player1;

  const bowlingPlayer = matchState
    ? players[matchState.bowlingPlayerId]
    : players.player2;

  return (
    <div className="pitch-players">
      <PitchPlayer
        player={bowlingPlayer}
        position="bowler"
        role="BOWLER"
      />

      <div className="pitch-player-center-label">
        <span>VS</span>
      </div>

      <PitchPlayer
        player={battingPlayer}
        position="striker"
        role="BATSMAN · STRIKING END"
      />
    </div>
  );
}
