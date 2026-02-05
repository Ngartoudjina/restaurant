//src/server.ts

import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

// Fonction de démarrage
const startServer = async () => {
  try {
    // Démarrer le serveur Express
    const server = app.listen(PORT, () => {
      console.log('✅ Serveur démarré avec succès');
      console.log(`🔥 Backend Le Gourmet lancé sur http://localhost:${PORT}`);
      console.log(`📦 Cache: LRU Cache (en mémoire)`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });

    // Gestion des erreurs du serveur
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Le port ${PORT} est déjà utilisé`);
        process.exit(1);
      } else {
        console.error('❌ Erreur serveur:', error);
        process.exit(1);
      }
    });

    return server;
  } catch (error) {
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