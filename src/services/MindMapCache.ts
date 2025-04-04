
import RedisService from './RedisService';

/**
 * This is a service that uses Redis to cache mindmaps
 */
export class MindMapCache {
  private static redis: RedisService = RedisService.getInstance();
  private static readonly CACHE_PREFIX = 'mindmap:';
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
  
  /**
   * Generate cache key for a mindmap
   */
  private static getCacheKey(topic: string, type: 'simple' | 'analogy' | 'text'): string {
    const normalizedTopic = topic.toLowerCase().trim();
    return `${this.CACHE_PREFIX}${type}:${normalizedTopic}`;
  }
  
  /**
   * Attempts to get a cached mindmap from Redis
   * @param topic The topic of the mindmap
   * @param type The type of mindmap: 'simple', 'analogy', or 'text'
   * @returns The cached mindmap or null if not found
   */
  static async getCachedMindMap(topic: string, type: 'simple' | 'analogy' | 'text'): Promise<any | null> {
    try {
      // Try getting from local Redis first (fallback to API if Redis is not available)
      if (this.redis.isRedisConnected()) {
        const cacheKey = this.getCacheKey(topic, type);
        const cachedData = await this.redis.get(cacheKey);
        
        if (cachedData) {
          console.log(`Cache hit for mindmap: ${topic} (${type})`);
          return JSON.parse(cachedData);
        }
      }
      
      // If not in Redis or Redis is not connected, try the API
      const response = await fetch(`/api/mindmap/cache?topic=${encodeURIComponent(topic)}&type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // If we got data from API and Redis is connected, store it in Redis
        if (data.cached && data.mindmap && this.redis.isRedisConnected()) {
          await this.cacheMindMap(topic, type, data.mindmap);
        }
        return data.cached ? data.mindmap : null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching cached mindmap:', error);
      return null;
    }
  }
  
  /**
   * Stores a mindmap in the Redis cache
   * @param topic The topic of the mindmap
   * @param type The type of mindmap: 'simple', 'analogy', or 'text'
   * @param mindmapData The mindmap data to cache
   * @returns Boolean indicating success
   */
  static async cacheMindMap(
    topic: string, 
    type: 'simple' | 'analogy' | 'text', 
    mindmapData: any
  ): Promise<boolean> {
    try {
      // Cache in Redis if connected
      if (this.redis.isRedisConnected()) {
        const cacheKey = this.getCacheKey(topic, type);
        await this.redis.set(
          cacheKey,
          JSON.stringify(mindmapData),
          this.CACHE_EXPIRY
        );
        console.log(`Cached mindmap in Redis: ${topic} (${type})`);
      }
      
      // Also cache on the backend
      const response = await fetch('/api/mindmap/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          topic,
          type,
          mindmap: mindmapData,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error caching mindmap:', error);
      return false;
    }
  }
  
  /**
   * Clears specific mindmap from cache
   * @param topic The topic of the mindmap
   * @param type The type of mindmap: 'simple', 'analogy', or 'text'
   * @returns Boolean indicating success
   */
  static async clearCachedMindMap(
    topic: string, 
    type: 'simple' | 'analogy' | 'text'
  ): Promise<boolean> {
    try {
      // Clear from Redis if connected
      if (this.redis.isRedisConnected()) {
        const cacheKey = this.getCacheKey(topic, type);
        await this.redis.del(cacheKey);
      }
      
      // Also clear from backend cache
      const response = await fetch('/api/mindmap/cache', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          topic,
          type,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error clearing cached mindmap:', error);
      return false;
    }
  }
}
