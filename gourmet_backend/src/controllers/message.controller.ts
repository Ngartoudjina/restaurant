// src/controllers/message.controller.ts
import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Créer un message (public)
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Champs manquants',
        required: ['name', 'email', 'message']
      });
    }

    const nameStr = String(name).trim();
    const emailStr = String(email).trim();
    const messageStr = String(message).trim();

    if (nameStr.length === 0 || emailStr.length === 0 || messageStr.length === 0) {
      return res.status(400).json({ error: 'Champs vides non autorisés' });
    }

    if (nameStr.length > 100) return res.status(400).json({ error: 'Nom trop long (max 100 chars)' });
    if (messageStr.length > 5000) return res.status(400).json({ error: 'Message trop long (max 5000 chars)' });

    // simple email validation
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(emailStr) || emailStr.length > 254) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const docRef = await db.collection('messages').add({
      name: nameStr,
      email: emailStr,
      message: messageStr,
      read: false,
      replied: false,
      ip: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      createdAt: FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Message envoyé avec succès'
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur création message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message', details });
  }
};

// Récupérer messages (admin) - pagination + filtre
export const getMessages = async (req: Request, res: Response) => {
  try {
    // Cursor-based pagination for better scalability
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const unreadOnly = req.query.unread === 'true';
    const cursor = req.query.cursor as string | undefined; // can be doc id or ISO timestamp

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db
      .collection('messages')
      .select('name', 'email', 'message', 'read', 'replied', 'createdAt');

    if (unreadOnly) query = query.where('read', '==', false);

    query = query.orderBy('createdAt', 'desc').limit(limit);

    if (cursor) {
      // try as document id first
      const cursorDoc = await db.collection('messages').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      } else {
        // try as timestamp
        const ts = new Date(cursor);
        if (!isNaN(ts.getTime())) {
          query = query.startAfter(ts);
        }
      }
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const nextCursor = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : null;

    res.status(200).json({
      success: true,
      count: messages.length,
      limit,
      cursor: cursor || null,
      nextCursor,
      data: messages
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages', details });
  }
};

// Récupérer message par id (admin)
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const doc = await db.collection('messages').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Message introuvable' });

    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur getMessageById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du message', details });
  }
};

// Marquer comme lu (admin)
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ref = db.collection('messages').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Message introuvable' });

    await ref.update({ read: true, readAt: FieldValue.serverTimestamp() });
    res.status(200).json({ success: true, message: 'Message marqué comme lu' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du message', details });
  }
};

// Supprimer un message (admin)
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ref = db.collection('messages').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Message introuvable' });

    await ref.delete();
    res.status(200).json({ success: true, message: 'Message supprimé' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Erreur deleteMessage:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du message', details });
  }
};
