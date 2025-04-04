import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import SessionService from '@/services/SessionService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Session {
  id: string;
  device: string;
  lastActive: string;
  ipAddress: string;
  location: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sessions: Session[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  logoutAllSessions: () => Promise<void>;
  logoutSession: (sessionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development when API is not available
const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    device: 'Chrome on Windows',
    lastActive: new Date().toISOString(),
    ipAddress: '192.168.1.1',
    location: 'New York, USA',
  },
  {
    id: 'session-2',
    device: 'Safari on iPhone',
    lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    ipAddress: '192.168.1.2',
    location: 'San Francisco, USA',
  },
  {
    id: 'session-3',
    device: 'Firefox on MacOS',
    lastActive: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    ipAddress: '192.168.1.3',
    location: 'London, UK',
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetchUserData();
    }
    
    // Check if API is available
    checkApiAvailability();
  }, []);
  
  const checkApiAvailability = async () => {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        console.log('API health check failed, using demo mode');
        setIsApiAvailable(false);
        
        // Set demo user in development mode
        if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
          setUser({
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@example.com',
            role: 'user'
          });
          setIsAuthenticated(true);
          setSessions(MOCK_SESSIONS);
        }
      }
    } catch (error) {
      console.log('API health check error, using demo mode', error);
      setIsApiAvailable(false);
      
      // Set demo user in development mode
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        setUser({
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'user'
        });
        setIsAuthenticated(true);
        setSessions(MOCK_SESSIONS);
      }
    }
  };
  
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token might be invalid, try refreshing
        await refreshToken();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      
      // If in development, set demo user
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        setUser({
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'user'
        });
        setIsAuthenticated(true);
        setSessions(MOCK_SESSIONS);
      } else {
        logout();
      }
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      };
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          device: deviceInfo 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
        toast({
          title: 'Login successful',
          description: 'Welcome back to Learner.ai!',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const logout = () => {
    // Don't attempt to send logout request if API is not available
    if (isApiAvailable) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }).catch(err => console.error('Logout error:', err));
    }
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setSessions([]);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };
  
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };
  
  const fetchSessions = async () => {
    try {
      // Check if API is available - if not, use mock data
      if (!isApiAvailable) {
        console.log('API not available, using mock session data');
        setSessions(MOCK_SESSIONS);
        return;
      }
      
      const response = await fetch('/api/user/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      // Check if response is JSON by looking at Content-Type header
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        console.error('Response is not JSON:', await response.text());
        
        // Fallback to using local sessionService
        try {
          const sessionService = SessionService.getInstance();
          if (user) {
            const userSessions = await sessionService.getUserSessions(user.id);
            const formattedSessions: Session[] = Object.keys(userSessions).map(sessionId => {
              const sessionData = JSON.parse(userSessions[sessionId]);
              return {
                id: sessionId,
                device: sessionData.deviceInfo?.userAgent || 'Unknown Device',
                lastActive: sessionData.lastActive || new Date().toISOString(),
                ipAddress: sessionData.ipAddress || '0.0.0.0',
                location: sessionData.location || 'Unknown Location'
              };
            });
            setSessions(formattedSessions);
          } else {
            // If no user, fallback to mock data
            setSessions(MOCK_SESSIONS);
          }
        } catch (error) {
          console.error('Session service fallback failed:', error);
          // Ultimate fallback to mock data
          setSessions(MOCK_SESSIONS);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      
      // Fallback to mock data
      setSessions(MOCK_SESSIONS);
      
      toast({
        title: 'Demo Mode',
        description: 'Using sample session data for demonstration.',
      });
    }
  };
  
  const logoutSession = async (sessionId: string) => {
    try {
      // If API not available, just remove from state
      if (!isApiAvailable) {
        setSessions(prevSessions => 
          prevSessions.filter(session => session.id !== sessionId)
        );
        
        toast({
          title: 'Success',
          description: 'Device has been logged out.',
        });
        return;
      }
      
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        setSessions(prevSessions => 
          prevSessions.filter(session => session.id !== sessionId)
        );
        toast({
          title: 'Success',
          description: 'Device has been logged out.',
        });
      } else if (response.status === 401) {
        await refreshToken();
        await logoutSession(sessionId);
      } else {
        throw new Error('Failed to logout session');
      }
    } catch (error) {
      console.error('Failed to logout session:', error);
      
      // Still remove from UI even if API call failed
      setSessions(prevSessions => 
        prevSessions.filter(session => session.id !== sessionId)
      );
      
      toast({
        title: 'Session Ended',
        description: 'Device has been logged out locally.',
      });
    }
  };
  
  const logoutAllSessions = async () => {
    try {
      // If API not available, just clear the sessions
      if (!isApiAvailable) {
        setSessions([]);
        toast({
          title: 'Success',
          description: 'All devices have been logged out.',
        });
        return;
      }
      
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        setSessions([]);
        toast({
          title: 'Success',
          description: 'All devices have been logged out.',
        });
        // Log out current session as well
        logout();
      } else if (response.status === 401) {
        await refreshToken();
        await logoutAllSessions();
      } else {
        throw new Error('Failed to logout all sessions');
      }
    } catch (error) {
      console.error('Failed to logout all sessions:', error);
      
      // Still clear sessions in UI
      setSessions([]);
      
      toast({
        title: 'Sessions Ended',
        description: 'All devices have been logged out locally.',
      });
    }
  };
  
  const value = {
    user,
    isAuthenticated,
    sessions,
    login,
    logout,
    refreshToken,
    fetchSessions,
    logoutAllSessions,
    logoutSession,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
