
import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, Laptop, MapPin, AlarmClock, LogOut, Eye, AlertTriangle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow, parseISO } from 'date-fns';

const SessionsPage = () => {
  const { user, sessions, fetchSessions, logoutAllSessions, logoutSession, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Get current session ID
    setCurrentSessionId(localStorage.getItem('sessionId'));
    
    const loadSessions = async () => {
      try {
        await fetchSessions();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast({
          title: "Failed to load sessions",
          description: "There was a problem loading your sessions. Using demo data instead.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadSessions();
  }, [isAuthenticated, navigate, fetchSessions, toast]);
  
  const handleLogoutSession = async (sessionId: string) => {
    try {
      await logoutSession(sessionId);
      
      // If current session, redirect to login
      if (sessionId === currentSessionId) {
        navigate('/');
      }
      
      toast({
        title: "Session ended",
        description: "The device has been logged out successfully.",
      });
    } catch (error) {
      console.error('Error logging out session:', error);
      toast({
        title: "Error",
        description: "Failed to log out the session. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogoutAllSessions = async () => {
    try {
      await logoutAllSessions();
      navigate('/');
      toast({
        title: "All sessions ended",
        description: "You have been logged out from all devices.",
      });
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      toast({
        title: "Error",
        description: "Failed to log out all sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      // Current session first
      if (a.id === currentSessionId) return -1;
      if (b.id === currentSessionId) return 1;
      
      // Then sort by last active (most recent first)
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });
  }, [sessions, currentSessionId]);
  
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android') || device.toLowerCase().includes('mobile')) {
      return <Laptop className="h-6 w-6 mr-2" />;
    }
    return <Laptop className="h-6 w-6 mr-2" />;
  };
  
  const formatLastActive = (lastActive: string) => {
    try {
      return formatDistanceToNow(parseISO(lastActive), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Device Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage your active sessions across different devices.</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4 md:mt-0" disabled={isLoading || sessions.length === 0}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out all devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out all devices?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will terminate all your active sessions and you'll need to sign in again on each device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogoutAllSessions}>
                  Sign out all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[156px] w-full" />
            <Skeleton className="h-[156px] w-full" />
            <Skeleton className="h-[156px] w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {sortedSessions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Sessions</CardTitle>
                  <CardDescription>
                    You don't have any active sessions at the moment.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => navigate('/')}>Go Home</Button>
                </CardFooter>
              </Card>
            ) : (
              sortedSessions.map((session) => (
                <Card key={session.id} className={`border ${session.id === currentSessionId ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        {getDeviceIcon(session.device)}
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {session.device.split(" on ")[1] || session.device}
                            {session.id === currentSessionId && (
                              <Badge className="ml-2 bg-primary text-primary-foreground">Current Device</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {session.device.split(" on ")[0] || 'Web Browser'}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {session.id !== currentSessionId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Sign out this device?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will terminate the session on this device and require signing in again to access the account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleLogoutSession(session.id)}>
                                Sign out device
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                          <span className="text-sm">
                            Active {formatLastActive(session.lastActive)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                          <span className="text-sm">
                            {session.location || 'Unknown location'}
                          </span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Eye className="text-muted-foreground mr-2 h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            IP: {session.ipAddress}
                          </span>
                        </div>
                        
                        {session.id === currentSessionId ? (
                          <Button 
                            variant="outline" 
                            onClick={() => handleLogoutSession(session.id)}
                            className="w-full md:w-auto"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </Button>
                        ) : (
                          <div className="flex items-center">
                            <AlertTriangle className="text-warning mr-2 h-4 w-4" />
                            <span className="text-sm text-warning">
                              Not this device?{" "}
                              <Button 
                                variant="link"
                                className="p-0 h-auto" 
                                onClick={() => handleLogoutSession(session.id)}
                              >
                                Sign it out now
                              </Button>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SessionsPage;
