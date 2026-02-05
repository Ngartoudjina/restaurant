export interface CacheOptions {
    ttl?: number;
    compressionLevel?: 'high' | 'medium' | 'low';
}
export declare function initializeRedisCache(): Promise<void>;
/**
 * Obtenir une valeur du cache (L1 puis L2 Redis)
 */
export declare function getFromCache<T>(key: string): Promise<T | null>;
/**
 * Définir une valeur dans le cache (L1 + L2)
 */
export declare function setInCache<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
/**
 * Supprimer une clé du cache
 */
export declare function deleteFromCache(key: string): Promise<void>;
/**
 * Invalider un pattern de cache (ex: "products:*")
 */
export declare function invalidateCachePattern(pattern: string): Promise<void>;
/**
 * Vider complètement le cache
 */
export declare function clearAllCache(): Promise<void>;
/**
 * Obtenir les statistiques du cache
 */
export declare function getCacheStats(): {
    l1: {
        size: number;
        max: number;
    };
    l2: {
        enabled: boolean;
        url: string;
    };
};
/**
 * Fermer la connexion Redis
 */
export declare function closeRedisCache(): Promise<void>;
//# sourceMappingURL=advancedCache.d.ts.map