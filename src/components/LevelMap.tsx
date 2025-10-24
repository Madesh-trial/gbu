import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ParallaxBackground from "./ParallaxBackground";

interface LevelNode {
  number: number;
  locked: boolean;
  completed: boolean;
  current: boolean;
}

interface LevelMapProps {
  currentLevel: number;
  totalLevels: number;
  completedLevels: number;
  onLevelClick?: (level: number) => void;
}

const LevelMap = ({
  currentLevel,
  totalLevels,
  completedLevels,
  onLevelClick,
}: LevelMapProps) => {
  const [levels, setLevels] = useState<LevelNode[]>([]);

  useEffect(() => {
    const newLevels = Array.from({ length: totalLevels }, (_, i) => ({
      number: i + 1,
      locked: i + 1 > currentLevel,
      completed: i + 1 < currentLevel,
      current: i + 1 === currentLevel,
    }));
    setLevels(newLevels);
  }, [currentLevel, totalLevels]);

  // Calculate vertical spacing based on screen size
  const getVerticalSpacing = () => {
    const isMobile = window.innerWidth < 768;
    const isLaptop = window.innerWidth >= 1024;
    return isMobile ? 150 : isLaptop ? 400 : 250;
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto p-2 sm:p-4 md:p-8 mt-24">
      {/* Brown background with moving particles */}
      <ParallaxBackground />

      {/* Container for Level Nodes */}
      <div
        className="relative w-full"
        style={{
          minHeight: `${
            window.innerWidth < 768
              ? 150 * totalLevels + 300
              : window.innerWidth >= 1024
              ? 400 * totalLevels + 400
              : 250 * totalLevels + 400
          }px`,
        }}
      >
        {/* Connecting lines between levels */}
        {levels.map((level, index) => {
          if (index === levels.length - 1) return null;

          const verticalSpacing = getVerticalSpacing();
          const isCompleted = index < currentLevel - 1;
          const lineColor = isCompleted ? "#f59e0b" : "#9ca3af";
          const lineOpacity = isCompleted ? "1" : "0.5";

          return (
            <motion.div
              key={`line-${index}`}
              style={{
                position: "absolute",
                left: "50%",
                top: `${
                  50 + (index + 1) * verticalSpacing - verticalSpacing / 2
                }px`,
                transform: "translateX(-50%)",
                width: "12px",
                background: `repeating-linear-gradient(
                  to bottom,
                  ${lineColor} 0px,
                  ${lineColor} 8px,
                  transparent 8px,
                  transparent 16px
                )`,
                opacity: lineOpacity,
                zIndex: 1,
                pointerEvents: "none",
              }}
              initial={{ height: "0px" }}
              animate={{ height: `${verticalSpacing}px` }}
              transition={{
                duration: isCompleted ? 1.5 : 0.3,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Level Nodes - Treasure Chests */}
        {levels.map((level, index) => {
          const verticalSpacing = getVerticalSpacing();
          const yPosition = 50 + index * verticalSpacing;

          return (
            <motion.div
              key={`level-${level.number}`}
              className="absolute left-1/2 z-20"
              style={{
                top: `${yPosition}px`,
                transform: "translateX(-50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              {/* Treasure Chest Container */}
              <motion.div
                className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 flex flex-col items-center justify-center font-bold text-base sm:text-lg md:text-2xl transition-all ${
                  level.current
                    ? "cursor-pointer drop-shadow-2xl"
                    : level.completed
                    ? "cursor-not-allowed drop-shadow-lg"
                    : "cursor-not-allowed drop-shadow-lg"
                }`}
                whileHover={level.current ? { scale: 1.1, y: -10 } : {}}
                whileTap={level.current ? { scale: 0.95, y: 5 } : {}}
                onClick={() => {
                  if (level.current && onLevelClick) {
                    onLevelClick(level.number);
                  }
                }}
                animate={
                  level.completed
                    ? {}
                    : level.current
                    ? { scale: [1, 1.08, 1] }
                    : {
                        scale: [1, 1.08, 1],
                      }
                }
              >
                {level.completed ? (
                  <>
                    {/* Glow effect background for completed chest */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/60 via-amber-400/60 to-yellow-400/60 blur-2xl z-0"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>

                    {/* Open chest image */}
                    <img
                      src="/open-chest.webp"
                      alt="Open chest"
                      className="w-full h-full object-contain z-10 drop-shadow-2xl"
                    />
                  </>
                ) : (
                  <>
                    {/* Closed chest image */}
                    <img
                      src="/closed-chest.webp"
                      alt="Closed chest"
                      className="w-full h-full object-contain z-10"
                    />
                  </>
                )}

                {/* Level Number Badge */}
                {/* Level Number Badge */}
                <div
                  className={`absolute text-nowrap z-30 text-xs sm:text-sm md:text-base font-bold
                  -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2
                  lg:left-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-24 lg:translate-x-0`}
                  style={{
                    color: level.locked
                      ? "#9ca3af"
                      : level.completed
                      ? "#eab308"
                      : "#f59e0b",
                  }}
                >
                  <span className="font-bold">{level.number}</span>
                </div>
              </motion.div>

              {/* Status Label */}
              {level.locked && (
                <p
                  className="text-center mt-8 sm:mt-10 md:mt-14 text-xs font-bold text-stone-600 uppercase tracking-wider
                  lg:text-center lg:mt-0 lg:absolute lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-20 lg:whitespace-nowrap lg:tracking-normal"
                >
                  Locked
                </p>
              )}
              {level.completed && (
                <p
                  className="text-center mt-8 sm:mt-10 md:mt-14 text-xs font-bold text-yellow-600 uppercase tracking-wider
                  lg:text-center lg:mt-0 lg:absolute lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-20 lg:whitespace-nowrap lg:tracking-normal"
                >
                  ✓ Completed
                </p>
              )}
              {level.current && (
                <p
                  className="text-center mt-8 sm:mt-10 md:mt-14 text-xs font-bold text-amber-600 uppercase tracking-wider animate-pulse
                  lg:text-center lg:mt-0 lg:absolute lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-20 lg:whitespace-nowrap lg:tracking-normal"
                >
                  → Solve Now
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;
