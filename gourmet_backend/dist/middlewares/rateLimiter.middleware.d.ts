import { Request, Response, NextFunction } from 'express';
/**
 * Simple rate limiter middleware
 * Limite les requêtes par IP
 */
export declare const rateLimiter: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Rate limiter par utilisateur (authentifié)
 */
export declare const userRateLimiter: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Rate limiter par endpoint spécifique
 */
export declare const endpointRateLimiter: (endpoint: string, maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Nettoyer les entrées expirées du store
 */
export declare const cleanupRateLimitStore: () => void;
//# sourceMappingURL=rateLimiter.middleware.d.ts.map