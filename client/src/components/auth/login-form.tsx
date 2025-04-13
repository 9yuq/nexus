import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { loginSchema } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiGoogle, SiDiscord } from "react-icons/si";

export function LoginForm() {
  const [_, setLocation] = useLocation();
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: { username: string; password: string }) => {
    setError(null);
    try {
      await login(values.username, values.password);
      toast({
        title: "Login Successful",
        description: "Welcome back to Nexus Casino!",
      });
      setLocation("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md bg-primary-800 border-primary-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Login to Your Account</CardTitle>
        <CardDescription className="text-neutral-400">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <div className="bg-destructive/20 p-3 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-accent-purple hover:bg-accent-purple/80"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-primary-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-primary-800 px-2 text-xs text-neutral-400">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-primary-700 border-primary-700 hover:bg-primary-600 hover:text-white text-neutral-200"
                onClick={() => window.location.href = "/api/auth/google"}
              >
                <SiGoogle className="mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-[#5865F2] border-[#5865F2] hover:bg-[#4a55e3] hover:border-[#4a55e3] text-white"
                onClick={() => window.location.href = "/api/auth/discord"}
              >
                <SiDiscord className="mr-2" />
                Discord
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-primary-700 pt-4">
        <p className="text-sm text-neutral-400">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 text-accent-purple" onClick={() => setLocation("/signup")}>
            Sign Up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
