
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import SessionService from '@/services/SessionService';
import { v4 as uuidv4 } from 'uuid';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager = ({ children }: SessionManagerProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshToken, logout, user } = useAuth();
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  
  // Generate and set session ID if not already present
  useEffect(() => {
    // Only create sessionId if the user is authenticated
    if (isAuthenticated && user && !localStorage.getItem('sessionId')) {
      const newSessionId = uuidv4();
      localStorage.setItem('sessionId', newSessionId);
      
      // Try to get user location for session tracking
      try {
        fetch('https://ipinfo.io/json?token=undefined')
          .then(res => res.json())
          .then(data => {
            localStorage.setItem('sessionLocation', `${data.city || ''}, ${data.country || 'Unknown'}`);
            localStorage.setItem('sessionIP', data.ip || '0.0.0.0');
          })
          .catch(() => {
            console.log('Could not fetch location data');
          });
      } catch (error) {
        console.error('Failed to get location data:', error);
      }
    }
  }, [isAuthenticated, user]);
  
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
            // Check if we need to create the session in Redis
            const session = await sessionService.getSession(sessionId).catch(() => null);
            
            if (!session) {
              // Create new session with enhanced metadata
              const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
              };
              
              // Get location from localStorage if available (set earlier)
              const location = localStorage.getItem('sessionLocation') || 'Unknown location';
              const ipAddress = localStorage.getItem('sessionIP') || '0.0.0.0';
              
              // Create session in Redis
              await sessionService.createSession(
                sessionId,
                user.id,
                deviceInfo,
                ipAddress,
                location
              ).catch(err => {
                console.error('Failed to create session in Redis:', err);
              });
            } else {
              // Update existing session activity in Redis
              await sessionService.updateSessionActivity(sessionId).catch(err => {
                console.error('Failed to update session activity in Redis:', err);
                // Disable tracking after multiple failures to avoid console spam
                if (err.message?.includes('maximum call stack size exceeded')) {
                  setTrackingEnabled(false);
                  console.warn('Session tracking disabled due to errors');
                }
              });
            }
            
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
    
    // Set up activity tracking events with more events for better tracking
    const events = ['mousemove', 'keypress', 'click', 'touchstart', 'scroll', 'focus'];
    events.forEach(event => window.addEventListener(event, throttledTrackActivity));
    
    // Initial activity tracking
    trackActivity();
    
    // Ping activity every 5 minutes regardless of user interaction
    const pingInterval = setInterval(trackActivity, 5 * 60 * 1000);
    
    return () => {
      events.forEach(event => window.removeEventListener(event, throttledTrackActivity));
      if (timeout) clearTimeout(timeout);
      clearInterval(pingInterval);
    };
  }, [isAuthenticated, user, trackingEnabled]);
  
  return <>{children}</>;
};

export default SessionManager;
