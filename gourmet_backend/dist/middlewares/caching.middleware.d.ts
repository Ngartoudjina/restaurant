import { Request, Response, NextFunction } from 'express';
/**
 * Générer un ETag basé sur le contenu
 */
export declare function generateETag(data: any): string;
/**
 * Middleware pour optimiser le caching HTTP
 */
export declare const cachingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Mettre en cache basé sur le chemin et query params
 */
export declare function getCacheKey(req: Request): string;
//# sourceMappingURL=caching.middleware.d.ts.map