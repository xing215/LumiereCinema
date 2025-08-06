const { redisClient } = require('../config/redis.config');
const Ticket = require('../models/Ticket');
const SnackTicket = require('../models/SnackTicket');

/**
 * Ticket Cache Manager - Quản lý cache cho ticket lookup
 * Tối ưu hóa performance cho checkin counter
 */
class TicketCacheManager {
    constructor() {
        this.CACHE_PREFIX = 'ticket:';
        this.CACHE_DURATION = 60; // 1 phút
        this.PRELOAD_LIMIT = 100; // Preload 100 tickets gần nhất
    }

    /**
     * Tạo cache key cho ticket
     */
    getCacheKey(ticketCode) {
        return `${this.CACHE_PREFIX}${ticketCode}`;
    }

    /**
     * Cache ticket data
     */
    async cacheTicket(ticketCode, ticketData) {
        try {
            const cacheKey = this.getCacheKey(ticketCode);
            await redisClient.setEx(cacheKey, this.CACHE_DURATION, JSON.stringify(ticketData));
            return true;
        } catch (error) {
            console.warn('Cache write error:', error);
            return false;
        }
    }

    /**
     * Lấy ticket từ cache
     */
    async getCachedTicket(ticketCode) {
        try {
            const cacheKey = this.getCacheKey(ticketCode);
            const cachedData = await redisClient.get(cacheKey);
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (error) {
            console.warn('Cache read error:', error);
            return null;
        }
    }

    /**
     * Xóa ticket khỏi cache (khi ticket được update)
     */
    async invalidateTicket(ticketCode) {
        try {
            const cacheKey = this.getCacheKey(ticketCode);
            await redisClient.del(cacheKey);
            return true;
        } catch (error) {
            console.warn('Cache invalidate error:', error);
            return false;
        }
    }

    /**
     * Preload các ticket phổ biến vào cache
     * Chạy định kỳ để cache các ticket có khả năng được scan
     */
    async preloadRecentTickets() {
        try {
            console.log('🔄 Preloading recent tickets to cache...');
            
            // Lấy các movie tickets gần đây với status Confirmed
            const recentMovieTickets = await Ticket.find({
                status: 'Confirmed',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Trong 24 giờ qua
            })
            .populate('branch', 'name address')
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'screen', select: 'screenName' }
                ]
            })
            .limit(this.PRELOAD_LIMIT)
            .lean();

            // Lấy các snack tickets gần đây
            const recentSnackTickets = await SnackTicket.find({
                status: 'Confirmed',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            })
            .populate('branch', 'name address')
            .populate({
                path: 'snackList.snack',
                select: 'name price'
            })
            .limit(this.PRELOAD_LIMIT)
            .lean();

            // Cache movie tickets
            for (const ticket of recentMovieTickets) {
                const cacheData = {
                    ...ticket,
                    ticketType: 'Movie',
                    lastScanAt: ticket.lastScanAt
                };
                await this.cacheTicket(ticket.ticketCode, cacheData);
            }

            // Cache snack tickets
            for (const ticket of recentSnackTickets) {
                const cacheData = {
                    ...ticket,
                    ticketType: 'Snack',
                    lastScanAt: ticket.lastScanAt
                };
                await this.cacheTicket(ticket.snackTicketCode, cacheData);
            }

            console.log(`Preloaded ${recentMovieTickets.length} movie tickets and ${recentSnackTickets.length} snack tickets to cache`);
            return {
                movieTickets: recentMovieTickets.length,
                snackTickets: recentSnackTickets.length
            };
        } catch (error) {
            console.error('Error preloading tickets:', error);
            return { error: error.message };
        }
    }

    /**
     * Cache statistics
     */
    async getCacheStats() {
        try {
            const keys = await redisClient.keys(`${this.CACHE_PREFIX}*`);
            return {
                totalCachedTickets: keys.length,
                cachePrefix: this.CACHE_PREFIX,
                cacheDuration: this.CACHE_DURATION
            };
        } catch (error) {
            console.warn('Cache stats error:', error);
            return { error: error.message };
        }
    }

    /**
     * Xóa toàn bộ ticket cache
     */
    async clearTicketCache() {
        try {
            const keys = await redisClient.keys(`${this.CACHE_PREFIX}*`);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            return { cleared: keys.length };
        } catch (error) {
            console.warn('Clear cache error:', error);
            return { error: error.message };
        }
    }
}

module.exports = new TicketCacheManager();
