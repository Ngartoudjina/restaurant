//src/routes/orders.routes.ts

import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} from '../controllers/order.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Routes admin
router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/stats', verifyToken, isAdmin, getOrderStats);

// Routes utilisateur
router.get('/my-orders', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.post('/', verifyToken, createOrder);

// Routes admin uniquement
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);
router.delete('/:id', verifyToken, isAdmin, deleteOrder);

export default router;