import { Request, Response, NextFunction } from 'express';
import { CachedUser } from '../utils/authCache';
declare global {
    namespace Express {
        interface Request {
            user?: CachedUser;
        }
    }
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map