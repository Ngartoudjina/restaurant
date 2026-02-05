"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementOrderStats = void 0;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const incrementOrderStats = async (total, status) => {
    const ref = firebase_1.db.doc('stats/orders');
    await firebase_1.db.runTransaction(async (tx) => {
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
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    });
};
exports.incrementOrderStats = incrementOrderStats;
//# sourceMappingURL=orderStats.helper.js.map