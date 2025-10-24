import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface GameTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const GameTimer = ({
  durationMinutes,
  onTimeUp,
  isPaused = false,
}: GameTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 300; // Warning when 5 minutes or less
  const isCritical = timeLeft <= 60; // Critical when 1 minute or less

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isCritical
          ? "bg-red-500/20 text-red-400 animate-pulse"
          : isWarning
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-primary/20 text-primary"
      }`}
    >
      <Clock className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

export default GameTimer;
