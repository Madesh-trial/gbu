import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Sparkles, ChevronRight, Crown, Gem, Star } from "lucide-react";
import gsap from "gsap";

interface FinalTreasureProps {
  displayName: string;
  attempts: number;
  timeTaken: number;
  onViewLeaderboard: () => void;
  onPlaySound?: (sound: 'success') => void;
}

const FinalTreasure = ({ displayName, attempts, timeTaken, onViewLeaderboard, onPlaySound }: FinalTreasureProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Play success sound
    onPlaySound?.('success');

    // Create particle burst effect
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
    }));
    setParticles(newParticles);

    // Cinematic entrance animation
    if (cardRef.current && trophyRef.current) {
      const tl = gsap.timeline();
      
      tl.from(cardRef.current, {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
      .from(trophyRef.current, {
        scale: 0,
        rotation: -180,
        duration: 0.6,
        ease: "back.out(2)",
      }, "-=0.4")
      .to(trophyRef.current, {
        y: -10,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // Create continuous coin rain
    const interval = setInterval(() => {
      const newCoin = {
        id: Date.now() + Math.random(),
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
      };
      setParticles(prev => [...prev.slice(-40), newCoin]);
    }, 200);

    return () => clearInterval(interval);
  }, [onPlaySound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-background via-accent/5 to-background">
      {/* Radial glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-glow" />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 animate-particle-burst"
            style={{
              '--tx': `${particle.x}px`,
              '--ty': `${particle.y}px`,
            } as React.CSSProperties}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        ))}
      </div>

      {/* Floating gems */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <Gem
            key={i}
            className="absolute text-primary/40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <Card 
        ref={cardRef}
        className="relative z-10 max-w-2xl w-full p-8 md:p-12 bg-card/95 backdrop-blur-sm border-2 border-primary shadow-[0_0_80px_20px_rgba(255,215,0,0.4)]"
      >
        <div className="text-center space-y-6">
          {/* Trophy with crown */}
          <div 
            ref={trophyRef}
            className="relative inline-flex items-center justify-center w-32 h-32 mb-4"
          >
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-glow" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center border-4 border-primary/50">
              <Trophy className="w-12 h-12 text-background drop-shadow-lg" />
            </div>
            <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 text-primary animate-shimmer" />
            <Star className="absolute -right-2 top-8 w-6 h-6 text-primary animate-float" />
            <Star className="absolute -left-2 top-8 w-6 h-6 text-primary animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer">
              All Secrets Unlocked!
            </h1>
            <p className="text-2xl text-primary/90 font-semibold">
              🎉 Congratulations, {displayName}! 🎉
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-lg p-6 space-y-3 border border-primary/30">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Total Attempts:
              </span>
              <span className="font-bold text-primary text-2xl">{attempts}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Time Taken:
              </span>
              <span className="font-bold text-primary text-2xl">{formatTime(timeTaken)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-lg text-foreground/90 max-w-md mx-auto">
              🏆 You've conquered all <span className="text-primary font-bold">five legendary treasure chests</span>!
            </p>
            <p className="text-foreground/80 max-w-md mx-auto">
              Your name has been immortalized in the <span className="text-primary font-semibold">Hall of Fame</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={onViewLeaderboard}
              size="lg"
              className="bg-gradient-to-r from-primary via-accent to-primary hover:shadow-[0_0_40px_10px_rgba(255,215,0,0.6)] text-background font-bold text-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Sparkles className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">View Hall of Fame</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinalTreasure;
