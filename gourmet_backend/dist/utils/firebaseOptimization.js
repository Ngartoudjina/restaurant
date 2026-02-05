"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECOMMENDED_FIRESTORE_INDEXES = void 0;
exports.batchGetProducts = batchGetProducts;
exports.batchUpdateOrderStatuses = batchUpdateOrderStatuses;
exports.transactionalOrderCreation = transactionalOrderCreation;
exports.getProductsWithCursor = getProductsWithCursor;
exports.getProductCount = getProductCount;
// src/utils/firebaseOptimization.ts
const firebase_1 = require("../config/firebase");
/**
 * Configuration des index composites Firestore recommandés
 * À créer manuellement dans la Firebase Console
 */
exports.RECOMMENDED_FIRESTORE_INDEXES = [
    {
        collection: 'products',
        fields: [
            { fieldPath: 'available', direction: 'ASCENDING' },
            { fieldPath: 'category', direction: 'ASCENDING' },
            { fieldPath: 'createdAt', direction: 'DESCENDING' }
        ],
        description: 'Index pour getProductsByCategory avec pagination'
    },
    {
        collection: 'products',
        fields: [
            { fieldPath: 'available', direction: 'ASCENDING' },
            { fieldPath: 'popular', direction: 'ASCENDING' },
            { fieldPath: 'createdAt', direction: 'DESCENDING' }
        ],
        description: 'Index pour getPopularProducts'
    },
    {
        collection: 'orders',
        fields: [
            { fieldPath: 'userId', direction: 'ASCENDING' },
            { fieldPath: 'createdAt', direction: 'DESCENDING' }
        ],
        description: 'Index pour getUserOrders'
    },
    {
        collection: 'orders',
        fields: [
            { fieldPath: 'status', direction: 'ASCENDING' },
            { fieldPath: 'createdAt', direction: 'DESCENDING' }
        ],
        description: 'Index pour getAllOrders avec filtres de statut'
    }
];
/**
 * Exemple de batch read (récupérer plusieurs documents en parallèle)
 */
async function batchGetProducts(productIds) {
    try {
        const refs = productIds.map(id => firebase_1.db.collection('products').doc(id));
        const docs = await firebase_1.db.getAll(...refs);
        return docs
            .filter(doc => doc.exists)
            .map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    catch (error) {
        console.error('Erreur batch read products:', error);
        throw error;
    }
}
/**
 * Batch write (écrire plusieurs documents en une seule requête)
 */
async function batchUpdateOrderStatuses(updates) {
    try {
        const batch = firebase_1.db.batch();
        updates.forEach(({ id, status }) => {
            const ref = firebase_1.db.collection('orders').doc(id);
            batch.update(ref, { status, updatedAt: new Date() });
        });
        await batch.commit();
        console.log(`✅ ${updates.length} commandes mises à jour via batch`);
    }
    catch (error) {
        console.error('Erreur batch write orders:', error);
        throw error;
    }
}
/**
 * Utiliser runTransaction pour garantir la cohérence
 */
async function transactionalOrderCreation(userId, orderData) {
    return firebase_1.db.runTransaction(async (transaction) => {
        // Vérifier le stock ou d'autres conditions
        const inventoryRef = firebase_1.db.collection('inventory').doc('summary');
        const inventoryDoc = await transaction.get(inventoryRef);
        if (!inventoryDoc.exists) {
            throw new Error('Inventory not found');
        }
        // Créer la commande
        const orderRef = firebase_1.db.collection('orders').doc();
        transaction.set(orderRef, {
            userId,
            ...orderData,
            createdAt: new Date()
        });
        // Mettre à jour l'inventaire de manière atomique
        transaction.update(inventoryRef, {
            lastUpdated: new Date()
        });
        return orderRef.id;
    });
}
/**
 * Pagination efficace avec cursor
 */
async function getProductsWithCursor(limit = 20, cursor) {
    try {
        let query = firebase_1.db
            .collection('products')
            .where('available', '==', true)
            .select('name', 'price', 'category', 'image', 'cloudinaryPublicId', 'available', 'popular', 'createdAt')
            .orderBy('createdAt', 'desc')
            .limit(limit + 1); // +1 pour vérifier s'il y a plus
        if (cursor) {
            // Decoder le cursor (il contient le timestamp du dernier doc)
            const lastTimestamp = parseInt(Buffer.from(cursor, 'base64').toString());
            query = query.startAfter(lastTimestamp);
        }
        const snapshot = await query.get();
        const docs = snapshot.docs.slice(0, limit);
        let nextCursor = null;
        if (snapshot.docs.length > limit) {
            // Il y a plus de données
            const lastDoc = docs[docs.length - 1];
            nextCursor = Buffer.from(lastDoc.data().createdAt.toMillis().toString()).toString('base64');
        }
        return {
            data: docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            nextCursor,
            hasMore: snapshot.docs.length > limit
        };
    }
    catch (error) {
        console.error('Erreur pagination cursor:', error);
        throw error;
    }
}
/**
 * Aggregation query (compter les documents rapidement)
 */
async function getProductCount(category) {
    try {
        let query = firebase_1.db.collection('products').where('available', '==', true);
        if (category) {
            query = query.where('category', '==', category);
        }
        const snapshot = await query.count().get();
        return snapshot.data().count;
    }
    catch (error) {
        console.error('Erreur count products:', error);
        throw error;
    }
}
//# sourceMappingURL=firebaseOptimization.js.map