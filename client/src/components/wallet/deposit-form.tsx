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
const depositSchema = z.object({
  amount: z.string()
    .nonempty("Amount is required")
    .refine(
      val => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number"
    ),
  walletAddress: z.string().optional(),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export function DepositForm() {
  const { updateBalance } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("crypto");

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      walletAddress: "",
    },
  });

  const onSubmit = async (values: DepositFormValues) => {
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(values.amount);
      
      const response = await apiRequest("POST", "/api/transactions", {
        type: "deposit",
        amount,
        status: "completed", // Mock immediate completion
      });
      
      const data = await response.json();
      
      // Update local wallet balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Deposit Successful",
        description: `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been added to your account.`,
      });
      
      // Reset form
      form.reset({
        amount: "",
        walletAddress: "",
      });
    } catch (err) {
      toast({
        title: "Deposit Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-primary-800 border-primary-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Deposit Funds</CardTitle>
        <CardDescription className="text-neutral-400">
          Add funds to your account to start playing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="crypto" className="w-full" onValueChange={setPaymentMethod}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="card">Credit Card</TabsTrigger>
            <TabsTrigger value="robux">Robux</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto">
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["BTC", "ETH", "LTC", "USDT"].map((coin) => (
                  <Button 
                    key={coin}
                    variant="outline"
                    className="border-primary-700 hover:bg-primary-700 hover:text-white transition-colors"
                    onClick={() => form.setValue("walletAddress", `${coin.toLowerCase()}_wallet_address`)}
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
                            placeholder="Enter deposit amount"
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
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-300">Wallet Address (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your wallet address for reference"
                            className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-accent-purple hover:bg-accent-purple/80"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Deposit Now"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          <TabsContent value="card">
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
                          placeholder="Enter deposit amount"
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
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Card Number</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Expiry Date</label>
                      <Input
                        placeholder="MM/YY"
                        className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">CVV</label>
                      <Input
                        placeholder="123"
                        className="bg-primary-700 border-primary-700 focus:border-accent-purple text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-purple hover:bg-accent-purple/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Deposit Now"}
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
                          placeholder="Enter deposit amount"
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
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-purple hover:bg-accent-purple/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Deposit Now"}
                </Button>
                
                <p className="text-xs text-neutral-400 italic mt-2">
                  Note: Robux deposits require verification through the Roblox platform.
                </p>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
