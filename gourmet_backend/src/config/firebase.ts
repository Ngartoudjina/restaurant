//src/config/firebase.ts

import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;