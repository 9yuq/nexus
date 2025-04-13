import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { 
  formatCurrency, 
  calculateDiceWinProbability,
  calculateDiceMultiplier
} from "@/lib/gameLogic";
import { motion } from "framer-motion";

interface DiceGameProps {
  className?: string;
}

export function DiceGame({ className }: DiceGameProps) {
  // State
  const [betAmount, setBetAmount] = useState<number>(50);
  const [prediction, setPrediction] = useState<number>(48);
  const [isUnder, setIsUnder] = useState<boolean>(true);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  
  // Hooks
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();
  
  // Calculate win chance and multiplier based on prediction and mode
  const winChance = calculateDiceWinProbability(prediction, isUnder);
  const multiplier = calculateDiceMultiplier(prediction, isUnder);
  
  // Roll mutation
  const rollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/dice/roll", {
        betAmount,
        prediction,
        isUnder
      });
      return response.json();
    },
    onMutate: () => {
      setIsRolling(true);
      // Simulated rolling animation
      setTimeout(() => {
        setIsRolling(false);
      }, 1000);
    },
    onSuccess: (data) => {
      updateBalance(data.newBalance);
      setResult(data.roll);
      setWon(data.won);
      
      if (data.won) {
        toast({
          title: "You Won!",
          description: `You rolled ${data.roll} and won ${formatCurrency(data.payout)}!`,
          variant: "default",
        });
      } else {
        toast({
          title: "You Lost",
          description: `You rolled ${data.roll} and lost ${formatCurrency(betAmount)}.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsRolling(false);
      toast({
        title: "Error",
        description: `Failed to roll: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    } else {
      setBetAmount(0);
    }
  };
  
  // Handle prediction slider change
  const handlePredictionChange = (values: number[]) => {
    setPrediction(values[0]);
  };
  
  // Toggle between under and over
  const toggleMode = (mode: 'under' | 'over') => {
    setIsUnder(mode === 'under');
  };
  
  // Bet amount quick buttons
  const handleHalfBet = () => {
    setBetAmount(prev => prev / 2);
  };
  
  const handleDoubleBet = () => {
    setBetAmount(prev => prev * 2);
  };
  
  // Roll handler
  const handleRoll = () => {
    if (betAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to place this bet.",
        variant: "destructive",
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount.",
        variant: "destructive",
      });
      return;
    }
    
    rollMutation.mutate();
  };
  
  // Visual representation of a dice with specified number
  const renderDice = (number: number | null) => {
    if (number === null) number = 1;
    
    // Map dice number to dot positions
    // Each position is either true (show dot) or false (no dot)
    const dotPositions = {
      1: [false, false, false, false, true, false, false, false, false],
      2: [true, false, false, false, false, false, false, false, true],
      3: [true, false, false, false, true, false, false, false, true],
      4: [true, false, true, false, false, false, true, false, true],
      5: [true, false, true, false, true, false, true, false, true],
      6: [true, false, true, true, false, true, true, false, true]
    };
    
    // Convert 1-100 to 1-6 for visualization
    const diceValue = Math.min(6, Math.max(1, Math.ceil(number / 16.67)));
    const positions = dotPositions[diceValue as keyof typeof dotPositions];
    
    return (
      <div className="w-24 h-24 bg-primary-700 rounded-xl shadow-lg flex items-center justify-center dice-roll">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-16 h-16">
          {positions.map((hasDot, i) => (
            <div 
              key={i}
              className={`${hasDot ? 'bg-white rounded-full' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="bg-primary-800 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-primary-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Dice</h3>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Dice visualization */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="dice-container">
              <motion.div
                animate={isRolling ? {
                  rotate: [0, 360, 720, 1080],
                  scale: [1, 1.2, 0.8, 1]
                } : {}}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                {renderDice(result)}
              </motion.div>
              
              {result !== null && (
                <div className="mt-4 text-center">
                  <span className={`font-mono text-lg font-bold ${won ? 'text-status-success' : 'text-status-error'}`}>
                    {result}
                  </span>
                  <p className="text-sm text-neutral-400 mt-1">
                    {won ? 'You won!' : 'You lost!'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Dice controls */}
          <div className="flex-1">
            {/* Roll type selector */}
            <div className="flex border border-primary-700 rounded-lg overflow-hidden mb-4">
              <button 
                className={`flex-1 ${isUnder ? 'bg-primary-900 text-white' : 'bg-primary-700 text-neutral-400'} text-sm py-2 font-medium`}
                onClick={() => toggleMode('under')}
              >
                Under
              </button>
              <button 
                className={`flex-1 ${!isUnder ? 'bg-primary-900 text-white' : 'bg-primary-700 text-neutral-400'} text-sm py-2 font-medium`}
                onClick={() => toggleMode('over')}
              >
                Over
              </button>
            </div>
            
            {/* Roll value slider */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-neutral-400">
                  Roll {isUnder ? 'Under' : 'Over'}: <span className="text-white">{prediction}</span>
                </span>
                <span className="text-sm text-neutral-400">
                  Win Chance: <span className="text-white">{winChance}%</span>
                </span>
              </div>
              <div className="py-4">
                <Slider
                  defaultValue={[48]}
                  value={[prediction]}
                  min={2}
                  max={98}
                  step={1}
                  onValueChange={handlePredictionChange}
                  className="accent-accent-teal"
                />
              </div>
            </div>
            
            {/* Bet amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-400 mb-1">Bet Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="10"
                  className="bg-primary-700 border border-primary-700 focus:border-accent-teal outline-none text-white font-mono"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="flex space-x-1">
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleHalfBet}
                    >
                      ½
                    </button>
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleDoubleBet}
                    >
                      2×
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payout multiplier */}
            <div className="mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-400">Payout Multiplier</span>
                <span className="text-sm font-mono text-white">{multiplier.toFixed(2)}×</span>
              </div>
            </div>
            
            {/* Roll button */}
            <Button 
              className="w-full bg-accent-teal hover:bg-accent-teal/80 text-white py-6"
              onClick={handleRoll}
              disabled={rollMutation.isPending || isRolling || balance < betAmount}
            >
              {rollMutation.isPending || isRolling ? "Rolling..." : "Roll Dice"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
