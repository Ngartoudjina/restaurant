"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appCache = void 0;
exports.getCache = getCache;
exports.setCache = setCache;
exports.deleteCache = deleteCache;
exports.clearCache = clearCache;
exports.getCacheStats = getCacheStats;
const lru_cache_1 = require("lru-cache");
// Cache avec configuration par défaut
exports.appCache = new lru_cache_1.LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 5, // TTL par défaut : 5 minutes
    updateAgeOnGet: true, // Rafraîchir le TTL à chaque accès
    updateAgeOnHas: false
});
/**
 * Récupérer une valeur du cache
 */
function getCache(key) {
    const value = exports.appCache.get(key);
    return value ? value.data : null;
}
/**
 * Définir une valeur dans le cache avec TTL optionnel
 * @param key - Clé du cache
 * @param data - Données à mettre en cache
 * @param ttlSeconds - TTL en secondes (optionnel, utilise le TTL par défaut si non spécifié)
 */
function setCache(key, data, ttlSeconds) {
    const options = ttlSeconds ? { ttl: ttlSeconds * 1000 } : {};
    exports.appCache.set(key, { data }, options);
}
/**
 * Supprimer une clé du cache
 */
function deleteCache(key) {
    exports.appCache.delete(key);
}
/**
 * Vider tout le cache
 */
function clearCache() {
    exports.appCache.clear();
}
/**
 * Obtenir des statistiques du cache
 */
function getCacheStats() {
    return {
        size: exports.appCache.size,
        max: exports.appCache.max
    };
}
//# sourceMappingURL=cache.js.map