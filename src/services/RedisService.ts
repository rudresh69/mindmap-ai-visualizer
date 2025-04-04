
/**
 * Redis service for handling session management and caching
 * With browser compatibility layer
 */

// Mock implementation for browser environments
class BrowserRedisClient {
  private data: Record<string, any> = {};
  private timers: Record<string, NodeJS.Timeout> = {};
  
  async connect(): Promise<void> {
    console.log('Browser Redis mock connected');
    return Promise.resolve();
  }
  
  async disconnect(): Promise<void> {
    // Clear all expiry timers
    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    return Promise.resolve();
  }
  
  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    this.data[key] = value;
    
    // Handle expiration
    if (options?.EX) {
      // Clear existing timer if any
      if (this.timers[key]) {
        clearTimeout(this.timers[key]);
      }
      
      // Set new expiration timer
      this.timers[key] = setTimeout(() => {
        delete this.data[key];
        delete this.timers[key];
      }, options.EX * 1000);
    }
    
    return Promise.resolve();
  }
  
  async get(key: string): Promise<string | null> {
    return this.data[key] || null;
  }
  
  async del(key: string): Promise<void> {
    delete this.data[key];
    if (this.timers[key]) {
      clearTimeout(this.timers[key]);
      delete this.timers[key];
    }
    return Promise.resolve();
  }
  
  async setEx(key: string, seconds: number, value: string): Promise<void> {
    return this.set(key, value, { EX: seconds });
  }
  
  async exists(key: string): Promise<boolean> {
    return key in this.data;
  }
  
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Object.keys(this.data).filter(key => regex.test(key));
  }
  
  async hSet(key: string, field: string, value: string): Promise<void> {
    if (!this.data[key]) {
      this.data[key] = {};
    }
    this.data[key][field] = value;
    return Promise.resolve();
  }
  
  async hGet(key: string, field: string): Promise<string | null> {
    if (!this.data[key]) return null;
    return this.data[key][field] || null;
  }
  
  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.data[key] || {};
  }
  
  async hDel(key: string, field: string): Promise<void> {
    if (this.data[key]) {
      delete this.data[key][field];
    }
    return Promise.resolve();
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    if (key in this.data) {
      // Clear existing timer if any
      if (this.timers[key]) {
        clearTimeout(this.timers[key]);
      }
      
      // Set new expiration timer
      this.timers[key] = setTimeout(() => {
        delete this.data[key];
        delete this.timers[key];
      }, seconds * 1000);
    }
    return Promise.resolve();
  }
}

// Type for Redis configuration
interface RedisConfig {
  url: string;
  password?: string;
  username?: string;
}

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

class RedisService {
  private static instance: RedisService;
  private client: any = null;
  private isConnected: boolean = false;
  private isBrowser: boolean = isBrowser;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get singleton instance of RedisService
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }
  
  /**
   * Initialize Redis connection
   */
  public async connect(config: RedisConfig): Promise<void> {
    try {
      if (this.isBrowser) {
        // Use browser mock in browser environment
        this.client = new BrowserRedisClient();
        await this.client.connect();
        this.isConnected = true;
        console.log('Connected to browser Redis mock');
      } else {
        // Only import the real Redis client in Node.js environment
        const { createClient } = await import('redis');
        this.client = createClient({
          url: config.url,
          password: config.password,
          username: config.username
        });
        
        this.client.on('error', (err: any) => {
          console.error('Redis connection error:', err);
          this.isConnected = false;
        });
        
        this.client.on('connect', () => {
          console.log('Connected to Redis');
          this.isConnected = true;
        });
        
        await this.client.connect();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      if (this.isBrowser) {
        // Fallback to browser mock in case of error
        this.client = new BrowserRedisClient();
        await this.client.connect();
        this.isConnected = true;
        console.log('Fallback to browser Redis mock');
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Check if Redis is connected
   */
  public isRedisConnected(): boolean {
    return this.isConnected && this.client !== null;
  }
  
  /**
   * Store a value in Redis with optional expiration
   */
  public async set(key: string, value: string, expiryInSeconds?: number): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    if (expiryInSeconds) {
      await this.client.set(key, value, { EX: expiryInSeconds });
    } else {
      await this.client.set(key, value);
    }
  }
  
  /**
   * Get a value from Redis
   */
  public async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    return await this.client.get(key);
  }
  
  /**
   * Delete a key from Redis
   */
  public async del(key: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    await this.client.del(key);
  }
  
  /**
   * Set a key with expiration
   */
  public async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    await this.client.setEx(key, seconds, value);
  }
  
  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    const result = await this.client.exists(key);
    return this.isBrowser ? result : result === 1;
  }
  
  /**
   * Get all keys matching a pattern
   */
  public async keys(pattern: string): Promise<string[]> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    return await this.client.keys(pattern);
  }
  
  /**
   * Create a hashed store of values
   */
  public async hSet(key: string, field: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    await this.client.hSet(key, field, value);
  }
  
  /**
   * Get a value from a hash
   */
  public async hGet(key: string, field: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    return await this.client.hGet(key, field);
  }
  
  /**
   * Get all fields and values from a hash
   */
  public async hGetAll(key: string): Promise<Record<string, string>> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    return await this.client.hGetAll(key);
  }
  
  /**
   * Delete a field from a hash
   */
  public async hDel(key: string, field: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    await this.client.hDel(key, field);
  }
  
  /**
   * Set expiration on a key
   */
  public async expire(key: string, seconds: number): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    
    await this.client.expire(key, seconds);
  }
  
  /**
   * Disconnect Redis client
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

export default RedisService;
