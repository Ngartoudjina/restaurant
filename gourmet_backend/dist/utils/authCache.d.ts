export interface CachedUser {
    uid: string;
    email?: string;
    role: 'admin' | 'client';
}
export declare function getCachedUser(token: string): CachedUser | null;
export declare function setCachedUser(token: string, user: CachedUser): void;
//# sourceMappingURL=authCache.d.ts.map