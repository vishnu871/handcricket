
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wifi,
} from "lucide-react";

import "./CameraSetup.css";

export default function CameraSetup({
  room,
  myPlayer,
  opponent,
  connected,
  remoteStream,
  peerStatus,
  onConnectPeer,
  onDisconnectPeer,
  onLeave,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraError, setCameraError] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [cameraEnabled]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;

      if (remoteStream) {
        remoteVideoRef.current.play().catch(() => {});
      }
    }
  }, [remoteStream]);

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    onDisconnectPeer();
    setCameraEnabled(false);
    setCameraStatus("idle");
  };

  const enableCamera = async () => {
    setCameraError("");
    setCameraStatus("requesting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setCameraError("Camera access requires localhost or HTTPS.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }

      setCameraEnabled(true);
      setCameraStatus("active");

      await onConnectPeer(stream);
    } catch (error) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      setCameraEnabled(false);
      setCameraStatus("error");
      onDisconnectPeer();

      if (error.name === "NotAllowedError") {
        setCameraError("Camera permission was denied. Allow camera access in browser settings.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was found on this device.");
      } else {
        setCameraError(error.message || "Unable to connect the camera.");
      }
    }
  };

  const handleLeave = () => {
    stopCamera();
    onLeave();
  };

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      onDisconnectPeer();
    };
  }, [onDisconnectPeer]);

  const remoteConnected = peerStatus === "connected" && Boolean(remoteStream);

  return (
    <main className="camera-setup-page">
      <header className="camera-setup-header">
        <div className="camera-setup-brand">
          <span>🏏</span>
          <div>
            <strong>HAND CRICKET</strong>
            <small>THE DIGITAL CRICKET ARENA</small>
          </div>
        </div>

        <div className="camera-setup-connection">
          <span className={connected ? "online" : ""} />
          {connected ? "SERVER CONNECTED" : "SERVER DISCONNECTED"}
        </div>
      </header>

      <section className="camera-setup-content">
        <div className="camera-setup-heading">
          <span>ROOM {room.roomCode}</span>
          <h1>CONNECT WITH YOUR OPPONENT.</h1>
          <p>
            Enable your camera on both devices to establish the live video connection.
          </p>
        </div>

        <div className="camera-setup-grid">
          <article className="camera-setup-card">
            <div className="camera-setup-card-heading">
              <div>
                <span>YOUR CAMERA</span>
                <h2>{myPlayer?.name || "You"}</h2>
                <p>{myPlayer?.teamName || "Your team"}</p>
              </div>

              <span className={`camera-setup-status ${cameraEnabled ? "active" : ""}`}>
                {cameraEnabled ? "CAMERA ON" : "NOT CONNECTED"}
              </span>
            </div>

            <div className="camera-setup-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={cameraEnabled ? "visible" : ""}
              />

              {!cameraEnabled && (
                <div className="camera-setup-placeholder">
                  {cameraStatus === "requesting" ? (
                    <RefreshCw size={36} className="camera-setup-spinner" />
                  ) : (
                    <Camera size={38} />
                  )}
                  <strong>
                    {cameraStatus === "requesting" ? "CONNECTING CAMERA..." : "CAMERA PREVIEW"}
                  </strong>
                  <span>
                    {cameraStatus === "requesting"
                      ? "Please allow camera access."
                      : "Enable your camera to start."}
                  </span>
                </div>
              )}
            </div>

            <div className="camera-setup-card-footer">
              {cameraEnabled ? (
                <button
                  type="button"
                  className="camera-setup-button secondary"
                  onClick={stopCamera}
                >
                  <CameraOff size={17} />
                  TURN OFF CAMERA
                </button>
              ) : (
                <button
                  type="button"
                  className="camera-setup-button primary"
                  onClick={enableCamera}
                  disabled={cameraStatus === "requesting" || !connected}
                >
                  <Camera size={17} />
                  {cameraStatus === "requesting" ? "CONNECTING..." : "ENABLE MY CAMERA"}
                </button>
              )}
            </div>

            {cameraError && <p className="camera-setup-error">{cameraError}</p>}
          </article>

          <article className="camera-setup-card">
            <div className="camera-setup-card-heading">
              <div>
                <span>OPPONENT CAMERA</span>
                <h2>{opponent?.name || "Opponent"}</h2>
                <p>{opponent?.teamName || "Opponent's team"}</p>
              </div>

              <span className={`camera-setup-status ${remoteConnected ? "active" : ""}`}>
                {remoteConnected ? "VIDEO CONNECTED" : "CONNECTING"}
              </span>
            </div>

            <div className="camera-setup-video opponent">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={remoteConnected ? "visible" : ""}
              />

              {!remoteConnected && (
                <div className="camera-setup-placeholder">
                  <UserRound size={42} />
                  <strong>
                    {peerStatus === "failed"
                      ? "CONNECTION FAILED"
                      : "WAITING FOR OPPONENT VIDEO"}
                  </strong>
                  <span>
                    {peerStatus === "failed"
                      ? "Check your network and retry the camera connection."
                      : cameraEnabled
                        ? "Keep your camera on while your opponent connects."
                        : "Your opponent's live video will appear here."}
                  </span>
                </div>
              )}
            </div>

            <div className="camera-setup-card-footer">
              <div className="camera-setup-waiting">
                <span className={remoteConnected ? "connected" : ""} />
                {remoteConnected
                  ? "LIVE VIDEO CONNECTION ACTIVE"
                  : peerStatus === "connecting"
                    ? "ESTABLISHING VIDEO CONNECTION..."
                    : peerStatus === "failed"
                      ? "VIDEO CONNECTION FAILED"
                      : "WAITING FOR VIDEO CONNECTION"}
              </div>
            </div>
          </article>
        </div>

        <div className="camera-setup-information">
          <ShieldCheck size={19} />
          <div>
            <strong>LIVE CAMERA CONNECTION</strong>
            <p>
              Video is transmitted directly between the two players using WebRTC.
              Keep both browser tabs open during connection.
            </p>
          </div>
        </div>

        {remoteConnected && (
          <div className="camera-setup-success">
            <CheckCircle2 size={19} />
            Your opponent's camera is connected successfully.
          </div>
        )}

        <div className="camera-setup-network">
          <Wifi size={16} />
          <span>VIDEO STATUS: {peerStatus.toUpperCase()}</span>
        </div>

        <div className="camera-setup-actions">
          <button type="button" className="camera-setup-leave" onClick={handleLeave}>
            <LogOut size={17} />
            LEAVE ROOM
          </button>
        </div>
      </section>
    </main>
  );
}
