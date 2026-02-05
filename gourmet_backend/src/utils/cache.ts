import { LRUCache } from 'lru-cache';

export type CacheValue<T> = {
  data: T;
};

// Cache avec configuration par défaut
export const appCache = new LRUCache<string, CacheValue<any>>({
  max: 1000,
  ttl: 1000 * 60 * 5, // TTL par défaut : 5 minutes
  updateAgeOnGet: true, // Rafraîchir le TTL à chaque accès
  updateAgeOnHas: false
});

/**
 * Récupérer une valeur du cache
 */
export function getCache<T>(key: string): T | null {
  const value = appCache.get(key);
  return value ? (value.data as T) : null;
}

/**
 * Définir une valeur dans le cache avec TTL optionnel
 * @param key - Clé du cache
 * @param data - Données à mettre en cache
 * @param ttlSeconds - TTL en secondes (optionnel, utilise le TTL par défaut si non spécifié)
 */
export function setCache<T>(key: string, data: T, ttlSeconds?: number): void {
  const options = ttlSeconds ? { ttl: ttlSeconds * 1000 } : {};
  
  appCache.set(key, { data }, options);
}

/**
 * Supprimer une clé du cache
 */
export function deleteCache(key: string): void {
  appCache.delete(key);
}

/**
 * Vider tout le cache
 */
export function clearCache(): void {
  appCache.clear();
}

/**
 * Obtenir des statistiques du cache
 */
export function getCacheStats() {
  return {
    size: appCache.size,
    max: appCache.max
  };
}