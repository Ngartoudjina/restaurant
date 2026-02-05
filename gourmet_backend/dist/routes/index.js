"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = exports.reservationRoutes = exports.orderRoutes = exports.productRoutes = void 0;
// src/routes/index.ts
const product_routes_1 = __importDefault(require("./product.routes"));
exports.productRoutes = product_routes_1.default;
const order_routes_1 = __importDefault(require("./order.routes"));
exports.orderRoutes = order_routes_1.default;
const reservation_routes_1 = __importDefault(require("./reservation.routes"));
exports.reservationRoutes = reservation_routes_1.default;
const message_routes_1 = __importDefault(require("./message.routes"));
exports.messageRoutes = message_routes_1.default;
//# sourceMappingURL=index.js.map