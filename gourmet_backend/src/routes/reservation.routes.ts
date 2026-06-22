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
import { rateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Routes publiques (anti-spam)
router.post('/', rateLimiter(8, 60000), createReservation);
router.get('/check-availability', rateLimiter(30, 60000), checkAvailability);

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