// src/routes/message.routes.ts
import { Router } from 'express';
import {
  createMessage,
  getMessages,
  getMessageById,
  markAsRead,
  deleteMessage
} from '../controllers/message.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint: visitor sends message
router.post('/', createMessage);

// Admin endpoints
router.get('/', verifyToken, isAdmin, getMessages);
router.get('/:id', verifyToken, isAdmin, getMessageById);
router.patch('/:id/read', verifyToken, isAdmin, markAsRead);
router.delete('/:id', verifyToken, isAdmin, deleteMessage);

export default router;
