"use strict";
//src/routes/orders.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Routes admin
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, order_controller_1.getAllOrders);
router.get('/stats', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, order_controller_1.getOrderStats);
// Routes utilisateur
router.get('/my-orders', auth_middleware_1.verifyToken, order_controller_1.getUserOrders);
router.get('/:id', auth_middleware_1.verifyToken, order_controller_1.getOrderById);
router.post('/', auth_middleware_1.verifyToken, order_controller_1.createOrder);
// Routes admin uniquement
router.put('/:id/status', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, order_controller_1.updateOrderStatus);
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, order_controller_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map