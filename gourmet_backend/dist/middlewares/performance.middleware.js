"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceLogger = void 0;
const performanceLogger = (req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
        const duration = Math.round(performance.now() - start);
        if (duration > 500) {
            console.warn(`🐌 ${req.method} ${req.url} - ${duration}ms`);
        }
    });
    next();
};
exports.performanceLogger = performanceLogger;
//# sourceMappingURL=performance.middleware.js.map