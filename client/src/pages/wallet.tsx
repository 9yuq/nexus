import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DepositForm } from "@/components/wallet/deposit-form";
import { WithdrawForm } from "@/components/wallet/withdraw-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/context/wallet-context";
import { formatCurrency } from "@/lib/gameLogic";

export default function Wallet() {
  const [location] = useLocation();
  const { balance } = useWallet();
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Check if URL has a tab parameter
    const params = new URLSearchParams(location.split("?")[1]);
    return params.get("tab") === "withdraw" ? "withdraw" : "deposit";
  });
  
  // Fetch transaction history
  const { data: transactions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Wallet</h1>
            <p className="text-neutral-400">Manage your funds</p>
          </div>
          
          {/* Balance Display */}
          <Card className="bg-primary-800 border-primary-700 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-neutral-300 mb-1">Current Balance</h2>
                  <p className="text-3xl font-mono font-bold text-white">{formatCurrency(balance)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4 md:mt-0">
                  <div className="bg-primary-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-neutral-400 mb-1">Total Deposited</p>
                    <p className="text-lg font-mono font-semibold text-white">
                      {formatCurrency(
                        transactions
                          ?.filter(t => t.type === "deposit")
                          .reduce((sum: number, t: any) => sum + t.amount, 0) || 0
                      )}
                    </p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-neutral-400 mb-1">Total Withdrawn</p>
                    <p className="text-lg font-mono font-semibold text-white">
                      {formatCurrency(
                        transactions
                          ?.filter(t => t.type === "withdraw")
                          .reduce((sum: number, t: any) => sum + t.amount, 0) || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Wallet Actions */}
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit">
              <DepositForm />
            </TabsContent>
            
            <TabsContent value="withdraw">
              <WithdrawForm />
            </TabsContent>
          </Tabs>
          
          {/* Transaction History */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
            
            <Card className="bg-primary-800 border-primary-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-700">
                  <thead className="bg-primary-700/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-700 text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-neutral-400">
                          Loading transaction history...
                        </td>
                      </tr>
                    ) : transactions && transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`${tx.type === 'deposit' ? 'text-accent-teal' : 'text-accent-orange'}`}>
                                {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              tx.status === 'completed' 
                                ? 'bg-status-success/20 text-status-success' 
                                : tx.status === 'pending'
                                ? 'bg-status-warning/20 text-status-warning'
                                : 'bg-status-error/20 text-status-error'
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-neutral-300">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-neutral-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
