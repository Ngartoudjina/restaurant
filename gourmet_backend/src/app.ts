//src/app.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reservationRoutes from './routes/reservation.routes';
import messageRoutes from './routes/message.routes';
import { advancedPerformanceLogger, getPerformanceStats, resetPerformanceStats } from './middlewares/advancedPerformance.middleware';
import { rateLimiter, cleanupRateLimitStore } from './middlewares/rateLimiter.middleware';
import { initializeRedisCache } from './utils/advancedCache';
import { cachingMiddleware } from './middlewares/caching.middleware';
import { requestCoalescingMiddleware } from './middlewares/requestCoalescing.middleware';

dotenv.config();

const app = express();

// ========================================
// INITIALIZATION
// ========================================

// Initialiser Redis cache au démarrage
initializeRedisCache().catch(err => console.error('Redis init error:', err));

// Nettoyer le rate limit store
cleanupRateLimitStore();

// ========================================
// SECURITY & PERFORMANCE MIDDLEWARES
// ========================================

// Helmet pour la sécurité (headers HTTP)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuré selon l'environnement
// On accepte une ou plusieurs origines en production via la variable FRONTEND_URL
const defaultLocalOrigins = ['http://localhost:8080', 'http://localhost:3000'];
const prodOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['https://gourmet-wc5h.onrender.com'];

const allowedOrigins = process.env.NODE_ENV === 'production' ? prodOrigins : defaultLocalOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin non autorisée'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression aggressive (niveau 6 pour balance compression/CPU)
app.use(compression({
  level: 6,
  threshold: 1000, // Compresser seulement les réponses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Parse JSON avec limite de taille optimisée
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Advanced Performance Logger (requis APRÈS compression)
app.use(advancedPerformanceLogger);

// Caching Headers (ETag, Cache-Control)
app.use(cachingMiddleware);

// Request Coalescing (éviter les appels en double)
app.use(requestCoalescingMiddleware);

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
app.get('/api/stats', getPerformanceStats);
app.delete('/api/stats', resetPerformanceStats);

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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



export default app;