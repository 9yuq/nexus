import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";

// Validation schema
const withdrawSchema = z.object({
  amount: z.string()
    .nonempty("Amount is required")
    .refine(
      val => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number"
    ),
  destinationAddress: z.string()
    .nonempty("Destination address is required"),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export function WithdrawForm() {
  const { balance, updateBalance } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("crypto");

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      destinationAddress: "",
    },
  });

  const onSubmit = async (values: WithdrawFormValues) => {
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(values.amount);
      
      // Check if user has sufficient balance
      if (amount > balance) {
        throw new Error("Insufficient balance");
      }
      
      const response = await apiRequest("POST", "/api/transactions", {
        type: "withdraw",
        amount,
        status: "completed", // Mock immediate completion
      });
      
      const data = await response.json();
      
      // Update local wallet balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Withdrawal Initiated",
        description: `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been withdrawn from your account.`,
      });
      
      // Reset form
      form.reset({
        amount: "",
        destinationAddress: "",
      });
    } catch (err) {
      toast({
        title: "Withdrawal Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    form.setValue("amount", balance.toString());
  };

  return (
    <Card className="w-full bg-primary-800 border-primary-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Withdraw Funds</CardTitle>
        <CardDescription className="text-neutral-400">
          Withdraw your winnings to your preferred method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-primary-700 rounded-md flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-400">Available Balance</p>
            <p className="text-xl font-mono font-medium text-white">{balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
          </div>
          <Button 
            variant="outline" 
            className="border-primary-600 text-neutral-300 hover:bg-primary-600"
            onClick={setMaxAmount}
          >
            Withdraw All
          </Button>
        </div>
        
        <Tabs defaultValue="crypto" className="w-full" onValueChange={setWithdrawMethod}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
            <TabsTrigger value="robux">Robux</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter withdrawal amount"
                          className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {["BTC", "ETH", "LTC", "USDT"].map((coin) => (
                    <Button 
                      key={coin}
                      variant="outline"
                      className="border-primary-700 hover:bg-primary-700 hover:text-white transition-colors"
                      onClick={() => form.setValue("destinationAddress", `${coin.toLowerCase()}_wallet_address`)}
                    >
                      <div className="flex flex-col items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 mb-1 text-accent-orange" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9 12h6" />
                          <path d="M12 9v6" />
                        </svg>
                        <span className="text-xs">{coin}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <FormField
                  control={form.control}
                  name="destinationAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">Destination Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your wallet address"
                          className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-neutral-400 text-xs">
                        Double-check your address to avoid irreversible transaction errors
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-teal hover:bg-accent-teal/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Withdraw Now"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="bank">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter withdrawal amount"
                          className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Bank Name</label>
                    <Input
                      placeholder="Your bank name"
                      className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Account Number</label>
                    <Input
                      placeholder="Your account number"
                      className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="destinationAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-300">SWIFT/BIC Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="International bank code"
                            className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-teal hover:bg-accent-teal/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Withdraw Now"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="robux">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter withdrawal amount"
                          className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Roblox Username</label>
                  <Input
                    placeholder="Your Roblox username"
                    className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="destinationAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">Roblox User ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Roblox user ID"
                          className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-teal hover:bg-accent-teal/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Withdraw Now"}
                </Button>
                
                <p className="text-xs text-neutral-400 italic mt-2">
                  Note: Robux withdrawals require account verification.
                </p>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
