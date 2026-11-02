
import { MessageSquareText } from "lucide-react";
import "./MatchCommentary.css";

export default function MatchCommentary({ match }) {
  const history = match?.currentInnings?.history ?? [];

  const recentBalls = [...history].reverse().slice(0, 6);

  const getDescription = (ball) => {
    if (ball.wicket) return "WICKET! The batsman is out!";
    if (ball.runs === 0) return "Dot ball. No runs scored.";
    if (ball.runs === 4) return "FOUR! Beautiful boundary!";
    if (ball.runs === 6) return "SIX! Out of the park!";
    return `${ball.runs} run${ball.runs === 1 ? "" : "s"} scored.`;
  };

  return (
    <section className="match-commentary">
      <div className="match-commentary-heading">
        <MessageSquareText size={19} />
        <h3>MATCH COMMENTARY</h3>
      </div>

      {recentBalls.length === 0 ? (
        <div className="match-commentary-empty">
          The stadium is ready.
          <span>Waiting for the first ball...</span>
        </div>
      ) : (
        <div className="match-commentary-list">
          {recentBalls.map((ball) => (
            <div className="match-commentary-item" key={ball.ballNumber}>
              <span className="commentary-ball-number">
                {ball.over}
              </span>

              <div>
                <strong>{getDescription(ball)}</strong>
                <span>
                  {ball.batsman} showed {ball.batsmanNumber} ·
                  {` ${ball.bowler} showed ${ball.bowlerNumber}`}
                </span>
              </div>

              <b className={ball.wicket ? "commentary-wicket" : ""}>
                {ball.wicket ? "W" : `+${ball.runs}`}
              </b>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
