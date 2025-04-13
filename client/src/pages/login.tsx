import { useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/context/auth-context";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-primary-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-accent-purple to-accent-teal bg-clip-text text-transparent mb-2">
          NEXUS CASINO
        </h1>
        <p className="text-neutral-400">Sign in to continue to your account</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center text-sm text-neutral-500">
        By signing in, you agree to our 
        <a href="#" className="text-accent-purple ml-1 hover:underline">Terms of Service</a>
        <span className="mx-1">and</span>
        <a href="#" className="text-accent-purple hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
}
