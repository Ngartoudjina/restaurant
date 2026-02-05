// src/middlewares/advancedPerformance.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface RequestMetrics {
  startTime: number;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  cached?: boolean;
}

const metricsMap = new Map<string, RequestMetrics[]>();
const SLOW_THRESHOLD = 200; // ms

// Middleware pour tracker les metrics
export const advancedPerformanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = performance.now();
  const key = `${req.method} ${req.path}`;

  // Intercepter la réponse
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    const duration = Math.round(performance.now() - startTime);
    const statusCode = res.statusCode;
    const cached = data?.cached || false;

    // Enregistrer les metrics
    if (!metricsMap.has(key)) {
      metricsMap.set(key, []);
    }
    metricsMap.get(key)!.push({
      startTime,
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      cached
    });

    // Log si lent
    if (duration > SLOW_THRESHOLD) {
      console.warn(
        `🐌 SLOW REQUEST - ${req.method} ${req.path} [${statusCode}] - ${duration}ms ${cached ? '(cached)' : ''}`
      );
    } else {
      console.log(
        `✅ ${req.method} ${req.path} [${statusCode}] - ${duration}ms ${cached ? '(cached)' : ''}`
      );
    }

    // Ajouter le header de timing
    res.set('X-Response-Time', `${duration}ms`);
    res.set('X-Cache-Hit', cached ? 'true' : 'false');

    return originalJson(data);
  };

  next();
};

// Endpoint pour afficher les statistiques
export const getPerformanceStats = (
  _: Request,
  res: Response
): void => {
  const stats: Record<string, any> = {};

  metricsMap.forEach((metrics, endpoint) => {
    const totalRequests = metrics.length;
    const totalDuration = metrics.reduce((acc, m) => acc + (m.duration || 0), 0);
    const avgDuration = totalDuration / totalRequests;
    const cacheHitRate = (metrics.filter(m => m.cached).length / totalRequests) * 100;
    const minDuration = Math.min(...metrics.map(m => m.duration || 0));
    const maxDuration = Math.max(...metrics.map(m => m.duration || 0));

    stats[endpoint] = {
      totalRequests,
      avgDuration: Math.round(avgDuration),
      minDuration,
      maxDuration,
      cacheHitRate: Math.round(cacheHitRate * 10) / 10,
      errorRate: Math.round(
        (metrics.filter(m => m.statusCode! >= 400).length / totalRequests) * 100 * 10
      ) / 10
    };
  });

  res.json({
    success: true,
    metrics: stats,
    totalEndpoints: metricsMap.size,
    timestamp: new Date().toISOString()
  });
};

// Reset stats
export const resetPerformanceStats = (
  _: Request,
  res: Response
): void => {
  metricsMap.clear();
  res.json({
    success: true,
    message: 'Performance metrics cleared'
  });
};
