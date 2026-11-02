
import { useState } from "react";
import { Shield, Users, ArrowRight, Trophy } from "lucide-react";
import "./PlayerSetup.css";

export default function PlayerSetup({ onStart }) {
  const [players, setPlayers] = useState([
    { name: "", team: "" },
    { name: "", team: "" },
  ]);

  const updatePlayer = (index, field, value) => {
    setPlayers((current) =>
      current.map((player, i) =>
        i === index ? { ...player, [field]: value } : player
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (players.some((player) => !player.name.trim() || !player.team.trim())) {
      return;
    }

    onStart({
      player1: { ...players[0], role: "Batsman" },
      player2: { ...players[1], role: "Bowler" },
    });
  };

  return (
    <main className="player-setup">
      <div className="setup-background">
        <div className="setup-light setup-light-left" />
        <div className="setup-light setup-light-right" />
        <div className="setup-field">
          <div className="setup-field-circle" />
        </div>
      </div>

      <form className="setup-content" onSubmit={handleSubmit}>
        <div className="setup-brand">
          <div className="setup-brand-icon">🏏</div>
          <span>HAND CRICKET ARENA</span>
        </div>

        <div className="setup-heading">
          <span className="setup-eyebrow">YOUR MATCH STARTS HERE</span>
          <h1>MEET THE PLAYERS.</h1>
          <p>Enter your player and team details before entering the stadium.</p>
        </div>

        <div className="setup-player-grid">
          {players.map((player, index) => (
            <section className={`setup-player-card setup-player-${index + 1}`} key={index}>
              <div className="setup-player-heading">
                <div className="setup-player-number">
                  <Users size={21} />
                </div>
                <div>
                  <span>PLAYER {String(index + 1).padStart(2, "0")}</span>
                  <h2>{index === 0 ? "Batsman" : "Bowler"}</h2>
                </div>
                <span className="setup-role-number">
                  {index === 0 ? "01" : "02"}
                </span>
              </div>

              <div className="setup-field-group">
                <label htmlFor={`player-name-${index}`}>PLAYER NAME</label>
                <input
                  id={`player-name-${index}`}
                  type="text"
                  placeholder="Enter player name"
                  maxLength={30}
                  value={player.name}
                  onChange={(event) =>
                    updatePlayer(index, "name", event.target.value)
                  }
                  required
                />
              </div>

              <div className="setup-field-group">
                <label htmlFor={`team-name-${index}`}>TEAM NAME</label>
                <input
                  id={`team-name-${index}`}
                  type="text"
                  placeholder="Enter team name"
                  maxLength={30}
                  value={player.team}
                  onChange={(event) =>
                    updatePlayer(index, "team", event.target.value)
                  }
                  required
                />
              </div>
            </section>
          ))}
        </div>

        <div className="setup-match-note">
          <Shield size={17} />
          <span>Two players. One pitch. One champion.</span>
        </div>

        <button className="setup-start-button" type="submit">
          <Trophy size={19} />
          ENTER THE STADIUM
          <ArrowRight size={19} />
        </button>

        <p className="setup-footer">
          GET READY TO PLAY · THE ARENA IS WAITING
        </p>
      </form>
    </main>
  );
}
