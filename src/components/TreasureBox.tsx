import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import treasureChest from "@/assets/treasure-chest.jpg";
import { Lock, Key, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer: string;
  hint: string;
  hint_password: string;
}

interface TreasureBoxProps {
  question: Question;
  level: number;
  isActive: boolean;
  onCorrect: () => void;
  scale: number;
  onPlaySound?: (sound: "unlock" | "error" | "coin") => void;
}

const TreasureBox = ({
  question,
  level,
  isActive,
  onCorrect,
  scale,
  onPlaySound,
}: TreasureBoxProps) => {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showHintPasswordDialog, setShowHintPasswordDialog] = useState(false);
  const [hintPasswordInput, setHintPasswordInput] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) return;

    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = question.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      setIsUnlocking(true);
      onPlaySound?.("unlock");

      // Key animation
      if (keyRef.current && cardRef.current) {
        const tl = gsap.timeline();

        tl.to(keyRef.current, {
          opacity: 1,
          scale: 1,
          rotation: 360,
          duration: 0.6,
          ease: "back.out(1.7)",
        })
          .to(keyRef.current, {
            x: 0,
            y: -50,
            duration: 0.4,
            ease: "power2.in",
          })
          .to(keyRef.current, {
            scale: 0,
            duration: 0.2,
          });
      }

      // Chest glow and particle burst
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          boxShadow: "0 0 60px 20px rgba(255, 215, 0, 0.8)",
          duration: 0.3,
          yoyo: true,
          repeat: 3,
        });
      }

      toast.success("Correct! The treasure chest unlocks...", {
        icon: <Key className="w-5 h-5" />,
      });

      setTimeout(() => {
        onPlaySound?.("coin");
        onCorrect();
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      onPlaySound?.("error");

      if (newAttempts >= 2) {
        setShowHintPasswordDialog(true);
      }

      toast.error("That's not quite right. Try again!", {
        description:
          newAttempts >= 2 ? "Need a hint? Click the lightbulb!" : undefined,
      });

      // GSAP shake animation
      if (cardRef.current) {
        gsap
          .timeline()
          .to(cardRef.current, {
            x: -10,
            duration: 0.1,
          })
          .to(cardRef.current, {
            x: 10,
            duration: 0.1,
          })
          .to(cardRef.current, {
            x: -10,
            duration: 0.1,
          })
          .to(cardRef.current, {
            x: 0,
            duration: 0.1,
          });
      }
    }
  };

  const handleUnlockHint = () => {
    if (
      hintPasswordInput.trim().toLowerCase() ===
      question.hint_password.toLowerCase()
    ) {
      setShowHint(true);
      setShowHintPasswordDialog(false);
      setHintPasswordInput("");
      toast.success("Hint unlocked!", {
        icon: <Lightbulb className="w-5 h-5" />,
      });
    } else {
      toast.error("Incorrect hint password");
    }
  };

  return (
    <div
      id={`chest-${level}`}
      className="transition-all duration-1000 ease-out"
      style={{
        transform: `scale(${scale})`,
        opacity: isActive ? 1 : 0.5,
      }}
    >
      <Card
        ref={cardRef}
        className={`relative overflow-hidden bg-card border-2 ${
          isActive
            ? "border-primary shadow-gold hover:shadow-[0_0_40px_10px_rgba(255,215,0,0.6)]"
            : "border-muted"
        } transition-all duration-500 group`}
      >
        {/* Floating key for animation */}
        <div
          ref={keyRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 scale-0"
        >
          <Key className="w-16 h-16 text-primary drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
        </div>

        {/* Chest Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={treasureChest}
            alt="Treasure Chest"
            className={`w-full h-full object-cover transition-all duration-500 ${
              isActive ? "animate-glow group-hover:scale-105" : "grayscale"
            }`}
          />

          {/* Sparkle overlay on hover */}
          {isActive && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {Array.from({ length: 6 }).map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-primary/60 animate-float"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Lock overlay */}
          {!isUnlocking && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center space-y-2">
                <Lock className="w-16 h-16 text-primary mx-auto animate-pulse" />
                <div className="text-sm font-bold text-primary">
                  Level {level}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clue Card */}
        {isActive && (
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary">
                Riddle {level}/5
              </h3>
              <p className="text-foreground/90">{question.question_text}</p>
            </div>

            {showHint && (
              <div className="p-3 bg-accent/20 border border-accent rounded-lg flex items-start gap-2 animate-fade-in">
                <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 animate-glow" />
                <p className="text-sm text-accent-foreground">
                  {question.hint}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="text-center text-lg"
                disabled={isUnlocking}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 hover:shadow-gold transition-all"
                  disabled={isUnlocking || !answer.trim()}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Unlock
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowHintPasswordDialog(true)}
                  className="border-accent text-accent hover:bg-accent/10"
                  title="Click to unlock hint with password"
                >
                  <Lightbulb className="w-5 h-5" />
                </Button>
              </div>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Attempts: {attempts}
            </div>
          </div>
        )}
      </Card>

      {/* Hint Password Dialog */}
      <Dialog
        open={showHintPasswordDialog}
        onOpenChange={setShowHintPasswordDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock Hint</DialogTitle>
            <DialogDescription>
              Enter the hint password to reveal the hint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter hint password..."
              value={hintPasswordInput}
              onChange={(e) => setHintPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlockHint()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowHintPasswordDialog(false);
                  setHintPasswordInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnlockHint}
                className="bg-primary hover:bg-primary/90"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Unlock Hint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreasureBox;
