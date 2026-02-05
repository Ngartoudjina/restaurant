"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/message.routes.ts
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public endpoint: visitor sends message
router.post('/', message_controller_1.createMessage);
// Admin endpoints
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, message_controller_1.getMessages);
router.get('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, message_controller_1.getMessageById);
router.patch('/:id/read', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, message_controller_1.markAsRead);
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, message_controller_1.deleteMessage);
exports.default = router;
//# sourceMappingURL=message.routes.js.map