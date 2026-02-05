//src/controllers/reservation.controller.ts

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Interface Reservation
interface Reservation {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number | FieldValue;
  updatedAt?: number | FieldValue;
}

// ✅ Récupérer toutes les réservations (admin)
export const getAllReservations = async (_: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection('reservations')
      .orderBy('createdAt', 'desc')
      .get();

    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error: any) {
    console.error('Erreur récupération réservations:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réservations',
      details: error.message
    });
  }
};

// ✅ Récupérer une réservation par ID
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const doc = await db.collection('reservations').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    const reservationData = doc.data();

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      req.user?.uid !== reservationData?.userId &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...reservationData
      }
    });
  } catch (error: any) {
    console.error('Erreur récupération réservation:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la réservation',
      details: error.message
    });
  }
};

// ✅ Récupérer les réservations d'un utilisateur
export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const snapshot = await db
      .collection('reservations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error: any) {
    console.error('Erreur récupération réservations utilisateur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réservations',
      details: error.message
    });
  }
};

// ✅ Créer une réservation
export const createReservation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      date,
      time,
      guests,
      specialRequests
    } = req.body;

    // Validation
    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({
        error: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    if (guests < 1 || guests > 20) {
      return res.status(400).json({
        error: 'Le nombre de personnes doit être entre 1 et 20'
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Validation date (ne peut pas être dans le passé)
    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      return res.status(400).json({
        error: 'La date ne peut pas être dans le passé'
      });
    }

    // Vérifier disponibilité (logique simple)
    const existingReservations = await db
      .collection('reservations')
      .where('date', '==', date)
      .where('time', '==', time)
      .where('status', '!=', 'cancelled')
      .get();

    const totalGuestsAtTime = existingReservations.docs.reduce(
      (sum, doc) => sum + (doc.data().guests || 0),
      0
    );

    // Capacité maximale par créneau (exemple: 50 personnes)
    const MAX_CAPACITY = 50;
    if (totalGuestsAtTime + guests > MAX_CAPACITY) {
      return res.status(400).json({
        error: 'Plus de disponibilité pour ce créneau horaire'
      });
    }

    // Créer la réservation
    const reservationData: Omit<Reservation, 'id'> = {
      ...(req.user?.uid && { userId: req.user.uid }),
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      ...(specialRequests && { specialRequests }),
      status: 'pending',
      createdAt: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('reservations').add(reservationData);

    // TODO: Envoyer email de confirmation
    // TODO: Notification admin

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Réservation créée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la réservation',
      details: error.message
    });
  }
};

// ✅ Mettre à jour le statut d'une réservation (admin)
export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const ref = db.collection('reservations').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    await ref.update({
      status,
      updatedAt: FieldValue.serverTimestamp()
    });

    // TODO: Envoyer notification au client

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error: any) {
    console.error('Erreur mise à jour statut réservation:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut',
      details: error.message
    });
  }
};

// ✅ Annuler une réservation (client ou admin)
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const ref = db.collection('reservations').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    const reservationData = doc.data();

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      req.user?.uid !== reservationData?.userId &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await ref.update({
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur annulation réservation:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'annulation de la réservation',
      details: error.message
    });
  }
};

// ✅ Supprimer une réservation (admin)
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const doc = await db.collection('reservations').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    await db.collection('reservations').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur suppression réservation:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la réservation',
      details: error.message
    });
  }
};

// ✅ Vérifier disponibilité pour une date/heure
export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { date, time, guests } = req.query;

    if (!date || !time || !guests) {
      return res.status(400).json({
        error: 'Date, heure et nombre de personnes requis'
      });
    }

    const existingReservations = await db
      .collection('reservations')
      .where('date', '==', date)
      .where('time', '==', time)
      .where('status', '!=', 'cancelled')
      .get();

    const totalGuestsAtTime = existingReservations.docs.reduce(
      (sum, doc) => sum + (doc.data().guests || 0),
      0
    );

    const MAX_CAPACITY = 50;
    const remainingCapacity = MAX_CAPACITY - totalGuestsAtTime;
    const isAvailable = remainingCapacity >= Number(guests);

    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        remainingCapacity,
        requestedGuests: Number(guests)
      }
    });
  } catch (error: any) {
    console.error('Erreur vérification disponibilité:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification de disponibilité',
      details: error.message
    });
  }
};