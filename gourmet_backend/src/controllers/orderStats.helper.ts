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
