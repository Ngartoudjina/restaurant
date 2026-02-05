import { Request, Response, NextFunction } from 'express';
/**
 * Middleware pour coalescer les requêtes identiques
 * Si deux requêtes identiques arrivent simultanément, la deuxième attend le résultat de la première
 */
export declare const requestCoalescingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default requestCoalescingMiddleware;
//# sourceMappingURL=requestCoalescing.middleware.d.ts.map