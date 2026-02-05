"use strict";
//src/routes/product.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Configuration Multer pour upload
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Seules les images sont autorisées'));
        }
    }
});
router.get('/popular', product_controller_1.getPopularProducts);
// Routes publiques
router.get('/', product_controller_1.getProducts);
router.get('/:id', product_controller_1.getProductById);
router.get('/category/:category', product_controller_1.getProductsByCategory);
// Routes admin (protégées)
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, upload.single('image'), product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, upload.single('image'), product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, product_controller_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map