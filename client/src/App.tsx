import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";
import Wallet from "@/pages/wallet";
import GameHistory from "@/pages/game-history";
import Crash from "@/pages/crash";
import Dice from "@/pages/dice";
import Slots from "@/pages/slots";
import { AuthProvider, useAuth } from "./context/auth-context";
import { WalletProvider } from "./context/wallet-context";
import { GameProvider } from "./context/game-context";
import { useEffect } from "react";

// Protected router component that uses auth context
function ProtectedRouter() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && 
        !location.startsWith("/login") && 
        !location.startsWith("/signup")) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/history" component={GameHistory} />
      <Route path="/games/crash" component={Crash} />
      <Route path="/games/dice" component={Dice} />
      <Route path="/games/slots" component={Slots} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <GameProvider>
            <ProtectedRouter />
            <Toaster />
          </GameProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
