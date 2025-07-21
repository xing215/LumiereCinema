const { redisClient } = require('../config/redis.config');

/**
 * Cache Manager for Seat Booking System
 * Handles Redis caching operations for seat layouts, branch data, and schedule information
 */
class CacheManager {
  
  /**
   * Generate seat layout and cache it in Redis
   * @param {number} rows - Number of rows in the screen
   * @param {number} columns - Number of columns in the screen
   * @returns {Promise<Array>} Array of seat numbers
   */
  static async getSeatLayout(rows, columns) {
    const cacheKey = `seat_layout_${rows}_${columns}`;
    
    try {
      // Try to get from cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Generate seat layout
      const allSeats = [];
      for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row); // A, B, C, ...
        for (let col = 1; col <= columns; col++) {
          allSeats.push(`${rowLetter}${col}`);
        }
      }

      // Cache for 24 hours (seat layouts don't change often)
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(allSeats));
      
      return allSeats;
    } catch (error) {
      console.warn('Redis cache error for seat layout, falling back to generation:', error);
      
      // Fallback: generate without caching
      const allSeats = [];
      for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row);
        for (let col = 1; col <= columns; col++) {
          allSeats.push(`${rowLetter}${col}`);
        }
      }
      return allSeats;
    }
  }

  /**
   * Cache branch information
   * @param {string} branchId - Branch ID
   * @param {Object} branchData - Branch data to cache
   */
  static async cacheBranchInfo(branchId, branchData) {
    const cacheKey = `branch_info_${branchId}`;
    
    try {
      // Cache for 1 hour (branch info doesn't change frequently)
      await redisClient.setEx(cacheKey, 60 * 60, JSON.stringify(branchData));
    } catch (error) {
      console.warn('Failed to cache branch info:', error);
    }
  }

  /**
   * Get cached branch information
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object|null>} Cached branch data or null
   */
  static async getCachedBranchInfo(branchId) {
    const cacheKey = `branch_info_${branchId}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached branch info:', error);
      return null;
    }
  }

  /**
   * Cache seat map structure for a specific schedule
   * @param {string} scheduleId - Schedule ID
   * @param {Object} seatMapData - Seat map data to cache
   */
  static async cacheSeatMapStructure(scheduleId, seatMapData) {
    const cacheKey = `seat_map_${scheduleId}`;
    
    try {
      // Cache for 5 minutes (seat status changes frequently)
      await redisClient.setEx(cacheKey, 5 * 60, JSON.stringify(seatMapData));
    } catch (error) {
      console.warn('Failed to cache seat map structure:', error);
    }
  }

  /**
   * Get cached seat map structure
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<Object|null>} Cached seat map data or null
   */
  static async getCachedSeatMapStructure(scheduleId) {
    const cacheKey = `seat_map_${scheduleId}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached seat map structure:', error);
      return null;
    }
  }

  /**
   * Invalidate schedule-related cache when seat holds are created/updated
   * @param {string} scheduleId - Schedule ID
   */
  static async invalidateScheduleCache(scheduleId) {
    try {
      const keys = [
        `seat_map_${scheduleId}`,
        `schedule_cache_${scheduleId}`
      ];
      
      await Promise.all(
        keys.map(key => redisClient.del(key).catch(err => 
          console.warn(`Failed to delete cache key ${key}:`, err)
        ))
      );
    } catch (error) {
      console.warn('Failed to invalidate schedule cache:', error);
    }
  }

  /**
   * Get cache statistics and performance metrics
   * @returns {Promise<Object>} Cache statistics
   */
  static async getCacheStats() {
    try {
      const info = await redisClient.info('memory');
      const keyCount = await redisClient.dbSize();
      
      return {
        keyCount,
        memoryInfo: info,
        timestamp: new Date()
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Cleanup expired cache entries
   * @returns {Promise<number>} Number of keys cleaned up
   */
  static async cleanupCache() {
    try {
      // This is handled automatically by Redis TTL, but we can implement custom cleanup here
      const patterns = [
        'seat_layout_*',
        'branch_info_*',
        'seat_map_*',
        'schedule_cache_*'
      ];
      
      let cleanedCount = 0;
      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        for (const key of keys) {
          const ttl = await redisClient.ttl(key);
          if (ttl === -1) { // Key exists but has no expiration
            await redisClient.expire(key, 3600); // Set 1 hour expiration
            cleanedCount++;
          }
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
      return 0;
    }
  }

  /**
   * Preload cache for frequently accessed data
   * @param {Array} popularRoutes - Array of {branchId, scheduleId} objects
   */
  static async preloadCache(popularRoutes = []) {
    try {
      // Preloading cache for popular routes
      
      // This would be called during off-peak hours to warm up the cache
      // Implementation depends on your specific needs
      
      return { preloaded: popularRoutes.length };
    } catch (error) {
      console.warn('Failed to preload cache:', error);
      return { error: error.message };
    }
  }
}

module.exports = CacheManager;