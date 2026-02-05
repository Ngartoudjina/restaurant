/**
 * Utilitaires pour optimiser les requêtes
 */
/**
 * Parallel batch reads - Lire plusieurs collections en parallèle
 */
export declare function parallelBatchReads(queries: Array<{
    name: string;
    promise: Promise<any>;
}>): Promise<Record<string, any>>;
/**
 * Utility pour gérer les large result sets avec streaming
 */
export declare function createStreamableResponse(data: any[], chunkSize?: number): {
    totalCount: number;
    chunks: number;
    [Symbol.iterator](): Generator<any[], void, unknown>;
};
/**
 * Circuit breaker pour Firestore (éviter de surcharger)
 */
export declare class FirestoreCircuitBreaker {
    private failureThreshold;
    private successThreshold;
    private timeout;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private state;
    constructor(failureThreshold?: number, successThreshold?: number, timeout?: number);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): "closed" | "open" | "half-open";
}
/**
 * Debounce pour éviter les updates en cascade
 */
export declare function createDebouncedBatchUpdate(batchUpdateFn: (items: any[]) => Promise<void>, delayMs?: number, maxItems?: number): (item: any) => Promise<void>;
export declare function compressData(data: any): Promise<Buffer>;
export declare function decompressData(buffer: Buffer): Promise<any>;
//# sourceMappingURL=requestOptimization.d.ts.map