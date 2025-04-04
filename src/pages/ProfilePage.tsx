
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { Shield, User, Settings, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out from this device.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>You need to be logged in to view this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Account</h1>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2" onClick={() => navigate('/sessions')}>
            <Clock className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information and account details.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Name</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Account Type</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">User ID</span>
                    <span className="font-medium text-xs text-muted-foreground">{user.id}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your account security settings including connected sessions, devices, and authentication methods.
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Account Protection</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your account is protected using standard security measures.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Password</h3>
                  <Button variant="outline" className="mt-2">Change Password</Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Account Sessions</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your active sessions across different devices.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate('/sessions')}
                  >
                    Manage Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleLogout}>
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Customize your application experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Manage your notification preferences, display settings, and other account configurations.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon: Control when and how you receive notifications.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Display</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon: Customize your display settings and appearance.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Account Preferences</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon: Update your account preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
