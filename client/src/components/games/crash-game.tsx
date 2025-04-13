import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { 
  formatCurrency, 
  calculateCrashDuration,
  getCrashColorClass 
} from "@/lib/gameLogic";

interface CrashGameState {
  status: 'waiting' | 'in-progress' | 'crashed';
  crashPoint?: number;
  startTime?: number;
  countdown?: number;
}

interface CrashGameProps {
  className?: string;
}

export function CrashGame({ className }: CrashGameProps) {
  // State
  const [betAmount, setBetAmount] = useState<number>(100);
  const [autoCashout, setAutoCashout] = useState<number>(2);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'in-progress' | 'crashed'>('waiting');
  const [countdown, setCountdown] = useState<number>(5);
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [isCashingOut, setIsCashingOut] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [previousResults, setPreviousResults] = useState<number[]>([1.92, 2.43, 3.71, 1.00, 7.59, 2.34, 1.42, 4.20, 2.77, 1.19]);
  const animationRef = useRef<number>();
  
  // Hooks
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current game state
  const { data: gameStateData, refetch: refetchGameState } = useQuery<{ state: CrashGameState }>({
    queryKey: ['/api/games/crash/state'],
    refetchInterval: 1000, // Poll every second
  });
  
  // Bet mutation
  const betMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/crash/bet", {
        betAmount,
        autoPayoutMultiplier: autoCashout
      });
      return response.json();
    },
    onSuccess: (data) => {
      setHasBet(true);
      updateBalance(balance - betAmount);
      toast({
        title: "Bet Placed",
        description: `You've placed a bet of ${formatCurrency(betAmount)}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to place bet: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  // Cashout mutation
  const cashoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/crash/cashout", {
        betAmount,
        currentMultiplier
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCashedOut(true);
      updateBalance(balance + data.payout);
      toast({
        title: "Cash Out Successful",
        description: `You've won ${formatCurrency(data.payout)}!`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cash out: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle auto cashout
  useEffect(() => {
    if (gamePhase === 'in-progress' && hasBet && !cashedOut && currentMultiplier >= autoCashout) {
      cashoutMutation.mutate();
    }
  }, [currentMultiplier, autoCashout, gamePhase, hasBet, cashedOut]);
  
  // Handle game state changes
  useEffect(() => {
    if (gameStateData?.state) {
      const { status, crashPoint: serverCrashPoint, startTime, countdown: serverCountdown } = gameStateData.state;
      
      // Update game phase
      setGamePhase(status);
      
      // Handle waiting phase
      if (status === 'waiting') {
        setCurrentMultiplier(1);
        setCrashPoint(null);
        setCountdown(serverCountdown || 5);
        
        // Reset bet state for new round
        setHasBet(false);
        setCashedOut(false);
      }
      
      // Handle in-progress phase
      if (status === 'in-progress' && serverCrashPoint) {
        setCrashPoint(serverCrashPoint);
        
        // Start animation if not already running
        if (!animationRef.current) {
          const startTime = Date.now();
          const duration = calculateCrashDuration(serverCrashPoint);
          
          const animateCrash = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // Calculate current multiplier using easing function
            // This creates an exponential curve that matches the crash point
            const easedProgress = Math.pow(progress, 2);
            const multiplier = 1 + (serverCrashPoint - 1) * easedProgress;
            
            setCurrentMultiplier(multiplier);
            
            // Stop animation if we reached the crash point
            if (progress < 1) {
              animationRef.current = requestAnimationFrame(animateCrash);
            } else {
              // Game crashed
              setGamePhase('crashed');
              
              // Add to previous results
              setPreviousResults(prev => [serverCrashPoint, ...prev.slice(0, 9)]);
              
              // Clean up animation
              cancelAnimationFrame(animationRef.current!);
              animationRef.current = undefined;
            }
          };
          
          animationRef.current = requestAnimationFrame(animateCrash);
        }
      }
    }
  }, [gameStateData]);
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gamePhase === 'waiting' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => Math.max(0, c - 1));
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gamePhase, countdown]);
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    } else {
      setBetAmount(0);
    }
  };
  
  // Handle auto cashout change
  const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setAutoCashout(value);
    } else {
      setAutoCashout(1);
    }
  };
  
  // Place bet handler
  const handlePlaceBet = () => {
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
    
    betMutation.mutate();
  };
  
  // Cash out handler
  const handleCashout = () => {
    if (!hasBet || cashedOut) return;
    cashoutMutation.mutate();
  };
  
  // Bet amount quick buttons
  const handleHalfBet = () => {
    setBetAmount(prev => prev / 2);
  };
  
  const handleDoubleBet = () => {
    setBetAmount(prev => prev * 2);
  };
  
  const handleMaxBet = () => {
    setBetAmount(balance);
  };
  
  return (
    <Card className="bg-primary-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Game visualization area */}
        <div className="lg:col-span-2 p-6 relative h-80 lg:h-[500px] border-b lg:border-b-0 lg:border-r border-primary-700">
          <div className="h-full flex items-center justify-center relative">
            {/* Game chart visualization */}
            <div className="absolute bottom-0 left-0 right-0 h-[80%]">
              {/* Chart grid lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`row-${i}`} className="border-t border-primary-700"></div>
                ))}
                
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`col-${i}`} className="border-l border-primary-700 h-full"></div>
                ))}
              </div>
              
              {/* Game chart line */}
              {gamePhase === 'in-progress' && (
                <div 
                  className="absolute left-0 bottom-0 h-[70%] w-[60%]"
                  style={{
                    width: `${Math.min(80, (currentMultiplier - 1) * 20)}%`,
                    height: `${Math.min(80, (currentMultiplier - 1) * 20)}%`
                  }}
                >
                  <svg className="w-full h-full overflow-visible">
                    <path 
                      d={`M0,100 Q${25 * currentMultiplier},${80 / currentMultiplier} ${50 * currentMultiplier},${60 / currentMultiplier} T${100 * currentMultiplier},${30 / currentMultiplier} T${150 * currentMultiplier},${15 / currentMultiplier}`} 
                      fill="none" 
                      stroke="#805AD5" 
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              )}
              
              {/* Crash rocket */}
              {gamePhase === 'in-progress' && (
                <div 
                  className={`crash-rocket absolute transition-all duration-200 ease-out ${gamePhase === 'crashed' ? 'crashed' : ''}`}
                  style={{
                    left: `${Math.min(80, (currentMultiplier - 1) * 20)}%`,
                    bottom: `${Math.min(80, (currentMultiplier - 1) * 20)}%`
                  }}
                >
                  <div className={`bg-gradient-to-br p-2 rounded-xl shadow-lg ${getCrashColorClass(currentMultiplier)}`}>
                    <div className="text-center font-mono font-bold text-white text-xl">
                      {currentMultiplier.toFixed(2)}x
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Game status overlay */}
            {gamePhase === 'waiting' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-accent-purple/10 backdrop-blur-sm rounded-xl p-8">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">PREPARING NEXT ROUND</h3>
                  <div className="text-sm text-neutral-300 mb-4">Starting in <span className="font-mono">{countdown}s</span></div>
                  <div className="animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6 text-accent-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            {gamePhase === 'crashed' && !cashoutMutation.isPending && !cashedOut && hasBet && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-status-error/20 backdrop-blur-sm rounded-xl p-8">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">CRASHED AT {crashPoint?.toFixed(2)}x</h3>
                  <div className="text-sm text-neutral-300 mb-4">Better luck next time!</div>
                </div>
              </div>
            )}
            
            {cashedOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-status-success/20 backdrop-blur-sm rounded-xl p-8">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">CASHED OUT AT {currentMultiplier.toFixed(2)}x</h3>
                  <div className="text-sm text-status-success mb-4">
                    You won {formatCurrency(betAmount * currentMultiplier)}!
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Game info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-primary-700/80 backdrop-blur-sm p-3 flex justify-between">
            <div className="flex space-x-6">
              <div>
                <div className="text-xs text-neutral-400">Previous Crash</div>
                <div className="font-mono font-medium text-white">
                  {previousResults[0]?.toFixed(2)}x
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400">Players</div>
                <div className="font-mono font-medium text-white">124</div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-neutral-400">Total Wagered</div>
              <div className="font-mono font-medium text-white">45,890.65</div>
            </div>
          </div>
        </div>
        
        {/* Betting controls */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Place Your Bet</h3>
            
            {/* Bet amount input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-400 mb-1">Bet Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="10"
                  className="bg-primary-700 border border-primary-700 focus:border-accent-purple outline-none text-white font-mono"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  disabled={hasBet || gamePhase !== 'waiting'}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="flex space-x-1">
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleHalfBet}
                      disabled={hasBet || gamePhase !== 'waiting'}
                    >
                      ½
                    </button>
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleDoubleBet}
                      disabled={hasBet || gamePhase !== 'waiting'}
                    >
                      2×
                    </button>
                    <button 
                      className="text-neutral-400 hover:text-white text-xs bg-primary-800 rounded px-1"
                      onClick={handleMaxBet}
                      disabled={hasBet || gamePhase !== 'waiting'}
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auto cash out input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-400 mb-1">Auto Cash Out (Multiplier)</label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  className="bg-primary-700 border border-primary-700 focus:border-accent-purple outline-none text-white font-mono"
                  value={autoCashout}
                  onChange={handleAutoCashoutChange}
                  disabled={hasBet || gamePhase !== 'waiting'}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-neutral-400">×</span>
                </div>
              </div>
            </div>
            
            {/* Place bet/cashout button */}
            {!hasBet ? (
              <Button 
                className="w-full bg-accent-purple hover:bg-accent-purple/80 text-white py-6 mt-4"
                onClick={handlePlaceBet}
                disabled={betMutation.isPending || gamePhase !== 'waiting' || balance < betAmount}
              >
                {betMutation.isPending ? "Placing Bet..." : "Place Bet"}
              </Button>
            ) : (
              <Button 
                className={`w-full ${cashedOut ? 'bg-green-500' : 'bg-status-error'} hover:bg-opacity-80 text-white py-6 mt-4`}
                onClick={handleCashout}
                disabled={cashoutMutation.isPending || gamePhase !== 'in-progress' || cashedOut}
              >
                {cashedOut ? 'Cashed Out' : cashoutMutation.isPending ? 'Cashing Out...' : `Cash Out (${currentMultiplier.toFixed(2)}x)`}
              </Button>
            )}
            
            {gamePhase === 'in-progress' && hasBet && !cashedOut && (
              <div className="mt-2 text-center text-sm text-neutral-400">
                Auto cashout at {autoCashout.toFixed(2)}x
              </div>
            )}
          </div>
          
          {/* Previous rounds */}
          <div>
            <h3 className="text-sm font-medium text-neutral-400 mb-3">Previous Results</h3>
            <div className="flex flex-wrap gap-2">
              {previousResults.map((result, index) => (
                <Badge
                  key={index}
                  variant={result < 2 ? "error" : "purple"}
                  className="w-12 h-8 flex items-center justify-center text-xs font-mono"
                >
                  {result.toFixed(2)}×
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
