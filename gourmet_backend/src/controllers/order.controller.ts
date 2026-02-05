//src/controllers/order.controller.ts

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { incrementOrderStats } from './orderStats.helper';

// Interface Order
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  type: 'delivery' | 'takeaway' | 'dine-in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress?: {
    street: string;
    city: string;
    zipCode: string;
  };
  scheduledFor?: number;
  createdAt: number | FieldValue;
  updatedAt?: number | FieldValue;
}


// ✅ Récupérer toutes les commandes (admin)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    let query: any = db.collection('orders').select(
      'userId', 'items', 'total', 'type', 'status', 'createdAt'
    );

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit + offset)
      .get();

    const allOrders = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
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
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des commandes',
      details
    });
  }
};

// ✅ Récupérer une commande par ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const doc = await db.collection('orders').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    const orderData = doc.data();
    if (
      req.user?.uid !== orderData?.userId &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...orderData
      }
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur récupération commande:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la commande',
      details
    });
  }
};

// ✅ Récupérer les commandes d'un utilisateur
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const snapshot = await db
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
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur récupération commandes utilisateur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des commandes',
      details
    });
  }
};

// ✅ Créer une commande
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      items,
      total,
      type,
      deliveryAddress,
      scheduledFor
    } = req.body;

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
    const orderData: Omit<Order, 'id'> = {
      userId,
      items,
      total: Number(total),
      type,
      status: 'pending',
      ...(deliveryAddress && { deliveryAddress }),
      ...(scheduledFor && { scheduledFor: Number(scheduledFor) }),
      createdAt: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('orders').add(orderData);
    await incrementOrderStats(total, 'pending');

    // TODO: Envoyer email de confirmation
    // TODO: Notification admin

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Commande créée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la commande',
      details: error.message
    });
  }
};

// ✅ Mettre à jour le statut d'une commande (admin)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const ref = db.collection('orders').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    const oldStatus = doc.data()?.status;

    await ref.update({
      status,
      updatedAt: FieldValue.serverTimestamp()
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
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut',
      details
    });
  }
};

// ✅ Supprimer une commande (admin)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const doc = await db.collection('orders').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    await db.collection('orders').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Commande supprimée avec succès'
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur suppression commande:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la commande',
      details
    });
  }
};

export const getOrderStats = async (_: Request, res: Response) => {
  const doc = await db.doc('stats/orders').get();
  res.json({ success: true, data: doc.data() });
};

