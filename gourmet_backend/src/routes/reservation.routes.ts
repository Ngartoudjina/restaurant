//src/routes/reservations.routes.ts

import { Router } from 'express';
import {
  getAllReservations,
  getReservationById,
  getUserReservations,
  createReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  checkAvailability
} from '../controllers/reservation.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Routes publiques
router.post('/', createReservation);
router.get('/check-availability', checkAvailability);

// Routes admin
router.get('/', verifyToken, isAdmin, getAllReservations);

// Routes utilisateur
router.get('/my-reservations', verifyToken, getUserReservations);
router.get('/:id', verifyToken, getReservationById);
router.put('/:id/cancel', verifyToken, cancelReservation);

// Routes admin uniquement
router.put('/:id/status', verifyToken, isAdmin, updateReservationStatus);
router.delete('/:id', verifyToken, isAdmin, deleteReservation);

export default router;