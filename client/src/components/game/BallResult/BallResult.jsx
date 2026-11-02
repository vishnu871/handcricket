
import { useEffect } from "react";
import { Trophy, Zap, Target, CircleDot } from "lucide-react";
import "./BallResult.css";

const resultContent = {
  0: {
    title: "DOT BALL!",
    description: "No runs scored!",
    icon: CircleDot,
    type: "dot",
  },
  1: {
    title: "ONE RUN!",
    description: "Quick single!",
    icon: Zap,
    type: "run",
  },
  2: {
    title: "TWO RUNS!",
    description: "Excellent running!",
    icon: Zap,
    type: "run",
  },
  3: {
    title: "THREE RUNS!",
    description: "Brilliant running between the wickets!",
    icon: Zap,
    type: "run",
  },
  4: {
    title: "FOUR!",
    description: "What a beautiful boundary!",
    icon: Target,
    type: "four",
  },
  5: {
    title: "FIVE RUNS!",
    description: "That's five runs!",
    icon: Zap,
    type: "run",
  },
  6: {
    title: "SIX!",
    description: "OUT OF THE PARK!",
    icon: Trophy,
    type: "six",
  },
  wicket: {
    title: "WICKET!",
    description: "The stumps are shattered!",
    icon: Trophy,
    type: "wicket",
  },
};

export default function BallResult({
  result,
  visible = false,
  onComplete,
  duration = 2200,
}) {
  const content = resultContent[result];

  useEffect(() => {
    if (!visible || !content) return;

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [visible, result, duration, onComplete, content]);

  if (!visible || !content) return null;

  const Icon = content.icon;

  return (
    <div className={`ball-result ball-result-${content.type}`} role="status" aria-live="assertive">
      <div className="ball-result-backdrop" />

      <div className="ball-result-content" key={String(result)}>
        <div className="ball-result-icon">
          <Icon size={38} strokeWidth={2.5} />
        </div>

        <span className="ball-result-overline">THE BALL RESULT</span>

        <div className="ball-result-value">
          {result === "wicket" ? "OUT!" : result}
        </div>

        <h2>{content.title}</h2>
        <p>{content.description}</p>

        <div className="ball-result-decoration">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
