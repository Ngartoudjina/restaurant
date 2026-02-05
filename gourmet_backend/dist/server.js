"use strict";
//src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
// Fonction de démarrage
const startServer = async () => {
    try {
        // Démarrer le serveur Express
        const server = app_1.default.listen(PORT, () => {
            console.log('✅ Serveur démarré avec succès');
            console.log(`🔥 Backend Le Gourmet lancé sur http://localhost:${PORT}`);
            console.log(`📦 Cache: LRU Cache (en mémoire)`);
            console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
        });
        // Gestion des erreurs du serveur
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Le port ${PORT} est déjà utilisé`);
                process.exit(1);
            }
            else {
                console.error('❌ Erreur serveur:', error);
                process.exit(1);
            }
        });
        return server;
    }
    catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};
// Gestion de l'arrêt propre (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur en cours...');
    console.log('👋 Serveur arrêté avec succès');
    process.exit(0);
});
// Gestion de l'arrêt propre (kill)
process.on('SIGTERM', async () => {
    console.log('\n🛑 Signal SIGTERM reçu, arrêt du serveur...');
    console.log('👋 Serveur arrêté avec succès');
    process.exit(0);
});
// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
    process.exit(1);
});
// Gestion des promesses rejetées
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    process.exit(1);
});
// Démarrer le serveur
startServer();
//# sourceMappingURL=server.js.map