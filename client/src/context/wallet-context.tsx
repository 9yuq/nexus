import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/auth";

interface WalletContextType {
  balance: number;
  updateBalance: (newBalance: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const { user, isAuthenticated } = useAuth();
  
  // Initialize balance from user if available
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);
  
  // Fetch user data to get updated balance
  const { data: userData } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
    refetchInterval: 10000, // Refetch every 10 seconds to keep balance updated
  });
  
  // Update balance when user or userData changes
  useEffect(() => {
    if (userData) {
      setBalance(userData.balance);
    }
  }, [userData]);
  
  // Function to update balance (used after game results, deposits, withdrawals)
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };
  
  return (
    <WalletContext.Provider value={{ balance, updateBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
