"use strict";
//src/controllers/order.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.deleteOrder = exports.updateOrderStatus = exports.createOrder = exports.getUserOrders = exports.getOrderById = exports.getAllOrders = void 0;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const orderStats_helper_1 = require("./orderStats.helper");
// ✅ Récupérer toutes les commandes (admin)
const getAllOrders = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;
        const status = req.query.status;
        let query = firebase_1.db.collection('orders').select('userId', 'items', 'total', 'type', 'status', 'createdAt');
        if (status) {
            query = query.where('status', '==', status);
        }
        const snapshot = await query
            .orderBy('createdAt', 'desc')
            .limit(limit + offset)
            .get();
        const allOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        const orders = allOrders.slice(offset, offset + limit);
        res.status(200).json({
            success: true,
            count: orders.length,
            page,
            limit,
            data: orders
        });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error('Erreur récupération commandes:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des commandes',
            details
        });
    }
};
exports.getAllOrders = getAllOrders;
// ✅ Récupérer une commande par ID
const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await firebase_1.db.collection('orders').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }
        // Vérifier que l'utilisateur est propriétaire ou admin
        const orderData = doc.data();
        if (req.user?.uid !== orderData?.userId &&
            req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        res.status(200).json({
            success: true,
            data: {
                id: doc.id,
                ...orderData
            }
        });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error('Erreur récupération commande:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération de la commande',
            details
        });
    }
};
exports.getOrderById = getOrderById;
// ✅ Récupérer les commandes d'un utilisateur
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;
        const snapshot = await firebase_1.db
            .collection('orders')
            .where('userId', '==', userId)
            .select('userId', 'items', 'total', 'type', 'status', 'createdAt')
            .orderBy('createdAt', 'desc')
            .limit(limit + offset)
            .get();
        const allOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const orders = allOrders.slice(offset, offset + limit);
        res.status(200).json({
            success: true,
            count: orders.length,
            page,
            limit,
            data: orders
        });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error('Erreur récupération commandes utilisateur:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des commandes',
            details
        });
    }
};
exports.getUserOrders = getUserOrders;
// ✅ Créer une commande
const createOrder = async (req, res) => {
    try {
        const { items, total, type, deliveryAddress, scheduledFor } = req.body;
        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Articles manquants' });
        }
        if (!total || total <= 0) {
            return res.status(400).json({ error: 'Total invalide' });
        }
        if (!type || !['delivery', 'takeaway', 'dine-in'].includes(type)) {
            return res.status(400).json({ error: 'Type de commande invalide' });
        }
        if (type === 'delivery' && !deliveryAddress) {
            return res.status(400).json({ error: 'Adresse de livraison requise' });
        }
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Authentification requise' });
        }
        // Créer la commande
        const orderData = {
            userId,
            items,
            total: Number(total),
            type,
            status: 'pending',
            ...(deliveryAddress && { deliveryAddress }),
            ...(scheduledFor && { scheduledFor: Number(scheduledFor) }),
            createdAt: firestore_1.FieldValue.serverTimestamp()
        };
        const docRef = await firebase_1.db.collection('orders').add(orderData);
        await (0, orderStats_helper_1.incrementOrderStats)(total, 'pending');
        // TODO: Envoyer email de confirmation
        // TODO: Notification admin
        res.status(201).json({
            success: true,
            id: docRef.id,
            message: 'Commande créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur création commande:', error);
        res.status(500).json({
            error: 'Erreur lors de la création de la commande',
            details: error.message
        });
    }
};
exports.createOrder = createOrder;
// ✅ Mettre à jour le statut d'une commande (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }
        const ref = firebase_1.db.collection('orders').doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }
        const oldStatus = doc.data()?.status;
        await ref.update({
            status,
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        });
        // ✅ Mettre à jour les stats si le statut change
        if (oldStatus !== status) {
            const total = doc.data()?.total || 0;
            // Décrémenter l'ancien statut, incrémenter le nouveau
            // (nécessite une fonction helper adaptée)
        }
        res.status(200).json({
            success: true,
            message: 'Statut mis à jour avec succès'
        });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({
            error: 'Erreur lors de la mise à jour du statut',
            details
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// ✅ Supprimer une commande (admin)
const deleteOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await firebase_1.db.collection('orders').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }
        await firebase_1.db.collection('orders').doc(id).delete();
        res.status(200).json({
            success: true,
            message: 'Commande supprimée avec succès'
        });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error('Erreur suppression commande:', error);
        res.status(500).json({
            error: 'Erreur lors de la suppression de la commande',
            details
        });
    }
};
exports.deleteOrder = deleteOrder;
const getOrderStats = async (_, res) => {
    const doc = await firebase_1.db.doc('stats/orders').get();
    res.json({ success: true, data: doc.data() });
};
exports.getOrderStats = getOrderStats;
//# sourceMappingURL=order.controller.js.map