// src/utils/advancedCache.ts
import { LRUCache } from 'lru-cache';
import { createClient } from 'redis';
import { promisify } from 'util';

// Types
export interface CacheOptions {
  ttl?: number; // seconds
  compressionLevel?: 'high' | 'medium' | 'low';
}

// Redis client (optionnel)
let redisClient: ReturnType<typeof createClient> | null = null;
let redisConnected = false;

// Local L1 cache (très rapide)
const l1Cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: false
});

// Initialiser Redis si disponible
export async function initializeRedisCache() {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('⚠️  REDIS_URL non configurée, utilisation du cache local uniquement');
      return;
    }

    redisClient = createClient({ url: redisUrl });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connecté avec succès');
      redisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Erreur initialisation Redis:', error);
    redisConnected = false;
  }
}

/**
 * Obtenir une valeur du cache (L1 puis L2 Redis)
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    // L1 Cache - Très rapide
    const l1Value = l1Cache.get(key);
    if (l1Value !== undefined) {
      console.log(`✅ L1 Cache HIT: ${key}`);
      return l1Value as T;
    }

    // L2 Cache - Redis (si disponible)
    if (redisConnected && redisClient) {
      const l2Value = await redisClient.get(key);
      if (l2Value) {
        try {
          const parsed = JSON.parse(l2Value);
          l1Cache.set(key, parsed); // Promouvoir en L1
          console.log(`✅ L2 Cache HIT (Redis): ${key}`);
          return parsed as T;
        } catch {
          return null;
        }
      }
    }

    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Erreur lecture cache ${key}:`, error);
    return null;
  }
}

/**
 * Définir une valeur dans le cache (L1 + L2)
 */
export async function setInCache<T>(
  key: string,
  data: T,
  options?: CacheOptions
): Promise<void> {
  try {
    const ttlSeconds = options?.ttl || 300; // 5 minutes par défaut

    // L1 Cache
    l1Cache.set(key, data, { ttl: ttlSeconds * 1000 });

    // L2 Cache - Redis
    if (redisConnected && redisClient) {
      try {
        const serialized = JSON.stringify(data);
        await redisClient.setEx(key, ttlSeconds, serialized);
      } catch (redisError) {
        console.warn(`⚠️  Redis set failed for ${key}:`, redisError);
      }
    }
  } catch (error) {
    console.error(`Erreur écriture cache ${key}:`, error);
  }
}

/**
 * Supprimer une clé du cache
 */
export async function deleteFromCache(key: string): Promise<void> {
  try {
    l1Cache.delete(key);
    
    if (redisConnected && redisClient) {
      try {
        await redisClient.del(key);
      } catch (redisError) {
        console.warn(`⚠️  Redis del failed for ${key}:`, redisError);
      }
    }
  } catch (error) {
    console.error(`Erreur suppression cache ${key}:`, error);
  }
}

/**
 * Invalider un pattern de cache (ex: "products:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    // L1 Cache
    const keys = Array.from(l1Cache.keys());
    keys.forEach((key: string) => {
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
      } catch (redisError) {
        console.warn(`⚠️  Redis pattern delete failed:`, redisError);
      }
    }
  } catch (error) {
    console.error(`Erreur invalidation pattern ${pattern}:`, error);
  }
}

/**
 * Vider complètement le cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    l1Cache.clear();
    
    if (redisConnected && redisClient) {
      try {
        await redisClient.flushDb();
      } catch (redisError) {
        console.warn(`⚠️  Redis flush failed:`, redisError);
      }
    }
  } catch (error) {
    console.error('Erreur vidage cache:', error);
  }
}

/**
 * Obtenir les statistiques du cache
 */
export function getCacheStats() {
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
export async function closeRedisCache(): Promise<void> {
  if (redisClient && redisConnected) {
    try {
      await redisClient.disconnect();
      redisConnected = false;
      console.log('✅ Redis déconnecté');
    } catch (error) {
      console.error('Erreur fermeture Redis:', error);
    }
  }
}

// Utilitaire
function matchPattern(str: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexPattern}$`).test(str);
}
