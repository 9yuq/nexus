import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BetHistoryTable } from "@/components/bet-history-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";

export default function GameHistory() {
  const { user } = useAuth();
  const [gameFilter, setGameFilter] = useState<string>("all");
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Game History</h1>
            <p className="text-neutral-400">View your betting history</p>
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={setGameFilter}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="crash">Crash</TabsTrigger>
              <TabsTrigger value="dice">Dice</TabsTrigger>
              <TabsTrigger value="slots">Slots</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <BetHistoryTable userId={user?.id} limit={25} />
            </TabsContent>
            
            <TabsContent value="crash">
              {/* Filter for crash games only - this would be implemented with a backend filter param */}
              <BetHistoryTable userId={user?.id} limit={25} />
            </TabsContent>
            
            <TabsContent value="dice">
              {/* Filter for dice games only */}
              <BetHistoryTable userId={user?.id} limit={25} />
            </TabsContent>
            
            <TabsContent value="slots">
              {/* Filter for slots games only */}
              <BetHistoryTable userId={user?.id} limit={25} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Game Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary-800 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center text-accent-purple mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 17.8L17 13l-3 4-5-6-5 6"></path>
                      <path d="M22 17.8V5c0-1-.8-2-2-2H4c-1 0-2 .9-2 2v13"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-300">Total Bets</h3>
                    <p className="text-lg font-mono font-semibold text-white">184</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-primary-700 rounded-full">
                  <div className="h-1 bg-accent-purple rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">75% of all your activity</p>
              </div>
              
              <div className="bg-primary-800 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-teal/20 flex items-center justify-center text-accent-teal mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-300">Avg. Bet Size</h3>
                    <p className="text-lg font-mono font-semibold text-white">$89.50</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-primary-700 rounded-full">
                  <div className="h-1 bg-accent-teal rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">45% of your total wagered</p>
              </div>
              
              <div className="bg-primary-800 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-status-success/20 flex items-center justify-center text-status-success mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-300">Winnings</h3>
                    <p className="text-lg font-mono font-semibold text-status-success">+$1,247.25</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-primary-700 rounded-full">
                  <div className="h-1 bg-status-success rounded-full" style={{ width: '63%' }}></div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">63% win rate</p>
              </div>
              
              <div className="bg-primary-800 rounded-lg p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-status-warning/20 flex items-center justify-center text-status-warning mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-300">Best Game</h3>
                    <p className="text-lg font-mono font-semibold text-white">Crash</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-primary-700 rounded-full">
                  <div className="h-1 bg-status-warning rounded-full" style={{ width: '82%' }}></div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">82% of your profits</p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
