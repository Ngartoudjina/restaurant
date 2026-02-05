"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRedisCache = initializeRedisCache;
exports.getFromCache = getFromCache;
exports.setInCache = setInCache;
exports.deleteFromCache = deleteFromCache;
exports.invalidateCachePattern = invalidateCachePattern;
exports.clearAllCache = clearAllCache;
exports.getCacheStats = getCacheStats;
exports.closeRedisCache = closeRedisCache;
// src/utils/advancedCache.ts
const lru_cache_1 = require("lru-cache");
const redis_1 = require("redis");
// Redis client (optionnel)
let redisClient = null;
let redisConnected = false;
// Local L1 cache (très rapide)
const l1Cache = new lru_cache_1.LRUCache({
    max: 500,
    ttl: 1000 * 60 * 5, // 5 minutes
    updateAgeOnGet: true,
    updateAgeOnHas: false
});
// Initialiser Redis si disponible
async function initializeRedisCache() {
    try {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            console.log('⚠️  REDIS_URL non configurée, utilisation du cache local uniquement');
            return;
        }
        redisClient = (0, redis_1.createClient)({ url: redisUrl });
        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
            redisConnected = false;
        });
        redisClient.on('connect', () => {
            console.log('✅ Redis connecté avec succès');
            redisConnected = true;
        });
        await redisClient.connect();
    }
    catch (error) {
        console.error('❌ Erreur initialisation Redis:', error);
        redisConnected = false;
    }
}
/**
 * Obtenir une valeur du cache (L1 puis L2 Redis)
 */
async function getFromCache(key) {
    try {
        // L1 Cache - Très rapide
        const l1Value = l1Cache.get(key);
        if (l1Value !== undefined) {
            console.log(`✅ L1 Cache HIT: ${key}`);
            return l1Value;
        }
        // L2 Cache - Redis (si disponible)
        if (redisConnected && redisClient) {
            const l2Value = await redisClient.get(key);
            if (l2Value) {
                try {
                    const parsed = JSON.parse(l2Value);
                    l1Cache.set(key, parsed); // Promouvoir en L1
                    console.log(`✅ L2 Cache HIT (Redis): ${key}`);
                    return parsed;
                }
                catch {
                    return null;
                }
            }
        }
        console.log(`❌ Cache MISS: ${key}`);
        return null;
    }
    catch (error) {
        console.error(`Erreur lecture cache ${key}:`, error);
        return null;
    }
}
/**
 * Définir une valeur dans le cache (L1 + L2)
 */
async function setInCache(key, data, options) {
    try {
        const ttlSeconds = options?.ttl || 300; // 5 minutes par défaut
        // L1 Cache
        l1Cache.set(key, data, { ttl: ttlSeconds * 1000 });
        // L2 Cache - Redis
        if (redisConnected && redisClient) {
            try {
                const serialized = JSON.stringify(data);
                await redisClient.setEx(key, ttlSeconds, serialized);
            }
            catch (redisError) {
                console.warn(`⚠️  Redis set failed for ${key}:`, redisError);
            }
        }
    }
    catch (error) {
        console.error(`Erreur écriture cache ${key}:`, error);
    }
}
/**
 * Supprimer une clé du cache
 */
async function deleteFromCache(key) {
    try {
        l1Cache.delete(key);
        if (redisConnected && redisClient) {
            try {
                await redisClient.del(key);
            }
            catch (redisError) {
                console.warn(`⚠️  Redis del failed for ${key}:`, redisError);
            }
        }
    }
    catch (error) {
        console.error(`Erreur suppression cache ${key}:`, error);
    }
}
/**
 * Invalider un pattern de cache (ex: "products:*")
 */
async function invalidateCachePattern(pattern) {
    try {
        // L1 Cache
        const keys = Array.from(l1Cache.keys());
        keys.forEach((key) => {
            if (matchPattern(key, pattern)) {
                l1Cache.delete(key);
            }
        });
        // L2 Cache - Redis
        if (redisConnected && redisClient) {
            try {
                const redisPattern = pattern.replace('*', '*');
                const matchedKeys = await redisClient.keys(redisPattern);
                if (matchedKeys.length > 0) {
                    await redisClient.del(matchedKeys);
                }
            }
            catch (redisError) {
                console.warn(`⚠️  Redis pattern delete failed:`, redisError);
            }
        }
    }
    catch (error) {
        console.error(`Erreur invalidation pattern ${pattern}:`, error);
    }
}
/**
 * Vider complètement le cache
 */
async function clearAllCache() {
    try {
        l1Cache.clear();
        if (redisConnected && redisClient) {
            try {
                await redisClient.flushDb();
            }
            catch (redisError) {
                console.warn(`⚠️  Redis flush failed:`, redisError);
            }
        }
    }
    catch (error) {
        console.error('Erreur vidage cache:', error);
    }
}
/**
 * Obtenir les statistiques du cache
 */
function getCacheStats() {
    return {
        l1: {
            size: l1Cache.size,
            max: l1Cache.max
        },
        l2: {
            enabled: redisConnected,
            url: process.env.REDIS_URL ? '***' : 'not-configured'
        }
    };
}
/**
 * Fermer la connexion Redis
 */
async function closeRedisCache() {
    if (redisClient && redisConnected) {
        try {
            await redisClient.disconnect();
            redisConnected = false;
            console.log('✅ Redis déconnecté');
        }
        catch (error) {
            console.error('Erreur fermeture Redis:', error);
        }
    }
}
// Utilitaire
function matchPattern(str, pattern) {
    const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`).test(str);
}
//# sourceMappingURL=advancedCache.js.map