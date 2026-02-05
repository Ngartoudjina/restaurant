import { Request, Response, NextFunction } from 'express';

export const performanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = Math.round(performance.now() - start);
    if (duration > 500) {
      console.warn(`🐌 ${req.method} ${req.url} - ${duration}ms`);
    }
  });

  next();
};
