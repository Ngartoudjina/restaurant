import { LRUCache } from 'lru-cache';
export type CacheValue<T> = {
    data: T;
};
export declare const appCache: LRUCache<string, CacheValue<any>, unknown>;
/**
 * Récupérer une valeur du cache
 */
export declare function getCache<T>(key: string): T | null;
/**
 * Définir une valeur dans le cache avec TTL optionnel
 * @param key - Clé du cache
 * @param data - Données à mettre en cache
 * @param ttlSeconds - TTL en secondes (optionnel, utilise le TTL par défaut si non spécifié)
 */
export declare function setCache<T>(key: string, data: T, ttlSeconds?: number): void;
/**
 * Supprimer une clé du cache
 */
export declare function deleteCache(key: string): void;
/**
 * Vider tout le cache
 */
export declare function clearCache(): void;
/**
 * Obtenir des statistiques du cache
 */
export declare function getCacheStats(): {
    size: number;
    max: number;
};
//# sourceMappingURL=cache.d.ts.map