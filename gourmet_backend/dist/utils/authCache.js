"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedUser = getCachedUser;
exports.setCachedUser = setCachedUser;
const authCache = new Map();
function getCachedUser(token) {
    return authCache.get(token) || null;
}
function setCachedUser(token, user) {
    authCache.set(token, user);
    setTimeout(() => authCache.delete(token), 10 * 60 * 1000); // 10 min
}
//# sourceMappingURL=authCache.js.map