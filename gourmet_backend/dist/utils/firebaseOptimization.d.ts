/**
 * Configuration des index composites Firestore recommandés
 * À créer manuellement dans la Firebase Console
 */
export declare const RECOMMENDED_FIRESTORE_INDEXES: {
    collection: string;
    fields: {
        fieldPath: string;
        direction: string;
    }[];
    description: string;
}[];
/**
 * Exemple de batch read (récupérer plusieurs documents en parallèle)
 */
export declare function batchGetProducts(productIds: string[]): Promise<{
    id: string;
}[]>;
/**
 * Batch write (écrire plusieurs documents en une seule requête)
 */
export declare function batchUpdateOrderStatuses(updates: Array<{
    id: string;
    status: string;
}>): Promise<void>;
/**
 * Utiliser runTransaction pour garantir la cohérence
 */
export declare function transactionalOrderCreation(userId: string, orderData: any): Promise<string>;
/**
 * Pagination efficace avec cursor
 */
export declare function getProductsWithCursor(limit?: number, cursor?: string): Promise<{
    data: {
        id: string;
    }[];
    nextCursor: string | null;
    hasMore: boolean;
}>;
/**
 * Aggregation query (compter les documents rapidement)
 */
export declare function getProductCount(category?: string): Promise<any>;
//# sourceMappingURL=firebaseOptimization.d.ts.map