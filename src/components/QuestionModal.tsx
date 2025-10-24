import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer: string;
  hint: string;
  hint_password: string;
  clues?: string[];
}

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onCorrect: () => void;
  onClose?: () => void;
  onPlaySound?: (sound: "unlock" | "error" | "coin") => void;
  levelNumber: number;
}

const QuestionModal = ({
  question,
  isOpen,
  onCorrect,
  onClose,
  onPlaySound,
  levelNumber,
}: QuestionModalProps) => {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showHintPasswordDialog, setShowHintPasswordDialog] = useState(false);
  const [hintPasswordInput, setHintPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = (open: boolean) => {
    // Close the modal when X button is clicked
    if (!open) {
      setAnswer("");
      setAttempts(0);
      setShowHint(false);
      setHintPasswordInput("");
      onClose?.();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAnswer("");
      setAttempts(0);
      setShowHint(false);
      setHintPasswordInput("");
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsSubmitting(true);

    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = question?.answer.toLowerCase() || "";

    if (userAnswer === correctAnswer) {
      onPlaySound?.("unlock");

      // Success animation
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          scale: 1.1,
          duration: 0.2,
        });
        gsap.to(contentRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          delay: 0.2,
          ease: "back.in",
        });
      }

      toast.success("🎉 Correct! Moving to next level...", {
        icon: <Key className="w-5 h-5" />,
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onCorrect();
      }, 800);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      onPlaySound?.("error");

      // Shake animation for wrong answer
      if (contentRef.current) {
        gsap
          .timeline()
          .to(contentRef.current, {
            x: -10,
            duration: 0.05,
          })
          .to(contentRef.current, {
            x: 10,
            duration: 0.05,
          })
          .to(contentRef.current, {
            x: -10,
            duration: 0.05,
          })
          .to(contentRef.current, {
            x: 0,
            duration: 0.05,
          });
      }

      if (newAttempts >= 2) {
        setShowHintPasswordDialog(true);
      }

      toast.error(`❌ Incorrect! Try again (Attempt ${newAttempts})`, {
        description:
          newAttempts >= 2 ? "💡 Click 'Get Hint' for help" : undefined,
      });

      setIsSubmitting(false);
    }
  };

  const handleUnlockHint = () => {
    if (!question) return;

    if (
      hintPasswordInput.trim().toLowerCase() ===
      question.hint_password.toLowerCase()
    ) {
      setShowHint(true);
      setShowHintPasswordDialog(false);
      setHintPasswordInput("");
      toast.success("💡 Hint unlocked!", {
        icon: <Lightbulb className="w-5 h-5" />,
      });
    } else {
      toast.error("❌ Incorrect hint password");
    }
  };

  if (!question) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-2xl w-[95vw] sm:w-full border border-primary/30 bg-card/95 backdrop-blur-sm text-foreground shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-h-[95vh] overflow-y-auto"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl text-primary font-black break-words">
              Level {levelNumber}: {question.question_text}
            </DialogTitle>
          </DialogHeader>

          <motion.div
            ref={contentRef}
            className="space-y-4 sm:space-y-6 py-4 sm:py-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {/* Question Clues Section */}
            {question.clues && question.clues.length > 0 && (
              <motion.div
                className="space-y-2 sm:space-y-3 p-3 sm:p-6 rounded-lg border border-amber-400/30 bg-amber-50/10 shadow-md"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className="text-xs sm:text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                  <span>🔍</span> Clues
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {question.clues.map((clue, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded bg-amber-50/20 border-l-3 border-amber-400"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <span className="text-amber-600 font-bold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}.
                      </span>
                      <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                        {clue}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Question Text */}
            <div className="p-3 sm:p-6 rounded-lg border border-primary/20 shadow-md bg-card/60">
              {/* Quick hint access - opens password dialog (requires correct password) */}
              {!showHint && (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHintPasswordDialog(true)}
                    className="border-primary/30 text-primary hover:bg-primary/10 text-xs sm:text-sm"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Get Hint
                  </Button>
                </div>
              )}
            </div>

            {/* Hint Section */}
            {showHint && (
              <motion.div
                className="bg-card/60 border-l-4 border-primary p-3 sm:p-4 rounded shadow-md"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-base text-foreground font-semibold">
                    {question.hint}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Answer Input */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-primary mb-2 block">
                  Your Answer
                </label>
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-lg py-4 sm:py-6 bg-input border-2 border-primary/30 focus:border-primary text-foreground"
                  autoComplete="off"
                />
              </div>

              {/* Attempts Counter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-semibold">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Attempts: {attempts}</span>
                </div>

                {attempts >= 2 && !showHint && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHintPasswordDialog(true)}
                    className="border-primary/30 text-primary hover:bg-primary/10 font-bold text-xs sm:text-sm"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Get Hint
                  </Button>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !answer.trim()}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground text-sm sm:text-lg py-4 sm:py-6 font-bold shadow-lg"
              >
                <Key className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Submit Answer
              </Button>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Hint Password Dialog */}
      <Dialog
        open={showHintPasswordDialog}
        onOpenChange={setShowHintPasswordDialog}
      >
        <DialogContent className="max-w-md w-[90vw] sm:w-full border border-primary/30 bg-card/95 backdrop-blur-sm text-foreground shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg sm:text-xl text-primary font-black">
              🔐 Unlock Hint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-base text-foreground font-semibold">
              Enter the hint password to reveal the hint for this level.
            </p>
            <Input
              type="password"
              placeholder="Enter hint password..."
              value={hintPasswordInput}
              onChange={(e) => setHintPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlockHint()}
              className="border-2 border-primary/30 focus:border-primary bg-input text-foreground text-sm"
              autoFocus
            />
            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowHintPasswordDialog(false);
                  setHintPasswordInput("");
                }}
                className="border-primary/30 text-primary hover:bg-primary/10 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnlockHint}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground font-bold text-xs sm:text-sm"
              >
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Unlock Hint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionModal;
