import { Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";
import { formatCurrency } from "@/lib/gameLogic";
import { Button } from "./ui/button";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

export function Header() {
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-primary-800 border-b border-primary-700 sticky top-0 z-10">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Mobile menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <button 
              type="button" 
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-white hover:bg-primary-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-primary-800 border-r border-primary-700">
            <SheetHeader>
              <SheetTitle>
                <span className="text-xl font-display font-bold bg-gradient-to-r from-accent-purple to-accent-teal bg-clip-text text-transparent">
                  NEXUS CASINO
                </span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col space-y-1">
              <Link href="/">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-700 text-white">
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
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 17.8L17 13l-3 4-5-6-5 6"></path>
                    <path d="M22 17.8V5c0-1-.8-2-2-2H4c-1 0-2 .9-2 2v13"></path>
                  </svg>
                  <span>Crash</span>
                </a>
              </Link>
              
              <Link href="/games/dice">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all">
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
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all">
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
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <circle cx="16" cy="12" r="2"></circle>
                    <path d="M22 12h-4"></path>
                  </svg>
                  <span>Wallet</span>
                </a>
              </Link>
              
              <Link href="/history">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>History</span>
                </a>
              </Link>
              
              <Link href="/profile">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Profile</span>
                </a>
              </Link>
              
              <button 
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-primary-700 hover:text-white group transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Mobile logo */}
        <div className="md:hidden">
          <span className="text-xl font-display font-bold bg-gradient-to-r from-accent-purple to-accent-teal bg-clip-text text-transparent">
            NEXUS
          </span>
        </div>
        
        {/* Right section - user menu, etc. */}
        <div className="flex items-center space-x-4">
          <button className="bg-primary-700 p-2 rounded-full text-neutral-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          
          {user && (
            <div className="hidden md:block relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center px-3 py-1.5 bg-primary-700 rounded-full cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="font-mono text-sm font-medium">{formatCurrency(balance)}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-primary-800 border-primary-700 text-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary-700" />
                  <DropdownMenuItem className="focus:bg-primary-700">
                    <Link href="/wallet">
                      <a className="flex items-center w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <circle cx="16" cy="12" r="2"></circle>
                          <path d="M22 12h-4"></path>
                        </svg>
                        <span>Deposit</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary-700">
                    <Link href="/wallet?tab=withdraw">
                      <a className="flex items-center w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 11 12 14 22 4"></polyline>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        <span>Withdraw</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-700" />
                  <DropdownMenuItem className="focus:bg-primary-700" onClick={logout}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          <Link href="/wallet">
            <Button className="bg-accent-purple hover:bg-opacity-80 text-white hidden md:block">
              Deposit
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
