export interface CachedUser {
  uid: string;
  email?: string;
  role: 'admin' | 'client';
}

const authCache = new Map<string, CachedUser>();

export function getCachedUser(token: string): CachedUser | null {
  return authCache.get(token) || null;
}

export function setCachedUser(token: string, user: CachedUser): void {
  authCache.set(token, user);
  setTimeout(() => authCache.delete(token), 10 * 60 * 1000); // 10 min
}
