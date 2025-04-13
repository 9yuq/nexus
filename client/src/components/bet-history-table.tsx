import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/gameLogic";
import { Skeleton } from "@/components/ui/skeleton";

interface BetHistoryProps {
  userId?: number;
  limit?: number;
}

interface BetHistoryItem {
  id: number;
  userId: number;
  username: string;
  gameType: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  createdAt: string;
}

export function BetHistoryTable({ userId, limit = 10 }: BetHistoryProps) {
  const { data: bets, isLoading } = useQuery<BetHistoryItem[]>({
    queryKey: userId ? [`/api/game-history?limit=${limit}`, userId] : [`/api/recent-bets?limit=${limit}`]
  });
  
  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "crash":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-purple mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17.8L17 13l-3 4-5-6-5 6"></path>
            <path d="M22 17.8V5c0-1-.8-2-2-2H4c-1 0-2 .9-2 2v13"></path>
          </svg>
        );
      case "dice":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-teal mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="15.5" r="1.5"></circle>
            <circle cx="8.5" cy="15.5" r="1.5"></circle>
          </svg>
        );
      case "slots":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-orange mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2"></rect>
            <line x1="8" y1="21" x2="8" y2="3"></line>
            <line x1="16" y1="21" x2="16" y2="3"></line>
            <circle cx="6" cy="9" r="2"></circle>
            <circle cx="18" cy="14" r="2"></circle>
            <circle cx="12" cy="8" r="2"></circle>
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getGameName = (gameType: string) => {
    switch (gameType) {
      case "crash": return "Crash";
      case "dice": return "Dice";
      case "slots": return "Slots";
      default: return gameType;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-primary-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-700">
            <thead className="bg-primary-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Game</th>
                {!userId && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Player</th>}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Wager</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Multiplier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {Array(5).fill(0).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24 bg-primary-700" />
                  </td>
                  {!userId && <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-20 bg-primary-700" />
                  </td>}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 bg-primary-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-12 bg-primary-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 bg-primary-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-primary-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-700">
          <thead className="bg-primary-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Game</th>
              {!userId && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Player</th>}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Wager</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Multiplier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-700 text-sm">
            {bets && bets.map((bet) => (
              <tr key={bet.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getGameIcon(bet.gameType)}
                    <span className="text-white">{getGameName(bet.gameType)}</span>
                  </div>
                </td>
                {!userId && <td className="px-6 py-4 whitespace-nowrap text-neutral-300">{bet.username}</td>}
                <td className="px-6 py-4 whitespace-nowrap font-mono text-white">{formatCurrency(bet.betAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-white">{bet.multiplier.toFixed(2)}×</td>
                <td className={`px-6 py-4 whitespace-nowrap font-mono ${bet.payout > 0 ? 'text-status-success' : 'text-status-error'}`}>
                  {bet.payout > 0 ? `+${formatCurrency(bet.payout)}` : `-${formatCurrency(bet.betAmount)}`}
                </td>
              </tr>
            ))}
            
            {bets && bets.length === 0 && (
              <tr>
                <td colSpan={userId ? 4 : 5} className="px-6 py-8 text-center text-neutral-400">
                  No bet history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
