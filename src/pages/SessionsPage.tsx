
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Globe, Smartphone, Laptop, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const SessionsPage = () => {
  const { sessions, fetchSessions, logoutSession, logoutAllSessions } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        await fetchSessions();
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessions();
  }, [fetchSessions]);
  
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
      return <Smartphone className="h-6 w-6" />;
    } else {
      return <Laptop className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <Button 
            variant="destructive" 
            onClick={logoutAllSessions}
            className="flex items-center gap-2"
            disabled={isLoading || sessions.length === 0}
          >
            <AlertTriangle className="h-4 w-4" />
            Logout All Devices
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <p>No active sessions found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <Card key={session.id || `session-${Math.random()}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                  {getDeviceIcon(session.device)}
                  <div>
                    <CardTitle className="text-lg">{session.device || "Unknown Device"}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.lastActive ? (
                        `Last active ${formatDistanceToNow(new Date(session.lastActive))} ago`
                      ) : (
                        "Last activity unknown"
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 mt-0.5" />
                    <div>
                      <p>{session.ipAddress || "IP unknown"}</p>
                      <p>{session.location || "Location unknown"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => logoutSession(session.id)}
                  >
                    Log Out This Device
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
