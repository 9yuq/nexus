import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SlotsGame } from "@/components/games/slots-game";
import { BetHistoryTable } from "@/components/bet-history-table";
import { useAuth } from "@/context/auth-context";

export default function Slots() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Slots Game</h1>
              <p className="text-neutral-400">Spin to win big rewards</p>
            </div>
            
            <button className="text-neutral-400 hover:text-white text-sm flex items-center">
              Game Rules
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
          <SlotsGame />
          
          <div className="mt-8">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Your Recent Slots Bets</h2>
            </div>
            
            <BetHistoryTable userId={user?.id} limit={5} />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
