// src/middlewares/requestCoalescing.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface PendingRequest {
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout?: NodeJS.Timeout;
}

// Map des requêtes en attente : key -> Promise
const pendingRequests = new Map<string, PendingRequest>();

/**
 * Générer une clé unique pour une requête
 */
function getRequestKey(req: Request): string {
  return `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
}

/**
 * Middleware pour coalescer les requêtes identiques
 * Si deux requêtes identiques arrivent simultanément, la deuxième attend le résultat de la première
 */
export const requestCoalescingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Seulement pour GET (idempotentes)
  if (req.method !== 'GET') {
    return next();
  }

  const key = getRequestKey(req);

  // Si une requête identique est déjà en cours
  if (pendingRequests.has(key)) {
    console.log(`⚡ Coalescing request: ${key}`);
    const pending = pendingRequests.get(key)!;
    
    // Attendre et utiliser le résultat (avec catch pour éviter unhandled rejection)
    pending.promise
      .then((cachedRes) => {
        res.status(cachedRes.status).json(cachedRes.data);
      })
      .catch((error: any) => {
        console.error(`Coalescing error for ${key}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
      });
    return;
  }

  // Sinon, créer une nouvelle requête
  const originalJson = res.json.bind(res);
  let responseData: any;
  let responseStatus = 200;
  let resolved = false;

  // Wrapper de res.json pour capturer la réponse
  res.json = function (data: any) {
    responseData = data;
    responseStatus = res.statusCode;

    // Résoudre les requêtes en attente (une seule fois)
    if (!resolved) {
      resolved = true;
      const pending = pendingRequests.get(key);
      if (pending) {
        pending.resolve({ status: responseStatus, data: responseData });
        // Garder l'entrée en map mais clear le timeout
        if (pending.timeout) clearTimeout(pending.timeout);
        // Supprimer après délai pour éviter les fuites
        setTimeout(() => pendingRequests.delete(key), 1000);
      }
    }

    return originalJson(data);
  };

  // Créer la promise pour cette requête avec resolve/reject propres
  let resolvePromise: (value: any) => void;
  let rejectPromise: (error: any) => void;

  const promise = new Promise<any>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  // Créer le timeout
  const timeout = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      rejectPromise(new Error('Request coalescing timeout'));
      pendingRequests.delete(key);
    }
  }, 30000);

  // Nettoyer le timeout quand la requête finit
  res.once('finish', () => {
    clearTimeout(timeout);
  });

  res.once('error', (err) => {
    clearTimeout(timeout);
    if (!resolved) {
      resolved = true;
      rejectPromise(err);
    }
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, { promise, resolve: resolvePromise!, reject: rejectPromise!, timeout });

  next();
};

export default requestCoalescingMiddleware;
