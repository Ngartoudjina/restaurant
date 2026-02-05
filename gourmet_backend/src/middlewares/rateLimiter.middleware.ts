// src/middlewares/rateLimiter.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

/**
 * Simple rate limiter middleware
 * Limite les requêtes par IP
 */
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialiser ou récupérer les données de l'IP
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = { count: 0, resetTime: now + windowMs };
    }

    store[ip].count++;

    // Headers informatifs
    const remainingRequests = Math.max(0, maxRequests - store[ip].count);
    const resetTime = Math.ceil((store[ip].resetTime - now) / 1000);

    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', remainingRequests.toString());
    res.set('X-RateLimit-Reset', resetTime.toString());

    // Vérifier le dépassement
    if (store[ip].count > maxRequests) {
      return res.status(429).json({
        error: 'Trop de requêtes, veuillez réessayer après quelques secondes',
        retryAfter: resetTime
      });
    }

    next();
  };
};

/**
 * Rate limiter par utilisateur (authentifié)
 */
export const userRateLimiter = (maxRequests: number = 500, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?.uid || 'anonymous';
    const key = `user:${userId}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    store[key].count++;

    const remainingRequests = Math.max(0, maxRequests - store[key].count);
    const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', remainingRequests.toString());
    res.set('X-RateLimit-Reset', resetTime.toString());

    if (store[key].count > maxRequests) {
      return res.status(429).json({
        error: 'Quota utilisateur atteint',
        retryAfter: resetTime
      });
    }

    next();
  };
};

/**
 * Rate limiter par endpoint spécifique
 */
export const endpointRateLimiter = (
  endpoint: string,
  maxRequests: number = 50,
  windowMs: number = 60000
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const key = `${endpoint}:${ip}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return res.status(429).json({
        error: `Trop de requêtes sur ${endpoint}`,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }

    next();
  };
};

/**
 * Nettoyer les entrées expirées du store
 */
export const cleanupRateLimitStore = () => {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 60000); // Nettoyage toutes les minutes
};
