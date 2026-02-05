"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachingMiddleware = void 0;
exports.generateETag = generateETag;
exports.getCacheKey = getCacheKey;
const crypto_1 = __importDefault(require("crypto"));
// Cache configs par route
const cacheConfigs = {
    '/api/products': {
        maxAge: 600, // 10 minutes
        public: true,
        staleWhileRevalidate: 86400, // 1 jour
        staleIfError: 604800 // 1 semaine
    },
    '/api/products/[id]': {
        maxAge: 900, // 15 minutes
        public: true,
        staleWhileRevalidate: 86400,
        staleIfError: 604800
    },
    '/api/reservations': {
        maxAge: 60, // 1 minute (données dynamiques)
        public: false,
        staleWhileRevalidate: 300
    },
    '/api/orders': {
        maxAge: 30, // 30 secondes (très dynamique)
        public: false
    }
};
/**
 * Générer un ETag basé sur le contenu
 */
function generateETag(data) {
    return `"${crypto_1.default
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex')
        .substring(0, 16)}"`;
}
/**
 * Middleware pour optimiser le caching HTTP
 */
const cachingMiddleware = (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        // Ne cacher que les GET
        if (req.method === 'GET') {
            // Trouver la config de cache appropriée
            const path = req.path;
            let cacheConfig = cacheConfigs[path];
            // Si pas trouvé, chercher avec pattern (ex: /api/products/[id])
            if (!cacheConfig) {
                for (const [pattern, config] of Object.entries(cacheConfigs)) {
                    if (pattern.includes('[id]')) {
                        const patternRegex = new RegExp(pattern.replace('[id]', '\\w+'));
                        if (patternRegex.test(path)) {
                            cacheConfig = config;
                            break;
                        }
                    }
                }
            }
            if (cacheConfig) {
                const { maxAge = 0, public: isPublic = true, staleWhileRevalidate = 0, staleIfError = 0 } = cacheConfig;
                // Générer ETag uniquement pour réponses non vides
                if (data && Object.keys(data).length > 0) {
                    const etag = generateETag(data);
                    res.set('ETag', etag);
                    // Si client envoie If-None-Match et ETag correspond, retourner 304
                    if (req.headers['if-none-match'] === etag) {
                        res.status(304);
                        return originalJson(data);
                    }
                }
                // Construire Cache-Control header
                const cacheControl = [
                    `${isPublic ? 'public' : 'private'}`,
                    `max-age=${maxAge}`
                ];
                if (staleWhileRevalidate > 0) {
                    cacheControl.push(`stale-while-revalidate=${staleWhileRevalidate}`);
                }
                if (staleIfError > 0) {
                    cacheControl.push(`stale-if-error=${staleIfError}`);
                }
                res.set('Cache-Control', cacheControl.join(', '));
                res.set('Vary', 'Accept-Encoding');
            }
        }
        return originalJson(data);
    };
    next();
};
exports.cachingMiddleware = cachingMiddleware;
/**
 * Mettre en cache basé sur le chemin et query params
 */
function getCacheKey(req) {
    const queryStr = JSON.stringify(req.query);
    return `${req.path}:${queryStr}`;
}
//# sourceMappingURL=caching.middleware.js.map