import { Check, Lock } from "lucide-react";

interface ProgressTrackerProps {
  currentLevel: number;
  totalLevels: number;
}

const ProgressTracker = ({ currentLevel, totalLevels }: ProgressTrackerProps) => {
  return (
    <div className="fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-primary/30 shadow-lg">
      <h3 className="text-sm font-bold text-primary mb-3">Progress</h3>
      <div className="flex gap-2">
        {Array.from({ length: totalLevels }, (_, i) => {
          const level = i + 1;
          const isCompleted = level < currentLevel;
          const isCurrent = level === currentLevel;
          
          return (
            <div
              key={level}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isCurrent
                  ? 'bg-primary/20 border-primary text-primary animate-pulse'
                  : 'bg-muted border-muted-foreground/20 text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : isCurrent ? (
                <span className="font-bold">{level}</span>
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
