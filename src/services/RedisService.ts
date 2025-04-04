
/**
 * Redis service for handling session management and caching
 */

import { createClient, RedisClientType } from 'redis';

// Type for Redis configuration
interface RedisConfig {
  url: string;
  password?: string;
  username?: string;
}

class RedisService {
  private static instance: RedisService;
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  
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
      this.client = createClient({
        url: config.url,
        password: config.password,
        username: config.username
      });
      
      this.client.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.isConnected = false;
      });
      
      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });
      
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
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
    return result === 1;
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
