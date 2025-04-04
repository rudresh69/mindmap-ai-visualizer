
import RedisService from './RedisService';

interface SessionData {
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
  };
  ipAddress: string;
  location?: string;
  lastActive: string;
}

class SessionService {
  private static instance: SessionService;
  private redis: RedisService;
  
  // Constants
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user-sessions:';
  private readonly SESSION_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds
  
  private constructor() {
    this.redis = RedisService.getInstance();
  }
  
  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }
  
  /**
   * Create a new session
   */
  public async createSession(
    sessionId: string,
    userId: string,
    deviceInfo: { userAgent: string; platform: string; language: string },
    ipAddress: string,
    location?: string
  ): Promise<void> {
    try {
      // Create session data
      const sessionData: SessionData = {
        userId,
        deviceInfo,
        ipAddress,
        location,
        lastActive: new Date().toISOString()
      };
      
      // Store session in Redis
      await this.redis.set(
        `${this.SESSION_PREFIX}${sessionId}`,
        JSON.stringify(sessionData),
        this.SESSION_EXPIRY
      );
      
      // Add session ID to user's sessions set
      await this.redis.hSet(
        `${this.USER_SESSIONS_PREFIX}${userId}`,
        sessionId,
        JSON.stringify({
          deviceInfo,
          ipAddress,
          location,
          lastActive: new Date().toISOString()
        })
      );
      
      // Set expiration for user sessions hash
      await this.redis.expire(`${this.USER_SESSIONS_PREFIX}${userId}`, this.SESSION_EXPIRY);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }
  
  /**
   * Get session data
   */
  public async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionData = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (!sessionData) {
        return null;
      }
      
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Failed to get session:', error);
      throw error;
    }
  }
  
  /**
   * Update last activity time for session
   */
  public async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const sessionData = await this.getSession(sessionId);
      
      if (!sessionData) {
        return;
      }
      
      // Update last active time
      sessionData.lastActive = new Date().toISOString();
      
      // Store updated session
      await this.redis.set(
        `${this.SESSION_PREFIX}${sessionId}`,
        JSON.stringify(sessionData),
        this.SESSION_EXPIRY
      );
      
      // Also update in user sessions hash
      const userSessionData = await this.redis.hGet(
        `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`,
        sessionId
      );
      
      if (userSessionData) {
        const parsedData = JSON.parse(userSessionData);
        parsedData.lastActive = new Date().toISOString();
        
        await this.redis.hSet(
          `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`,
          sessionId,
          JSON.stringify(parsedData)
        );
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }
  
  /**
   * Get all sessions for a user
   */
  public async getUserSessions(userId: string): Promise<Record<string, any>> {
    try {
      return await this.redis.hGetAll(`${this.USER_SESSIONS_PREFIX}${userId}`);
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw error;
    }
  }
  
  /**
   * Remove a specific session
   */
  public async removeSession(userId: string, sessionId: string): Promise<void> {
    try {
      // Remove from session store
      await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
      
      // Remove from user sessions hash
      await this.redis.hDel(`${this.USER_SESSIONS_PREFIX}${userId}`, sessionId);
    } catch (error) {
      console.error('Failed to remove session:', error);
      throw error;
    }
  }
  
  /**
   * Remove all sessions for a user
   */
  public async removeAllUserSessions(userId: string): Promise<void> {
    try {
      // Get all session IDs for user
      const userSessions = await this.getUserSessions(userId);
      
      if (!userSessions) {
        return;
      }
      
      // Delete each session
      const sessionIds = Object.keys(userSessions);
      
      for (const sessionId of sessionIds) {
        await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
      }
      
      // Delete user sessions hash
      await this.redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
    } catch (error) {
      console.error('Failed to remove all user sessions:', error);
      throw error;
    }
  }
}

export default SessionService;
