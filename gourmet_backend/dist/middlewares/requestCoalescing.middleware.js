"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCoalescingMiddleware = void 0;
// Map des requêtes en attente : key -> Promise
const pendingRequests = new Map();
/**
 * Générer une clé unique pour une requête
 */
function getRequestKey(req) {
    return `${req.method}:${req.path}:${JSON.stringify(req.query)}:${JSON.stringify(req.body)}`;
}
/**
 * Middleware pour coalescer les requêtes identiques
 * Si deux requêtes identiques arrivent simultanément, la deuxième attend le résultat de la première
 */
const requestCoalescingMiddleware = (req, res, next) => {
    // Seulement pour GET (idempotentes)
    if (req.method !== 'GET') {
        return next();
    }
    const key = getRequestKey(req);
    // Si une requête identique est déjà en cours
    if (pendingRequests.has(key)) {
        console.log(`⚡ Coalescing request: ${key}`);
        const pending = pendingRequests.get(key);
        // Attendre et utiliser le résultat
        pending.promise
            .then((cachedRes) => {
            res.status(cachedRes.status).json(cachedRes.data);
        })
            .catch((error) => {
            next(error);
        });
        return;
    }
    // Sinon, créer une nouvelle requête
    const originalJson = res.json.bind(res);
    let responseData;
    let responseStatus = 200;
    // Wrapper de res.json pour capturer la réponse
    res.json = function (data) {
        responseData = data;
        responseStatus = res.statusCode;
        // Résoudre les requêtes en attente
        const pending = pendingRequests.get(key);
        if (pending) {
            pending.resolve({ status: responseStatus, data: responseData });
            pendingRequests.delete(key);
        }
        return originalJson(data);
    };
    // Créer la promise pour cette requête
    const promise = new Promise((resolve, reject) => {
        // Timeout après 30 secondes
        const timeout = setTimeout(() => {
            pendingRequests.delete(key);
            reject(new Error('Request coalescing timeout'));
        }, 30000);
        res.on('finish', () => clearTimeout(timeout));
        res.on('error', () => {
            clearTimeout(timeout);
            pendingRequests.delete(key);
        });
    });
    pendingRequests.set(key, { promise, resolve: () => { }, reject: () => { } });
    next();
};
exports.requestCoalescingMiddleware = requestCoalescingMiddleware;
/**
 * Nettoyer les requêtes qui n'ont pas répondu après 30s
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, pending] of pendingRequests.entries()) {
        // Nettoyer les anciennes entrées (sécurité)
        pending.reject(new Error('Request coalescing cleanup'));
    }
}, 60000);
exports.default = exports.requestCoalescingMiddleware;
//# sourceMappingURL=requestCoalescing.middleware.js.map