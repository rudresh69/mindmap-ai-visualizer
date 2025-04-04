
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import SessionService from '@/services/SessionService';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager = ({ children }: SessionManagerProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshToken, logout, user } = useAuth();
  
  // Check and refresh token when needed
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
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
    
    // Initialize session service
    const sessionService = SessionService.getInstance();
    
    // Track user activity
    const trackActivity = async () => {
      if (isAuthenticated && user) {
        try {
          // Get current session ID
          const sessionId = localStorage.getItem('sessionId');
          
          if (sessionId) {
            // Update session activity in Redis
            await sessionService.updateSessionActivity(sessionId);
            
            // Also send activity ping to backend
            fetch('/api/session/activity', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: JSON.stringify({ sessionId }),
            }).catch(err => console.error('Failed to update activity status:', err));
          }
        } catch (error) {
          console.error('Failed to track activity:', error);
        }
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
  }, [isAuthenticated, refreshToken, logout, navigate, user]);
  
  return <>{children}</>;
};

export default SessionManager;
