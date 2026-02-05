// src/middlewares/caching.middleware.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CacheConfig {
  maxAge?: number; // en secondes
  public?: boolean;
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

// Cache configs par route
const cacheConfigs: Record<string, CacheConfig> = {
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
export function generateETag(data: any): string {
  return `"${crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
    .substring(0, 16)}"`;
}

/**
 * Middleware pour optimiser le caching HTTP
 */
export const cachingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
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

/**
 * Mettre en cache basé sur le chemin et query params
 */
export function getCacheKey(req: Request): string {
  const queryStr = JSON.stringify(req.query);
  return `${req.path}:${queryStr}`;
}
