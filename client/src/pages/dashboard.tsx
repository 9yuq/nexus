import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CrashGameCard, DiceGameCard, SlotsGameCard } from "@/components/game-card";
import { BetHistoryTable } from "@/components/bet-history-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden">
        <Header />
        
        <main className="p-4 md:p-6">
          {/* Banner */}
          <div className="mb-6 rounded-xl overflow-hidden relative">
            <div className="h-48 bg-gradient-to-r from-primary-800 to-primary-700 flex flex-col justify-center px-6 md:px-10">
              <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Nexus Casino</h1>
                <p className="text-neutral-300 mb-4 max-w-xl">Experience the thrill of crypto gaming with our exclusive games and amazing rewards.</p>
                <Link href="/wallet">
                  <Button className="bg-accent-purple hover:bg-opacity-80 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden md:block">
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 w-16 rounded-lg bg-accent-purple/30 backdrop-blur-sm"></div>
                  <div className="h-16 w-16 rounded-lg bg-accent-teal/30 backdrop-blur-sm mt-8"></div>
                  <div className="h-16 w-16 rounded-lg bg-accent-orange/30 backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <CrashGameCard />
            <DiceGameCard />
            <SlotsGameCard />
          </div>
          
          {/* Recent Bets */}
          <div className="mt-10">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <Link href="/history">
                <Button variant="ghost" className="text-neutral-400 hover:text-white text-sm">
                  View All
                </Button>
              </Link>
            </div>
            
            <BetHistoryTable limit={5} />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
