"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularProducts = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const firebase_1 = require("../config/firebase");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const firestore_1 = require("firebase-admin/firestore");
const advancedCache_1 = require("../utils/advancedCache");
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
// Helper pour invalider le cache
const invalidateProductCache = async (productId) => {
    const patterns = [
        'products:*',
        'product:*'
    ];
    // Invalider tous les patterns en parallèle
    await Promise.all(patterns.map(pattern => (0, advancedCache_1.invalidateCachePattern)(pattern)));
    console.log('🗑️  Cache invalidé');
};
// Helper pour extraire publicId Cloudinary de manière sûre
const extractCloudinaryPublicId = (imageUrl) => {
    try {
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1)
            return null;
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        return pathAfterUpload.split('.')[0];
    }
    catch (error) {
        console.error('Erreur extraction publicId:', error);
        return null;
    }
};
// ✅ Créer un produit
// ✅ Créer un produit
const createProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const { name, description, price, category, dietary, available = true, popular = false } = req.body;
        // Validation rapide
        if (!name || !description || price === undefined || !category || !req.file) {
            return res.status(400).json({
                error: 'Champs requis manquants',
                required: ['name', 'description', 'price', 'category', 'image']
            });
        }
        if (isNaN(Number(price))) {
            return res.status(400).json({ error: 'Prix invalide' });
        }
        const originalPath = req.file.path;
        // ✅ FIX: Ajouter .webp au nom du fichier original (sans extension)
        const webpPath = `${originalPath}.webp`;
        let upload;
        try {
            // Convertir l'image en WebP
            await (0, sharp_1.default)(originalPath)
                .webp({ quality: 80 })
                .toFile(webpPath);
            // Upload Cloudinary avec gestion d'erreur
            upload = await cloudinary_1.default.uploader.upload(webpPath, {
                folder: 'products',
                transformation: [
                    { width: 1200, height: 900, crop: 'fill', gravity: 'auto' },
                    { quality: 'auto:good', fetch_format: 'auto' }
                ],
                eager: [
                    { width: 400, crop: 'fill', quality: 'auto' },
                    { width: 800, crop: 'fill', quality: 'auto' }
                ],
                eager_async: true
            });
        }
        catch (uploadError) {
            console.error('❌ Erreur conversion ou upload Cloudinary:', uploadError);
            // ✅ Nettoyage en cas d'erreur
            try {
                await promises_1.default.unlink(originalPath).catch(() => { });
                await promises_1.default.unlink(webpPath).catch(() => { });
            }
            catch { }
            return res.status(500).json({
                error: 'Erreur lors de la conversion ou de l\'upload de l\'image',
                details: uploadError.message
            });
        }
        finally {
            // ✅ Nettoyage des fichiers temporaires (avec gestion d'erreur silencieuse)
            try {
                await promises_1.default.unlink(originalPath).catch(() => { });
                await promises_1.default.unlink(webpPath).catch(() => { });
            }
            catch (cleanupError) {
                // Ignorer les erreurs de nettoyage
            }
        }
        // Parse dietary
        const dietaryArray = typeof dietary === 'string'
            ? dietary.split(',').map((d) => d.trim()).filter(Boolean)
            : Array.isArray(dietary)
                ? dietary
                : [];
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            dietary: dietaryArray,
            image: upload.secure_url,
            cloudinaryPublicId: upload.public_id,
            available: available === true || available === 'true',
            popular: popular === true || popular === 'true',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        const docRef = await firebase_1.db.collection('products').add(productData);
        invalidateProductCache();
        console.log(`⏱️  Produit créé en ${Date.now() - startTime}ms`);
        res.status(201).json({
            success: true,
            id: docRef.id,
            message: 'Produit créé avec succès'
        });
    }
    catch (error) {
        console.error('❌ Erreur création produit:', error);
        res.status(500).json({
            error: 'Erreur lors de la création du produit',
            details: error.message
        });
    }
};
exports.createProduct = createProduct;
// ✅ Récupérer tous les produits (avec cache)
const getProducts = async (req, res) => {
    const startTime = Date.now();
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;
        const cacheKey = `products:all:${page}:${limit}`;
        const cached = await (0, advancedCache_1.getFromCache)(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT - ${Date.now() - startTime}ms`);
            return res.json({
                success: true,
                cached: true,
                count: cached.length,
                page,
                limit,
                data: cached
            });
        }
        // Utiliser select() pour ne récupérer que les champs nécessaires
        const snapshot = await firebase_1.db
            .collection('products')
            .where('available', '==', true)
            .select('name', 'price', 'category', 'image', 'cloudinaryPublicId', 'available', 'popular')
            .orderBy('createdAt', 'desc')
            .limit(limit + offset)
            .get();
        const allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            category: doc.data().category,
            image: doc.data().image,
            cloudinaryPublicId: doc.data().cloudinaryPublicId,
            available: doc.data().available,
            popular: doc.data().popular
        }));
        const products = allProducts.slice(offset, offset + limit);
        await (0, advancedCache_1.setInCache)(cacheKey, products, { ttl: 600 }); // 10 minutes
        console.log(`⏱️  Produits récupérés en ${Date.now() - startTime}ms`);
        res.json({
            success: true,
            cached: false,
            count: products.length,
            page,
            limit,
            data: products
        });
    }
    catch (error) {
        console.error('❌ Erreur récupération produits:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des produits',
            details: error.message
        });
    }
};
exports.getProducts = getProducts;
// ✅ Récupérer un produit par ID (avec cache)
const getProductById = async (req, res) => {
    const startTime = Date.now();
    try {
        const id = req.params.id;
        const cacheKey = `product:${id}`;
        // Vérifier le cache
        const cached = await (0, advancedCache_1.getFromCache)(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT product:${id} - ${Date.now() - startTime}ms`);
            return res.status(200).json({
                success: true,
                cached: true,
                data: cached
            });
        }
        // Requête Firestore avec select() pour optimisation
        const doc = await firebase_1.db.collection('products').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Produit introuvable' });
        }
        const product = {
            id: doc.id,
            ...doc.data()
        };
        // Mise en cache (5 minutes)
        await (0, advancedCache_1.setInCache)(cacheKey, product, { ttl: 300 });
        console.log(`⏱️  Produit récupéré en ${Date.now() - startTime}ms`);
        res.status(200).json({
            success: true,
            cached: false,
            data: product
        });
    }
    catch (error) {
        console.error('❌ Erreur récupération produit:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération du produit',
            details: error.message
        });
    }
};
exports.getProductById = getProductById;
// ✅ Mettre à jour un produit
const updateProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const id = req.params.id;
        const { name, description, price, category, dietary, available, popular } = req.body;
        // Récupérer le produit existant
        const ref = firebase_1.db.collection('products').doc(id);
        const snapshot = await ref.get();
        if (!snapshot.exists) {
            return res.status(404).json({ error: 'Produit introuvable' });
        }
        const existingData = snapshot.data();
        let imageUrl = existingData?.image;
        let cloudinaryPublicId = existingData?.cloudinaryPublicId;
        // Dans la section upload de updateProduct
        if (req.file) {
            const originalPath = req.file.path;
            const webpPath = `${originalPath}.webp`; // ✅ FIX
            try {
                // Convertir l'image en WebP
                await (0, sharp_1.default)(originalPath)
                    .webp({ quality: 80 })
                    .toFile(webpPath);
                // Upload nouvelle image
                const upload = await cloudinary_1.default.uploader.upload(webpPath, {
                    folder: 'products',
                    transformation: [
                        { width: 1200, height: 900, crop: 'fill', gravity: 'auto' },
                        { quality: 'auto:good', fetch_format: 'auto' }
                    ],
                    eager: [
                        { width: 400, crop: 'fill', quality: 'auto' },
                        { width: 800, crop: 'fill', quality: 'auto' }
                    ]
                });
                imageUrl = upload.secure_url;
                cloudinaryPublicId = upload.public_id;
                // Supprimer ancienne image
                if (existingData?.cloudinaryPublicId) {
                    try {
                        await cloudinary_1.default.uploader.destroy(existingData.cloudinaryPublicId);
                    }
                    catch (err) {
                        console.error('⚠️  Erreur suppression ancienne image:', err);
                    }
                }
            }
            catch (uploadError) {
                console.error('❌ Erreur conversion ou upload image:', uploadError);
                // ✅ Nettoyage en cas d'erreur
                try {
                    await promises_1.default.unlink(originalPath).catch(() => { });
                    await promises_1.default.unlink(webpPath).catch(() => { });
                }
                catch { }
                return res.status(500).json({
                    error: 'Erreur lors de la conversion ou de l\'upload de l\'image',
                    details: uploadError.message
                });
            }
            finally {
                // ✅ Nettoyage des fichiers temporaires
                try {
                    await promises_1.default.unlink(originalPath).catch(() => { });
                    await promises_1.default.unlink(webpPath).catch(() => { });
                }
                catch (cleanupError) {
                    // Ignorer les erreurs de nettoyage
                }
            }
        }
        // Parse dietary
        let dietaryArray = existingData?.dietary || [];
        if (dietary !== undefined) {
            dietaryArray = typeof dietary === 'string'
                ? dietary.split(',').map((d) => d.trim()).filter(Boolean)
                : Array.isArray(dietary)
                    ? dietary
                    : [];
        }
        // Données à mettre à jour
        const updateData = {
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (price !== undefined)
            updateData.price = Number(price);
        if (category)
            updateData.category = category;
        if (dietary !== undefined)
            updateData.dietary = dietaryArray;
        if (available !== undefined)
            updateData.available = available === 'true' || available === true;
        if (popular !== undefined)
            updateData.popular = popular === 'true' || popular === true;
        if (imageUrl) {
            updateData.image = imageUrl;
            updateData.cloudinaryPublicId = cloudinaryPublicId;
        }
        await ref.update(updateData);
        await invalidateProductCache(id);
        console.log(`⏱️  Produit mis à jour en ${Date.now() - startTime}ms`);
        res.status(200).json({
            success: true,
            message: 'Produit mis à jour avec succès'
        });
    }
    catch (error) {
        console.error('❌ Erreur mise à jour produit:', error);
        res.status(500).json({
            error: 'Erreur lors de la mise à jour du produit',
            details: error.message
        });
    }
};
exports.updateProduct = updateProduct;
// ✅ Supprimer un produit
const deleteProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const id = req.params.id;
        const doc = await firebase_1.db.collection('products').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Produit introuvable' });
        }
        const productData = doc.data();
        // Supprimer l'image Cloudinary si elle existe
        if (productData?.cloudinaryPublicId) {
            try {
                await cloudinary_1.default.uploader.destroy(productData.cloudinaryPublicId);
                console.log('✅ Image Cloudinary supprimée');
            }
            catch (err) {
                console.error('⚠️  Erreur suppression image Cloudinary:', err);
            }
        }
        // Supprimer le document
        await firebase_1.db.collection('products').doc(id).delete();
        // Invalider le cache
        await invalidateProductCache(id);
        console.log(`⏱️  Produit supprimé en ${Date.now() - startTime}ms`);
        res.status(200).json({
            success: true,
            message: 'Produit supprimé avec succès'
        });
    }
    catch (error) {
        console.error('❌ Erreur suppression produit:', error);
        res.status(500).json({
            error: 'Erreur lors de la suppression du produit',
            details: error.message
        });
    }
};
exports.deleteProduct = deleteProduct;
// ✅ Récupérer les produits par catégorie (avec cache)
const getProductsByCategory = async (req, res) => {
    const startTime = Date.now();
    try {
        const { category } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;
        const cacheKey = `products:${category}:${page}:${limit}`;
        // Vérifier le cache
        const cached = await (0, advancedCache_1.getFromCache)(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT ${category} - ${Date.now() - startTime}ms`);
            return res.status(200).json({
                success: true,
                cached: true,
                count: cached.length,
                page,
                limit,
                data: cached
            });
        }
        // Requête Firestore avec select()
        const snapshot = await firebase_1.db
            .collection('products')
            .where('category', '==', category)
            .where('available', '==', true)
            .select('name', 'price', 'category', 'image', 'cloudinaryPublicId', 'available', 'popular')
            .orderBy('createdAt', 'desc')
            .limit(limit + offset)
            .get();
        const allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            category: doc.data().category,
            image: doc.data().image,
            cloudinaryPublicId: doc.data().cloudinaryPublicId,
            available: doc.data().available,
            popular: doc.data().popular
        }));
        const products = allProducts.slice(offset, offset + limit);
        // Mise en cache (10 minutes)
        await (0, advancedCache_1.setInCache)(cacheKey, products, { ttl: 600 });
        console.log(`⏱️  Catégorie ${category} - ${Date.now() - startTime}ms - ${products.length} produits`);
        res.status(200).json({
            success: true,
            cached: false,
            count: products.length,
            page,
            limit,
            data: products
        });
    }
    catch (error) {
        console.error('❌ Erreur récupération par catégorie:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des produits',
            details: error.message
        });
    }
};
exports.getProductsByCategory = getProductsByCategory;
// ✅ Récupérer les produits populaires (avec cache)
const getPopularProducts = async (_, res) => {
    const startTime = Date.now();
    const cacheKey = 'products:popular';
    try {
        // Vérifier le cache
        const cached = await (0, advancedCache_1.getFromCache)(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT popular - ${Date.now() - startTime}ms`);
            return res.status(200).json({
                success: true,
                cached: true,
                count: cached.length,
                data: cached
            });
        }
        // Requête Firestore avec select()
        const snapshot = await firebase_1.db
            .collection('products')
            .where('popular', '==', true)
            .where('available', '==', true)
            .select('name', 'price', 'category', 'image', 'cloudinaryPublicId', 'available', 'popular')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            category: doc.data().category,
            image: doc.data().image,
            cloudinaryPublicId: doc.data().cloudinaryPublicId,
            available: doc.data().available,
            popular: doc.data().popular
        }));
        // Mise en cache (15 minutes)
        await (0, advancedCache_1.setInCache)(cacheKey, products, { ttl: 900 });
        console.log(`⏱️  Populaires - ${Date.now() - startTime}ms - ${products.length} produits`);
        res.status(200).json({
            success: true,
            cached: false,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        console.error('❌ Erreur produits populaires:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des produits populaires',
            details: error.message
        });
    }
};
exports.getPopularProducts = getPopularProducts;
//# sourceMappingURL=product.controller.js.map