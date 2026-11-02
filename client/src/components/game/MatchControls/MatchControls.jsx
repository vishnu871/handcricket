
import { useState } from "react";
import { Hand, Play, RotateCcw } from "lucide-react";
import { HAND_VALUES } from "../../../services/game/handCricketEngine";
import "./MatchControls.css";

function NumberSelector({ label, player, value, onChange }) {
  return (
    <div className="match-number-selector">
      <div className="match-number-player">
        <Hand size={19} />
        <div>
          <strong>{player.name}</strong>
          <span>{label}</span>
        </div>
      </div>

      <div className="match-number-grid">
        {HAND_VALUES.map((number) => (
          <button
            key={number}
            type="button"
            className={value === number ? "selected" : ""}
            onClick={() => onChange(number)}
            aria-pressed={value === number}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MatchControls({
  match,
  onPlayBall,
  onStartSecondInnings,
  onReset,
}) {
  const [batsmanNumber, setBatsmanNumber] = useState(null);
  const [bowlerNumber, setBowlerNumber] = useState(null);

  const battingPlayer = match.players[match.battingPlayerId];
  const bowlingPlayer = match.players[match.bowlingPlayerId];

  const handlePlay = () => {
    if (batsmanNumber === null || bowlerNumber === null) return;

    onPlayBall(batsmanNumber, bowlerNumber);
    setBatsmanNumber(null);
    setBowlerNumber(null);
  };

  if (match.status === "innings_break") {
    return (
      <section className="match-controls match-innings-break">
        <h3>INNINGS COMPLETE!</h3>
        <p>{match.resultMessage}</p>
        <button type="button" onClick={onStartSecondInnings}>
          <Play size={18} />
          START SECOND INNINGS
        </button>
      </section>
    );
  }

  if (match.status === "completed") {
    return (
      <section className="match-controls match-completed">
        <h3>{match.winner ? "MATCH WON!" : "MATCH TIED!"}</h3>
        <p>{match.resultMessage}</p>
        <button type="button" onClick={onReset}>
          <RotateCcw size={18} />
          PLAY AGAIN
        </button>
      </section>
    );
  }

  return (
    <section className="match-controls">
      <div className="match-controls-heading">
        <div>
          <span>GAMEPLAY TEST MODE</span>
          <h3>SHOW YOUR NUMBERS</h3>
        </div>
        <Hand size={27} />
      </div>

      <NumberSelector
        label="BATSMAN"
        player={battingPlayer}
        value={batsmanNumber}
        onChange={setBatsmanNumber}
      />

      <NumberSelector
        label="BOWLER"
        player={bowlingPlayer}
        value={bowlerNumber}
        onChange={setBowlerNumber}
      />

      <button
        className="match-play-button"
        type="button"
        disabled={batsmanNumber === null || bowlerNumber === null}
        onClick={handlePlay}
      >
        <Play size={19} />
        PLAY BALL
      </button>
    </section>
  );
}
