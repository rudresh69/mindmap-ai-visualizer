
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager = ({ children }: SessionManagerProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshToken, logout } = useAuth();
  
  // Check and refresh token when needed
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Setup token refresh interval
    const tokenRefreshInterval = setInterval(() => {
      refreshToken().catch((error) => {
        console.error('Failed to refresh token:', error);
        toast({
          title: 'Session expired',
          description: 'Please log in again to continue.',
          variant: 'destructive',
        });
        logout();
        navigate('/login');
      });
    }, 15 * 60 * 1000); // Refresh token every 15 minutes
    
    // Track user activity
    const trackActivity = () => {
      if (isAuthenticated) {
        // Send activity ping to backend
        fetch('/api/session/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }).catch(err => console.error('Failed to update activity status:', err));
      }
    };
    
    // Set up activity tracking events
    window.addEventListener('mousemove', trackActivity);
    window.addEventListener('keypress', trackActivity);
    window.addEventListener('click', trackActivity);
    
    // Initial activity tracking
    trackActivity();
    
    return () => {
      clearInterval(tokenRefreshInterval);
      window.removeEventListener('mousemove', trackActivity);
      window.removeEventListener('keypress', trackActivity);
      window.removeEventListener('click', trackActivity);
    };
  }, [isAuthenticated, refreshToken, logout, navigate]);
  
  return <>{children}</>;
};

export default SessionManager;
