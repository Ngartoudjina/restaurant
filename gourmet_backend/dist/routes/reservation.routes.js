"use strict";
//src/routes/reservations.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservation_controller_1 = require("../controllers/reservation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Routes publiques
router.post('/', reservation_controller_1.createReservation);
router.get('/check-availability', reservation_controller_1.checkAvailability);
// Routes admin
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, reservation_controller_1.getAllReservations);
// Routes utilisateur
router.get('/my-reservations', auth_middleware_1.verifyToken, reservation_controller_1.getUserReservations);
router.get('/:id', auth_middleware_1.verifyToken, reservation_controller_1.getReservationById);
router.put('/:id/cancel', auth_middleware_1.verifyToken, reservation_controller_1.cancelReservation);
// Routes admin uniquement
router.put('/:id/status', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, reservation_controller_1.updateReservationStatus);
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, reservation_controller_1.deleteReservation);
exports.default = router;
//# sourceMappingURL=reservation.routes.js.map