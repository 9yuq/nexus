import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { UserAvatar } from "./ui/user-avatar";
import { useWallet } from "@/context/wallet-context";
import { formatCurrency } from "@/lib/gameLogic";
import { getVipLevelDisplay } from "@/lib/auth";
import { Button } from "./ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { balance } = useWallet();
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };
  
  return (
    <div className="bg-primary-800 w-64 flex-shrink-0 h-screen overflow-y-auto border-r border-primary-700 hidden md:block">
      <div className="p-5">
        <div className="flex items-center justify-start mb-8">
          <span className="text-2xl font-display font-bold bg-gradient-to-r from-accent-purple to-accent-teal bg-clip-text text-transparent">
            NEXUS CASINO
          </span>
        </div>
        
        {/* User info section */}
        {user && (
          <div className="bg-primary-700 rounded-lg p-3 mb-6">
            <div className="flex items-center space-x-3">
              <UserAvatar username={user.username} vipLevel={user.vipLevel} />
              <div>
                <div className="font-semibold text-white">{user.username}</div>
                <div className="text-xs text-neutral-400">{getVipLevelDisplay(user.vipLevel)}</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              <div>
                <div className="text-xs text-neutral-500">Balance</div>
                <div className="font-mono font-medium text-white">
                  <i className="fa-solid fa-coins text-yellow-400 text-xs mr-1"></i>
                  <span>{formatCurrency(balance)}</span>
                </div>
              </div>
              <Link href="/wallet">
                <Button size="sm" className="bg-accent-purple hover:bg-opacity-80">
                  Deposit
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Navigation Items */}
        <nav>
          <div className="space-y-1">
            <Link href="/">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </a>
            </Link>
            
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-semibold text-neutral-500 uppercase">Games</p>
            </div>
            
            <Link href="/games/crash">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/games/crash") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 17.8L17 13l-3 4-5-6-5 6"></path>
                  <path d="M22 17.8V5c0-1-.8-2-2-2H4c-1 0-2 .9-2 2v13"></path>
                </svg>
                <span>Crash</span>
              </a>
            </Link>
            
            <Link href="/games/dice">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/games/dice") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <circle cx="15.5" cy="8.5" r="1.5"></circle>
                  <circle cx="15.5" cy="15.5" r="1.5"></circle>
                  <circle cx="8.5" cy="15.5" r="1.5"></circle>
                </svg>
                <span>Dice</span>
              </a>
            </Link>
            
            <Link href="/games/slots">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/games/slots") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="18" rx="2"></rect>
                  <line x1="8" y1="21" x2="8" y2="3"></line>
                  <line x1="16" y1="21" x2="16" y2="3"></line>
                  <circle cx="6" cy="9" r="2"></circle>
                  <circle cx="18" cy="14" r="2"></circle>
                  <circle cx="12" cy="8" r="2"></circle>
                </svg>
                <span>Slots</span>
              </a>
            </Link>
            
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold text-neutral-500 uppercase">Account</p>
            </div>
            
            <Link href="/wallet">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/wallet") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <circle cx="16" cy="12" r="2"></circle>
                  <path d="M22 12h-4"></path>
                </svg>
                <span>Wallet</span>
              </a>
            </Link>
            
            <Link href="/history">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/history") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>History</span>
              </a>
            </Link>
            
            <Link href="/profile">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive("/profile") ? "bg-primary-700 text-white" : "text-neutral-300 hover:bg-primary-700 hover:text-white"
              } group transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
              </a>
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Affiliate banner */}
      <div className="p-4 mt-4">
        <div className="bg-gradient-to-r from-accent-purple/20 to-accent-teal/20 p-3 rounded-lg">
          <p className="text-xs text-white font-medium">Invite Friends & Earn</p>
          <p className="text-xs text-neutral-400 mt-1">Get 5% of their wagers</p>
          <Button 
            className="mt-2 w-full bg-accent-purple hover:bg-accent-purple/80 text-white text-xs py-1.5"
            size="sm"
          >
            Copy Referral Code
          </Button>
        </div>
      </div>
    </div>
  );
}
