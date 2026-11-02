
import { Trophy } from "lucide-react";
import { getOvers } from "../../../services/game/handCricketEngine";
import "./Scoreboard.css";

export default function Scoreboard({ match }) {
  const innings = match.currentInnings;
  const battingPlayer = match.players[match.battingPlayerId];
  const bowlingPlayer = match.players[match.bowlingPlayerId];

  return (
    <section className="scoreboard">
      <div className="scoreboard-heading">
        <div>
          <span className="scoreboard-eyebrow">
            LIVE MATCH CENTRE
          </span>
          <h2>THE MATCH</h2>
        </div>
        <Trophy size={25} />
      </div>

      <div className="scoreboard-main">
        <div className="scoreboard-player">
          <span>{battingPlayer.name}</span>
          <strong>{battingPlayer.team}</strong>
          <small>BATSMAN</small>
        </div>

        <div className="scoreboard-score">
          <strong>{innings.runs}</strong>
          <span> / {innings.wickets}</span>
        </div>

        <div className="scoreboard-player scoreboard-player-right">
          <span>{bowlingPlayer.name}</span>
          <strong>{bowlingPlayer.team}</strong>
          <small>BOWLER</small>
        </div>
      </div>

      <div className="scoreboard-footer">
        <span>OVERS: {getOvers(innings.balls)}</span>
        <span>INNINGS: {match.inningsNumber}</span>
        <span>
          {match.status === "playing"
            ? "LIVE"
            : match.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {match.target !== null && (
        <div className="scoreboard-target">
          TARGET: {match.target} RUNS
          <span>
            {Math.max(0, match.target - innings.runs)} RUNS TO WIN
          </span>
        </div>
      )}
    </section>
  );
}
