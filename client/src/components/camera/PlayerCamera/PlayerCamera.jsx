
import { Camera, UserRound } from "lucide-react";
import "./PlayerCamera.css";

export default function PlayerCamera({ player, role }) {
  return (
    <section className="player-camera">
      <div className="player-camera-preview">
        <UserRound size={42} />
        <span>CAMERA PREVIEW</span>
        <small>Camera not connected</small>
      </div>

      <div className="player-camera-info">
        <div>
          <strong>{player}</strong>
          <span>{role}</span>
        </div>
        <Camera size={19} />
      </div>
    </section>
  );
}
