
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user is logged in on component mount
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetchUserData();
    }
  }, []);
  
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
      logout();
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
    // Send logout request to invalidate token on server
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }).catch(err => console.error('Logout error:', err));
    
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
      const response = await fetch('/api/user/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else if (response.status === 401) {
        await refreshToken();
        await fetchSessions();
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your active sessions.',
        variant: 'destructive',
      });
    }
  };
  
  const logoutSession = async (sessionId: string) => {
    try {
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
      toast({
        title: 'Error',
        description: 'Failed to logout the selected device.',
        variant: 'destructive',
      });
    }
  };
  
  const logoutAllSessions = async () => {
    try {
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
      toast({
        title: 'Error',
        description: 'Failed to logout all devices.',
        variant: 'destructive',
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
