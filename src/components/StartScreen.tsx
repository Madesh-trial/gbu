import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import treasureMap from "@/assets/treasure-map.jpg";
import { Sparkles, Trophy, Settings } from "lucide-react";

interface StartScreenProps {
  onStart: (name: string) => void;
  onViewLeaderboard: () => void;
}

const StartScreen = ({ onStart, onViewLeaderboard }: StartScreenProps) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleStart = () => {
    if (isAnonymous) {
      const anonymousName = `Seeker-${Math.floor(Math.random() * 10000)}`;
      onStart(anonymousName);
    } else if (displayName.trim()) {
      onStart(displayName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <img
          src={treasureMap}
          alt=""
          className="w-full h-full object-cover animate-float"
        />
      </div>

      {/* Admin Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <Button
          onClick={() => navigate("/admin")}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          title="Admin Panel"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <Card className="relative z-10 max-w-2xl w-full p-4 sm:p-8 md:p-12 bg-card/95 backdrop-blur-sm border-primary/30 shadow-chest">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-2 sm:mb-4 animate-glow">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-primary animate-shimmer">
            Treasure Quest
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Embark on an epic adventure to unlock five legendary treasure
            chests. Solve riddles, discover hidden treasures, and compete for
            glory on the leaderboard!
          </p>

          <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-foreground/80">
                Enter your name for the leaderboard (optional)
              </label>
              <Input
                type="text"
                placeholder="Your adventurer name..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isAnonymous}
                className="text-center text-sm sm:text-lg bg-input/50"
                maxLength={30}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <label
                htmlFor="anonymous"
                className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
              >
                Play anonymously
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button
                onClick={handleStart}
                disabled={!isAnonymous && !displayName.trim()}
                size="lg"
                className="px-6 sm:px-12 text-sm sm:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold"
              >
                Start Adventure
              </Button>

              <Button
                onClick={onViewLeaderboard}
                variant="outline"
                size="lg"
                className="px-6 sm:px-8 text-sm sm:text-lg font-bold border-primary/50 hover:bg-primary/10 hover:border-primary"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                View Leaderboard
              </Button>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Your name will appear on the public leaderboard when you complete
              all challenges
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StartScreen;
