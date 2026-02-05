import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { getCachedUser, setCachedUser, CachedUser } from '../utils/authCache';

declare global {
  namespace Express {
    interface Request {
      user?: CachedUser;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split('Bearer ')[1];

    // ⚡ CACHE HIT
    const cachedUser = getCachedUser(token);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // 🔥 Firebase vérification
    const decoded = await admin.auth().verifyIdToken(token);
    const userDoc = await admin.firestore().doc(`users/${decoded.uid}`).get();

    const user: CachedUser = {
      uid: decoded.uid,
      email: decoded.email,
      role: (userDoc.data()?.role as 'admin' | 'client') || 'client',
    };

    setCachedUser(token, user);
    req.user = user;
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin uniquement' });
  }
  next();
};
