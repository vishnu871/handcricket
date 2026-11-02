
import { Radio } from "lucide-react";
import "./MatchStatus.css";

export default function MatchStatus({ status = "playing" }) {
  const labels = {
    playing: "MATCH IN PROGRESS",
    innings_break: "INNINGS BREAK",
    completed: "MATCH COMPLETED",
  };

  return (
    <div className={`match-status match-status-${status}`}>
      <Radio size={17} />
      <span>{labels[status]}</span>
      <span className="match-status-indicator" />
    </div>
  );
}
