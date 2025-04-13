import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/context/auth-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getVipLevelDisplay } from "@/lib/auth";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary-900">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-neutral-400">Manage your account settings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="bg-primary-800 border-primary-700 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <UserAvatar username={user.username} vipLevel={user.vipLevel} size="lg" />
                  
                  <h2 className="mt-4 text-xl font-semibold text-white">{user.username}</h2>
                  <p className="text-neutral-400 mb-6">{getVipLevelDisplay(user.vipLevel)}</p>
                  
                  <div className="w-full space-y-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Member Since</span>
                      <span className="text-white">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? "Logging Out..." : "Logout"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Card */}
            <Card className="bg-primary-800 border-primary-700 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-primary-700 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-1">Total Wagered</p>
                    <p className="text-xl font-mono font-semibold text-white">$12,345.00</p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-1">Total Profit</p>
                    <p className="text-xl font-mono font-semibold text-status-success">+$789.50</p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-1">Total Games</p>
                    <p className="text-xl font-mono font-semibold text-white">142</p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-1">Highest Win</p>
                    <p className="text-xl font-mono font-semibold text-accent-teal">$1,250.00</p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-1">Win Rate</p>
                    <p className="text-xl font-mono font-semibold text-white">47%</p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-1">Favorite Game</p>
                    <p className="text-xl font-semibold text-white">Crash</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-white mb-3">VIP Progress</h3>
                  <div className="w-full bg-primary-700 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-accent-purple to-accent-teal h-2.5 rounded-full" 
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-neutral-400">Level {user.vipLevel}</span>
                    <span className="text-neutral-400">Next: Level {user.vipLevel + 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Settings Card */}
            <Card className="bg-primary-800 border-primary-700 md:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-semibold text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                          Change Password
                        </label>
                        <Button className="w-full bg-primary-700 hover:bg-primary-600">
                          Update Password
                        </Button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                          Two-Factor Authentication
                        </label>
                        <Button className="w-full bg-primary-700 hover:bg-primary-600">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold text-white mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-neutral-300">Email Notifications</label>
                        <div className="w-11 h-6 bg-accent-purple rounded-full p-1 cursor-pointer">
                          <div className="bg-white h-4 w-4 rounded-full transform translate-x-5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-neutral-300">Promotion Alerts</label>
                        <div className="w-11 h-6 bg-primary-700 rounded-full p-1 cursor-pointer">
                          <div className="bg-white h-4 w-4 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-neutral-300">Game Result Notifications</label>
                        <div className="w-11 h-6 bg-accent-purple rounded-full p-1 cursor-pointer">
                          <div className="bg-white h-4 w-4 rounded-full transform translate-x-5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
