"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.verifyToken = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const authCache_1 = require("../utils/authCache");
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        const token = authHeader.split('Bearer ')[1];
        // ⚡ CACHE HIT
        const cachedUser = (0, authCache_1.getCachedUser)(token);
        if (cachedUser) {
            req.user = cachedUser;
            return next();
        }
        // 🔥 Firebase vérification
        const decoded = await firebase_admin_1.default.auth().verifyIdToken(token);
        const userDoc = await firebase_admin_1.default.firestore().doc(`users/${decoded.uid}`).get();
        const user = {
            uid: decoded.uid,
            email: decoded.email,
            role: userDoc.data()?.role || 'client',
        };
        (0, authCache_1.setCachedUser)(token, user);
        req.user = user;
        next();
    }
    catch {
        res.status(403).json({ error: 'Token invalide' });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin uniquement' });
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.middleware.js.map