
import PitchPlayers from "../../players/PitchPlayers/PitchPlayers";
import "./StadiumScene.css";

export default function StadiumScene({ players, matchState }) {
  return (
    <section className="stadium-scene">
      <div className="stadium-sky" />

      <div className="stadium-lights stadium-lights-left">
        <span />
      </div>

      <div className="stadium-lights stadium-lights-right">
        <span />
      </div>

      <div className="stadium-grandstand">
        <div className="stadium-roof" />

        <div className="stadium-crowd">
          {Array.from({ length: 90 }, (_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className="stadium-crowd-lower" />

        <div className="stadium-stand-advertising">
          <span>HAND CRICKET ARENA</span>
          <span>PLAY WITH YOUR HEART</span>
          <span>THE GAME IS ON</span>
        </div>
      </div>

      <div className="stadium-ground">
        <div className="stadium-grass-pattern" />

        <div className="stadium-boundary">
          <div className="stadium-inner-circle" />
          <div className="stadium-inner-circle-center" />
        </div>

        <div className="stadium-pitch">
          <div className="pitch-surface" />

          <div className="pitch-crease pitch-top">
            <span />
            <span />
          </div>

          <div className="pitch-crease pitch-bottom">
            <span />
            <span />
          </div>

          <div className="pitch-stumps pitch-top-stumps">
            <i /><i /><i />
          </div>

          <div className="pitch-stumps pitch-bottom-stumps">
            <i /><i /><i />
          </div>

          <div className="pitch-center">
            <span>THE PITCH</span>
            <small>BATSMAN VS BOWLER</small>
          </div>
        </div>

        {players && (
          <PitchPlayers
            players={players}
            matchState={matchState}
          />
        )}

        <div className="stadium-ground-decoration stadium-decoration-left">
          ✦
        </div>

        <div className="stadium-ground-decoration stadium-decoration-right">
          ✦
        </div>

        <div className="stadium-ground-label">
          <span>🏏</span> HAND CRICKET ARENA
        </div>
      </div>
    </section>
  );
}
