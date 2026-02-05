// src/config/performance.config.ts
/**
 * Configuration centralisée des optimisations de performance
 */

export const performanceConfig = {
  // Cache Configuration
  cache: {
    l1: {
      enabled: true,
      maxSize: 500, // nombre d'items
      ttl: 5 * 60 * 1000 // 5 minutes
    },
    l2Redis: {
      enabled: !!process.env.REDIS_URL,
      ttl: 10 * 60 // 10 minutes en secondes
    }
  },

  // HTTP Caching Headers
  httpCache: {
    enabled: true,
    patterns: {
      products: {
        maxAge: 600, // 10 min
        staleWhileRevalidate: 86400, // 1 jour
        staleIfError: 604800 // 1 semaine
      },
      orders: {
        maxAge: 30, // 30 sec (très dynamique)
        staleWhileRevalidate: 300 // 5 min
      },
      reservations: {
        maxAge: 60, // 1 min
        staleWhileRevalidate: 300
      },
      messages: {
        maxAge: 120, // 2 min
        staleWhileRevalidate: 600
      }
    }
  },

  // Request Coalescing
  requestCoalescing: {
    enabled: true,
    timeout: 30000, // 30 secondes
    maxPending: 1000 // max pending requests
  },

  // Compression
  compression: {
    enabled: true,
    level: 6, // 1-9, higher = more CPU
    threshold: 1000 // min bytes to compress
  },

  // Firestore Optimization
  firestore: {
    batchSize: 100, // max 100
    useSelect: true, // utiliser select() pour réduire données
    enableIndexing: true,
    defaultPageSize: 20,
    maxPageSize: 50
  },

  // Circuit Breaker
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000 // 1 minute
  },

  // Performance Monitoring
  monitoring: {
    enabled: true,
    slowThreshold: 200, // ms
    trackMetrics: true,
    metricsRetention: 10000 // nombre de requêtes à tracker
  },

  // Rate Limiting
  rateLimiting: {
    enabled: process.env.NODE_ENV === 'production',
    requestsPerMinute: 100,
    windowMs: 60000
  }
};

// Fonction helper pour obtenir la config
export function getPerformanceConfig(section?: keyof typeof performanceConfig) {
  if (section) {
    return performanceConfig[section];
  }
  return performanceConfig;
}

// Helper pour check si une feature est active
export function isFeatureEnabled(feature: string): boolean {
  const parts = feature.split('.');
  let value: any = performanceConfig;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return false;
    }
  }
  
  return value === true;
}

export default performanceConfig;
