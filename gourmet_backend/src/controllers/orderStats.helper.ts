import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export const incrementOrderStats = async (
  total: number,
  status: string
): Promise<void> => {
  const ref = db.doc('stats/orders');

  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const data = snap.data() || {
      totalOrders: 0,
      totalRevenue: 0,
      statusCounts: {},
    };

    data.totalOrders += 1;
    data.totalRevenue += total;
    data.statusCounts[status] = (data.statusCounts[status] || 0) + 1;

    tx.set(ref, {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
};

/**
 * Reflète un changement de statut dans les compteurs : décrémente l'ancien
 * statut et incrémente le nouveau (sans toucher au total des commandes).
 */
export const moveOrderStatus = async (
  oldStatus: string,
  newStatus: string
): Promise<void> => {
  if (oldStatus === newStatus) return;

  const ref = db.doc('stats/orders');

  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const data = snap.data() || { statusCounts: {} as Record<string, number> };
    const statusCounts: Record<string, number> = data.statusCounts || {};

    statusCounts[oldStatus] = Math.max(0, (statusCounts[oldStatus] || 0) - 1);
    statusCounts[newStatus] = (statusCounts[newStatus] || 0) + 1;

    tx.set(
      ref,
      { statusCounts, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  });
};
