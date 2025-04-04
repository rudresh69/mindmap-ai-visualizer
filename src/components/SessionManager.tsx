
import { useEffect, useState } from 'react';
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
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  
  // Check and refresh token when needed
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Setup token refresh interval
    const tokenRefreshInterval = setInterval(() => {
      refreshToken().catch((error) => {
        console.error('Failed to refresh token:', error);
        if (import.meta.env.PROD) {
          toast({
            title: 'Session expired',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          });
          logout();
          navigate('/login');
        }
      });
    }, 15 * 60 * 1000); // Refresh token every 15 minutes
    
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [isAuthenticated, refreshToken, logout, navigate, user]);
  
  // Set up session activity tracking
  useEffect(() => {
    if (!isAuthenticated || !user || !trackingEnabled) return;
    
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
            await sessionService.updateSessionActivity(sessionId).catch(err => {
              console.error('Failed to update session activity in Redis:', err);
              // Disable tracking after multiple failures to avoid console spam
              if (err.message?.includes('maximum call stack size exceeded')) {
                setTrackingEnabled(false);
                console.warn('Session tracking disabled due to errors');
              }
            });
            
            // Only try API call in production
            if (import.meta.env.PROD) {
              fetch('/api/session/activity', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ sessionId }),
              }).catch(err => {
                console.error('Failed to update activity status via API:', err);
              });
            }
          }
        } catch (error) {
          console.error('Failed to track activity:', error);
        }
      }
    };
    
    // Set up activity tracking with throttling
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const throttledTrackActivity = () => {
      if (timeout === null) {
        timeout = setTimeout(() => {
          trackActivity();
          timeout = null;
        }, 60000); // Throttle to once per minute at most
      }
    };
    
    // Set up activity tracking events
    window.addEventListener('mousemove', throttledTrackActivity);
    window.addEventListener('keypress', throttledTrackActivity);
    window.addEventListener('click', throttledTrackActivity);
    
    // Initial activity tracking
    trackActivity();
    
    return () => {
      window.removeEventListener('mousemove', throttledTrackActivity);
      window.removeEventListener('keypress', throttledTrackActivity);
      window.removeEventListener('click', throttledTrackActivity);
      if (timeout) clearTimeout(timeout);
    };
  }, [isAuthenticated, user, trackingEnabled]);
  
  return <>{children}</>;
};

export default SessionManager;
