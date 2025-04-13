import { createContext, useContext, useState, ReactNode } from "react";
import { GAME_TYPES } from "@/lib/gameLogic";

interface GameContextType {
  currentGame: string | null;
  setCurrentGame: (game: string | null) => void;
  previousResults: {
    [key: string]: number[];
  };
  addGameResult: (gameType: string, result: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [previousResults, setPreviousResults] = useState<{[key: string]: number[]}>({
    [GAME_TYPES.CRASH]: [1.92, 2.43, 3.71, 1.00, 7.59, 2.34, 1.42, 4.20, 2.77, 1.19],
    [GAME_TYPES.DICE]: [48, 23, 76, 92, 15, 33, 67, 88, 42, 51],
    [GAME_TYPES.SLOTS]: [2, 1, 0, 3, 2, 0, 1, 4, 2, 1]
  });
  
  // Add a new game result to the history
  const addGameResult = (gameType: string, result: number) => {
    setPreviousResults(prev => {
      const currentResults = prev[gameType] || [];
      return {
        ...prev,
        [gameType]: [result, ...currentResults.slice(0, 9)] // Keep only the last 10 results
      };
    });
  };
  
  return (
    <GameContext.Provider 
      value={{ 
        currentGame, 
        setCurrentGame,
        previousResults,
        addGameResult
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
