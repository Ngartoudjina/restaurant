//src/controllers/order.controller.ts

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { incrementOrderStats, moveOrderStatus } from './orderStats.helper';
import { DELIVERY_FEE, getDiscountPercent } from '../config/pricing';

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
    const details = process.env.NODE_ENV === 'production'
      ? undefined
      : (error instanceof Error ? error.message : String(error));
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
    const details = process.env.NODE_ENV === 'production'
      ? undefined
      : (error instanceof Error ? error.message : String(error));
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
    const details = process.env.NODE_ENV === 'production'
      ? undefined
      : (error instanceof Error ? error.message : String(error));
    console.error('Erreur récupération commandes utilisateur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des commandes',
      details
    });
  }
};

// ✅ Créer une commande
// ⚠️ Le total et les prix sont TOUJOURS recalculés côté serveur à partir
//    des prix Firestore : on ne fait jamais confiance au client.
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      items,
      type,
      deliveryAddress,
      scheduledFor,
      promoCode
    } = req.body;

    // Validation de base
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Articles manquants' });
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

    // Normaliser et valider les quantités demandées
    const requested = new Map<string, number>();
    for (const item of items) {
      const productId = item?.productId;
      const quantity = Number(item?.quantity);
      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'productId manquant ou invalide' });
      }
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 50) {
        return res.status(400).json({ error: `Quantité invalide pour ${productId}` });
      }
      requested.set(productId, (requested.get(productId) || 0) + quantity);
    }

    // Récupérer les produits réels depuis Firestore (prix de référence)
    const productRefs = [...requested.keys()].map((id) =>
      db.collection('products').doc(id)
    );
    const productDocs = await db.getAll(...productRefs);

    let subtotal = 0;
    const serverItems = productDocs.map((doc) => {
      if (!doc.exists) {
        throw Object.assign(new Error(`Produit introuvable: ${doc.id}`), { status: 400 });
      }
      const data = doc.data() as { name?: string; price?: number; image?: string; available?: boolean };
      if (data.available === false) {
        throw Object.assign(new Error(`Produit indisponible: ${doc.id}`), { status: 400 });
      }
      const price = Number(data.price) || 0;
      const quantity = requested.get(doc.id)!;
      subtotal += price * quantity;
      return {
        productId: doc.id,
        name: data.name ?? '',
        price,
        quantity,
        image: data.image ?? '',
      };
    });

    if (subtotal <= 0) {
      return res.status(400).json({ error: 'Montant de commande invalide' });
    }

    // Calcul autoritaire du total
    const discountPercent = getDiscountPercent(promoCode);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const deliveryFee = type === 'delivery' ? DELIVERY_FEE : 0;
    const total = subtotal - discountAmount + deliveryFee;

    // Créer la commande avec les valeurs vérifiées côté serveur
    const orderData: Record<string, unknown> = {
      userId,
      items: serverItems,
      subtotal,
      discountPercent,
      discountAmount,
      deliveryFee,
      total,
      type,
      status: 'pending',
      ...(discountPercent > 0 && { promoCode: String(promoCode).trim().toUpperCase() }),
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
      total,
      message: 'Commande créée avec succès'
    });
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;
    if (status === 400) {
      return res.status(400).json({ error: (error as Error).message });
    }
    console.error('Erreur création commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
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

    const oldStatus = doc.data()?.status as string | undefined;

    await ref.update({
      status,
      updatedAt: FieldValue.serverTimestamp()
    });

    // ✅ Mettre à jour les compteurs par statut si le statut change
    if (oldStatus && oldStatus !== status) {
      await moveOrderStatus(oldStatus, status);
    }

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error: unknown) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
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
    const details = process.env.NODE_ENV === 'production'
      ? undefined
      : (error instanceof Error ? error.message : String(error));
    console.error('Erreur suppression commande:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la commande',
      details
    });
  }
};

export const getOrderStats = async (_: Request, res: Response) => {
  try {
    const doc = await db.doc('stats/orders').get();
    res.json({ success: true, data: doc.data() || {} });
  } catch (error: unknown) {
    console.error('Erreur récupération stats commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

