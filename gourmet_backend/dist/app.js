"use strict";
//src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const advancedPerformance_middleware_1 = require("./middlewares/advancedPerformance.middleware");
const rateLimiter_middleware_1 = require("./middlewares/rateLimiter.middleware");
const advancedCache_1 = require("./utils/advancedCache");
const caching_middleware_1 = require("./middlewares/caching.middleware");
const requestCoalescing_middleware_1 = require("./middlewares/requestCoalescing.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// ========================================
// INITIALIZATION
// ========================================
// Initialiser Redis cache au démarrage
(0, advancedCache_1.initializeRedisCache)().catch(err => console.error('Redis init error:', err));
// Nettoyer le rate limit store
(0, rateLimiter_middleware_1.cleanupRateLimitStore)();
// ========================================
// SECURITY & PERFORMANCE MIDDLEWARES
// ========================================
// Helmet pour la sécurité (headers HTTP)
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS configuré selon l'environnement
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://votre-domaine.com']
    : ['http://localhost:8080', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Compression aggressive (niveau 6 pour balance compression/CPU)
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1000, // Compresser seulement les réponses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    }
}));
// Parse JSON avec limite de taille optimisée
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Advanced Performance Logger (requis APRÈS compression)
app.use(advancedPerformance_middleware_1.advancedPerformanceLogger);
// Caching Headers (ETag, Cache-Control)
app.use(caching_middleware_1.cachingMiddleware);
// Request Coalescing (éviter les appels en double)
app.use(requestCoalescing_middleware_1.requestCoalescingMiddleware);
// Rate Limiting (optionnel, décommenter en production)
// app.use(rateLimiter(100, 60000)); // 100 req/min par IP
// ========================================
// ROUTES
// ========================================
// Route racine (health check)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Le Gourmet Restaurant',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            products: '/api/products',
            orders: '/api/orders',
            reservations: '/api/reservations',
            stats: '/api/stats'
        }
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Performance stats endpoint (admin)
app.get('/api/stats', advancedPerformance_middleware_1.getPerformanceStats);
app.delete('/api/stats', advancedPerformance_middleware_1.resetPerformanceStats);
// API Routes
app.use('/api/products', product_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/reservations', reservation_routes_1.default);
app.use('/api/messages', message_routes_1.default);
// ========================================
// ERROR HANDLING
// ========================================
// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        path: req.path,
        method: req.method
    });
});
// Gestion des erreurs serveur
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.stack);
    // Ne pas exposer les détails en production
    const message = process.env.NODE_ENV === 'production'
        ? 'Une erreur est survenue'
        : err.message;
    res.status(err.status || 500).json({
        success: false,
        error: 'Erreur serveur',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map