import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { 
  formatCurrency,
  SLOT_SYMBOLS
} from "@/lib/gameLogic";

interface SlotsGameProps {
  className?: string;
}

export function SlotsGame({ className }: SlotsGameProps) {
  // State
  const [betAmount, setBetAmount] = useState<number>(25);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [reels, setReels] = useState<number[]>([0, 0, 0]);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();
  
  // Spin mutation
  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/slots/spin", {
        betAmount
      });
      return response.json();
    },
    onMutate: () => {
      setIsSpinning(true);
      setHasWon(false);
      setWinAmount(0);
      
      // Simulate spinning animation
      const spinDuration = 1500; // 1.5 seconds
      const startTime = Date.now();
      
      const animateSpin = () => {
        if (Date.now() - startTime < spinDuration) {
          setReels([
            Math.floor(Math.random() * SLOT_SYMBOLS.length),
            Math.floor(Math.random() * SLOT_SYMBOLS.length),
            Math.floor(Math.random() * SLOT_SYMBOLS.length)
          ]);
          
          spinTimerRef.current = setTimeout(animateSpin, 100);
        }
      };
      
      animateSpin();
    },
    onSuccess: (data) => {
      // Stop animation and show results
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
      
      setTimeout(() => {
        setReels(data.reels);
        setIsSpinning(false);
        updateBalance(data.newBalance);
        
        if (data.won) {
          setHasWon(true);
          setWinAmount(data.payout);
          
          toast({
            title: "You Won!",
            description: `You've won ${formatCurrency(data.payout)}!`,
            variant: "default",
          });
        } else {
          toast({
            title: "No Luck This Time",
            description: `Try again for a chance to win!`,
            variant: "destructive",
          });
        }
        
        // Auto spin if enabled
        if (autoSpin && data.newBalance >= betAmount) {
          setTimeout(() => {
            handleSpin();
          }, 1000);
        }
      }, 1500); // Show final result after 1.5s
    },
    onError: (error) => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
      
      setIsSpinning(false);
      
      toast({
        title: "Error",
        description: `Failed to spin: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, []);
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    } else {
      setBetAmount(0);
    }
  };
  
  // Bet amount quick buttons
  const handleHalfBet = () => {
    setBetAmount(prev => prev / 2);
  };
  
  const handleDoubleBet = () => {
    setBetAmount(prev => prev * 2);
  };
  
  // Handle spin
  const handleSpin = () => {
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
    
    spinMutation.mutate();
  };
  
  // Render a slot symbol
  const renderSlotSymbol = (symbolId: number) => {
    const symbol = SLOT_SYMBOLS[symbolId];
    
    return (
      <div className={`w-14 h-14 ${symbol.color} rounded-lg flex items-center justify-center ${symbol.textColor} text-2xl`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {symbol.icon === "gem" && (
            <>
              <polygon points="16 2 8 2 2 8 2 16 8 22 16 22 22 16 22 8"></polygon>
              <line x1="12" y1="30" x2="12" y2="6"></line>
              <line x1="30" y1="12" x2="6" y2="12"></line>
            </>
          )}
          {symbol.icon === "crown" && (
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
          )}
          {symbol.icon === "diamond" && (
            <polygon points="12 2 22 12 12 22 2 12"></polygon>
          )}
          {symbol.icon === "star" && (
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          )}
          {symbol.icon === "rocket" && (
            <>
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
            </>
          )}
        </svg>
      </div>
    );
  };
  
  return (
    <Card className="bg-primary-800 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-primary-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Slots</h3>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Slots visualization */}
          <div className="flex-1 flex items-center justify-center">
            <div className={`grid grid-cols-3 gap-2 bg-primary-900 p-4 rounded-lg ${isSpinning ? 'animate-pulse' : ''}`}>
              {reels.map((symbolId, index) => (
                <div key={index} className="h-32 bg-primary-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className={`flex flex-col items-center justify-center gap-2 ${isSpinning ? 'slot-spin' : ''}`}>
                    {renderSlotSymbol(symbolId)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Slots controls */}
          <div className="flex-1">
            {/* Bet amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-400 mb-1">Bet Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="5"
                  className="bg-primary-700 border border-primary-700 focus:border-accent-orange outline-none text-white font-mono"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  disabled={isSpinning}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="flex space-x-1">
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleHalfBet}
                      disabled={isSpinning}
                    >
                      ½
                    </button>
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleDoubleBet}
                      disabled={isSpinning}
                    >
                      2×
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auto spin */}
            <div className="mb-4 flex items-center">
              <Switch
                id="auto-spin"
                checked={autoSpin}
                onCheckedChange={setAutoSpin}
                disabled={isSpinning}
              />
              <Label
                htmlFor="auto-spin"
                className="ml-2 text-sm text-neutral-300"
              >
                Auto Spin
              </Label>
            </div>
            
            {/* Potential winnings */}
            <div className="mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-400">Potential Win</span>
                <span className="text-sm font-mono text-white">up to {formatCurrency(betAmount * 10)}</span>
              </div>
            </div>
            
            {/* Win display */}
            {hasWon && (
              <div className="mb-4 p-3 bg-accent-orange/20 rounded-lg text-center">
                <span className="text-sm text-neutral-300">You Won</span>
                <div className="text-2xl font-mono font-bold text-status-success mt-1">
                  {formatCurrency(winAmount)}
                </div>
              </div>
            )}
            
            {/* Spin button */}
            <Button 
              className="w-full bg-accent-orange hover:bg-accent-orange/80 text-white py-6"
              onClick={handleSpin}
              disabled={spinMutation.isPending || isSpinning || balance < betAmount}
            >
              {spinMutation.isPending || isSpinning ? "Spinning..." : "Spin"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
