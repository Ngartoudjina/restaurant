/**
 * Configuration centralisée des optimisations de performance
 */
export declare const performanceConfig: {
    cache: {
        l1: {
            enabled: boolean;
            maxSize: number;
            ttl: number;
        };
        l2Redis: {
            enabled: boolean;
            ttl: number;
        };
    };
    httpCache: {
        enabled: boolean;
        patterns: {
            products: {
                maxAge: number;
                staleWhileRevalidate: number;
                staleIfError: number;
            };
            orders: {
                maxAge: number;
                staleWhileRevalidate: number;
            };
            reservations: {
                maxAge: number;
                staleWhileRevalidate: number;
            };
            messages: {
                maxAge: number;
                staleWhileRevalidate: number;
            };
        };
    };
    requestCoalescing: {
        enabled: boolean;
        timeout: number;
        maxPending: number;
    };
    compression: {
        enabled: boolean;
        level: number;
        threshold: number;
    };
    firestore: {
        batchSize: number;
        useSelect: boolean;
        enableIndexing: boolean;
        defaultPageSize: number;
        maxPageSize: number;
    };
    circuitBreaker: {
        enabled: boolean;
        failureThreshold: number;
        successThreshold: number;
        timeout: number;
    };
    monitoring: {
        enabled: boolean;
        slowThreshold: number;
        trackMetrics: boolean;
        metricsRetention: number;
    };
    rateLimiting: {
        enabled: boolean;
        requestsPerMinute: number;
        windowMs: number;
    };
};
export declare function getPerformanceConfig(section?: keyof typeof performanceConfig): {
    l1: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
    l2Redis: {
        enabled: boolean;
        ttl: number;
    };
} | {
    enabled: boolean;
    patterns: {
        products: {
            maxAge: number;
            staleWhileRevalidate: number;
            staleIfError: number;
        };
        orders: {
            maxAge: number;
            staleWhileRevalidate: number;
        };
        reservations: {
            maxAge: number;
            staleWhileRevalidate: number;
        };
        messages: {
            maxAge: number;
            staleWhileRevalidate: number;
        };
    };
} | {
    enabled: boolean;
    timeout: number;
    maxPending: number;
} | {
    enabled: boolean;
    level: number;
    threshold: number;
} | {
    batchSize: number;
    useSelect: boolean;
    enableIndexing: boolean;
    defaultPageSize: number;
    maxPageSize: number;
} | {
    enabled: boolean;
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
} | {
    enabled: boolean;
    slowThreshold: number;
    trackMetrics: boolean;
    metricsRetention: number;
} | {
    enabled: boolean;
    requestsPerMinute: number;
    windowMs: number;
} | {
    cache: {
        l1: {
            enabled: boolean;
            maxSize: number;
            ttl: number;
        };
        l2Redis: {
            enabled: boolean;
            ttl: number;
        };
    };
    httpCache: {
        enabled: boolean;
        patterns: {
            products: {
                maxAge: number;
                staleWhileRevalidate: number;
                staleIfError: number;
            };
            orders: {
                maxAge: number;
                staleWhileRevalidate: number;
            };
            reservations: {
                maxAge: number;
                staleWhileRevalidate: number;
            };
            messages: {
                maxAge: number;
                staleWhileRevalidate: number;
            };
        };
    };
    requestCoalescing: {
        enabled: boolean;
        timeout: number;
        maxPending: number;
    };
    compression: {
        enabled: boolean;
        level: number;
        threshold: number;
    };
    firestore: {
        batchSize: number;
        useSelect: boolean;
        enableIndexing: boolean;
        defaultPageSize: number;
        maxPageSize: number;
    };
    circuitBreaker: {
        enabled: boolean;
        failureThreshold: number;
        successThreshold: number;
        timeout: number;
    };
    monitoring: {
        enabled: boolean;
        slowThreshold: number;
        trackMetrics: boolean;
        metricsRetention: number;
    };
    rateLimiting: {
        enabled: boolean;
        requestsPerMinute: number;
        windowMs: number;
    };
};
export declare function isFeatureEnabled(feature: string): boolean;
export default performanceConfig;
//# sourceMappingURL=performance.config.d.ts.map