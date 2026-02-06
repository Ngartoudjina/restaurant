//src/config/firebase.ts

import admin from 'firebase-admin';

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountEnv) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT n\'est pas défini');
}

let serviceAccount: admin.ServiceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountEnv) as admin.ServiceAccount;
} catch (err) {
  throw new Error('Impossible de parser FIREBASE_SERVICE_ACCOUNT JSON');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;