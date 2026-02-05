// backend/src/config/redis.ts
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Trop de tentatives de reconnexion');
        return new Error('Trop de tentatives');
      }
      // Attendre 1 seconde entre chaque tentative
      return 1000;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connecté');
});

redisClient.on('ready', () => {
  console.log('✅ Redis prêt à recevoir des commandes');
});

redisClient.on('reconnecting', () => {
  console.log('⚠️  Redis reconnexion en cours...');
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('❌ Erreur connexion Redis:', error);
    throw error;
  }
};

export default redisClient;