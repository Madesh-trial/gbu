import { useState, useEffect } from "react";
import StartScreen from "@/components/StartScreen";
import LevelMap from "@/components/LevelMap";
import QuestionModal from "@/components/QuestionModal";
import ProgressTracker from "@/components/ProgressTracker";
import FinalTreasure from "@/components/FinalTreasure";
import Leaderboard from "@/components/Leaderboard";
import ParallaxBackground from "@/components/ParallaxBackground";
import AudioToggle from "@/components/AudioToggle";
import GameTimer from "@/components/GameTimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer: string;
  hint: string;
  hint_password: string;
  clues?: string[];
}

type GameState = "start" | "playing" | "completed" | "leaderboard" | "loading";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("loading");
  const [displayName, setDisplayName] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameDurationMinutes, setGameDurationMinutes] = useState(30);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const {
    isMuted,
    toggleMute,
    playUnlockSound,
    playErrorSound,
    playCoinSound,
    playSuccessSound,
  } = useAudioPlayer();

  // Fetch questions from Supabase on mount
  useEffect(() => {
    const fetchQuestionsAndConfig = async () => {
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        if (questionsData && questionsData.length > 0) {
          setQuestions(questionsData);
        } else {
          toast.error("No questions found in database");
          setGameState("start");
          return;
        }

        // Fetch game duration from admin config
        const { data: adminConfigData, error: adminConfigError } =
          await supabase
            .from("admin_config")
            .select("game_duration_minutes")
            .limit(1)
            .single();

        if (!adminConfigError && adminConfigData) {
          const config = adminConfigData as unknown as {
            game_duration_minutes?: number;
          };
          if (config.game_duration_minutes) {
            setGameDurationMinutes(config.game_duration_minutes);
          }
        }

        // Check for session persistence
        const savedState = localStorage.getItem("treasureQuestState");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            if (parsed.gameState === "playing") {
              setGameState(parsed.gameState);
              setDisplayName(parsed.displayName);
              setCurrentLevel(parsed.currentLevel);
              setTotalAttempts(parsed.totalAttempts);
              setStartTime(parsed.startTime);
              return;
            }
          } catch (e) {
            console.error("Failed to parse saved state");
          }
        }

        setGameState("start");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load game data");
        setGameState("start");
      }
    };

    fetchQuestionsAndConfig();
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      localStorage.setItem(
        "treasureQuestState",
        JSON.stringify({
          gameState,
          displayName,
          currentLevel,
          totalAttempts,
          startTime,
        })
      );
    } else {
      localStorage.removeItem("treasureQuestState");
    }
  }, [gameState, displayName, currentLevel, totalAttempts, startTime]);

  const handlePlaySound = (sound: "unlock" | "error" | "coin" | "success") => {
    switch (sound) {
      case "unlock":
        playUnlockSound();
        break;
      case "error":
        playErrorSound();
        break;
      case "coin":
        playCoinSound();
        break;
      case "success":
        playSuccessSound();
        break;
    }
  };

  const handleTimeUp = () => {
    toast.error("Time's up! Game Over!");
    const endTime = Date.now();
    const timeInSeconds = Math.floor((endTime - startTime) / 1000);
    setTimeTaken(timeInSeconds);

    // Save to leaderboard
    saveToLeaderboard(timeInSeconds);

    playSuccessSound();
    setGameState("completed");
  };

  const handleStart = (name: string) => {
    setDisplayName(name);
    setGameState("playing");
    setStartTime(Date.now());
  };

  const handleCorrectAnswer = () => {
    if (currentLevel < questions.length) {
      setCurrentLevel(currentLevel + 1);
      setTotalAttempts(totalAttempts + 1);
    } else {
      // Completed all chests
      const endTime = Date.now();
      const timeInSeconds = Math.floor((endTime - startTime) / 1000);
      setTimeTaken(timeInSeconds);

      // Save to leaderboard
      saveToLeaderboard(timeInSeconds);

      setGameState("completed");
    }
  };

  const saveToLeaderboard = async (timeInSeconds: number) => {
    try {
      const { error } = await supabase.from("treasure_unlocks").insert({
        display_name: displayName,
        level: 5,
        attempts: totalAttempts + 1, // +1 for the final attempt
        time_taken: timeInSeconds,
      });

      if (error) throw error;

      toast.success("Your achievement has been recorded!");
    } catch (error) {
      console.error("Error saving to leaderboard:", error);
      toast.error("Failed to save to leaderboard");
    }
  };

  const handleViewLeaderboard = () => {
    setGameState("leaderboard");
  };

  const handleCloseLeaderboard = () => {
    // Reset game
    setGameState("start");
    setCurrentLevel(1);
    setTotalAttempts(0);
    setTimeTaken(0);
  };

  if (gameState === "loading") {
    return (
      <>
        <ParallaxBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </div>
      </>
    );
  }

  if (gameState === "start") {
    return (
      <StartScreen
        onStart={handleStart}
        onViewLeaderboard={handleViewLeaderboard}
      />
    );
  }

  if (gameState === "completed") {
    return (
      <>
        <ParallaxBackground />
        <AudioToggle isMuted={isMuted} onToggle={toggleMute} />
        <FinalTreasure
          displayName={displayName}
          attempts={totalAttempts}
          timeTaken={timeTaken}
          onViewLeaderboard={handleViewLeaderboard}
          onPlaySound={handlePlaySound}
        />
      </>
    );
  }

  if (gameState === "leaderboard") {
    return (
      <>
        <ParallaxBackground />
        <AudioToggle isMuted={isMuted} onToggle={toggleMute} />
        <Leaderboard
          onClose={handleCloseLeaderboard}
          currentUserName={displayName}
        />
      </>
    );
  }

  // Playing state - level map with modal questions
  const currentQuestion = questions[currentLevel - 1];
  const completedLevels = currentLevel - 1;

  return (
    <>
      <ParallaxBackground />
      <AudioToggle isMuted={isMuted} onToggle={toggleMute} />

      <div className="min-h-screen p-2 sm:p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Timer positioned better for mobile */}
        <div className="absolute top-16 sm:top-20 md:top-4 right-2 sm:right-4 md:right-16 z-50">
          <GameTimer
            durationMinutes={gameDurationMinutes}
            onTimeUp={handleTimeUp}
          />
        </div>

        <ProgressTracker
          currentLevel={currentLevel}
          totalLevels={questions.length}
        />

        <div className="flex-1 flex items-center justify-center w-full">
          <LevelMap
            currentLevel={currentLevel}
            totalLevels={questions.length}
            completedLevels={completedLevels}
            onLevelClick={(level) => {
              if (level === currentLevel) {
                setSelectedLevel(level);
              }
            }}
          />
        </div>

        <QuestionModal
          question={selectedLevel ? questions[selectedLevel - 1] : null}
          isOpen={selectedLevel !== null && selectedLevel === currentLevel}
          levelNumber={selectedLevel || currentLevel}
          onClose={() => setSelectedLevel(null)}
          onCorrect={() => {
            setSelectedLevel(null);
            handleCorrectAnswer();
          }}
          onPlaySound={handlePlaySound}
        />
      </div>
    </>
  );
};

export default Index;
