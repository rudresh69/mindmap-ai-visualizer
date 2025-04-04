
/**
 * This is a frontend service that interacts with the backend Redis cache.
 * The actual Redis operations happen on the backend.
 */
export class MindMapCache {
  /**
   * Attempts to get a cached mindmap
   * @param topic The topic of the mindmap
   * @param type The type of mindmap: 'simple', 'analogy', or 'text'
   * @returns The cached mindmap or null if not found
   */
  static async getCachedMindMap(topic: string, type: 'simple' | 'analogy' | 'text'): Promise<any | null> {
    try {
      const response = await fetch(`/api/mindmap/cache?topic=${encodeURIComponent(topic)}&type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.cached ? data.mindmap : null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching cached mindmap:', error);
      return null;
    }
  }
  
  /**
   * Stores a mindmap in the cache
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
