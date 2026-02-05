"use strict";
// src/utils/requestOptimization.ts
/**
 * Utilitaires pour optimiser les requêtes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreCircuitBreaker = void 0;
exports.parallelBatchReads = parallelBatchReads;
exports.createStreamableResponse = createStreamableResponse;
exports.createDebouncedBatchUpdate = createDebouncedBatchUpdate;
exports.compressData = compressData;
exports.decompressData = decompressData;
/**
 * Parallel batch reads - Lire plusieurs collections en parallèle
 */
async function parallelBatchReads(queries) {
    const results = {};
    try {
        const promises = queries.map(async (q) => {
            try {
                results[q.name] = await q.promise;
            }
            catch (error) {
                console.error(`Error in batch read ${q.name}:`, error);
                results[q.name] = null;
            }
        });
        await Promise.all(promises);
        return results;
    }
    catch (error) {
        console.error('Parallel batch reads error:', error);
        return results;
    }
}
/**
 * Utility pour gérer les large result sets avec streaming
 */
function createStreamableResponse(data, chunkSize = 100) {
    return {
        totalCount: data.length,
        chunks: Math.ceil(data.length / chunkSize),
        *[Symbol.iterator]() {
            for (let i = 0; i < data.length; i += chunkSize) {
                yield data.slice(i, i + chunkSize);
            }
        }
    };
}
/**
 * Circuit breaker pour Firestore (éviter de surcharger)
 */
class FirestoreCircuitBreaker {
    constructor(failureThreshold = 5, successThreshold = 2, timeout = 60000 // 1 minute
    ) {
        this.failureThreshold = failureThreshold;
        this.successThreshold = successThreshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = 0;
        this.state = 'closed';
    }
    async execute(operation) {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'half-open';
                this.successCount = 0;
            }
            else {
                throw new Error('Circuit breaker is OPEN - request rejected');
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'half-open') {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.state = 'closed';
                console.log('✅ Circuit breaker CLOSED');
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'open';
            console.warn('⚠️  Circuit breaker OPEN');
        }
    }
    getState() {
        return this.state;
    }
}
exports.FirestoreCircuitBreaker = FirestoreCircuitBreaker;
/**
 * Debounce pour éviter les updates en cascade
 */
function createDebouncedBatchUpdate(batchUpdateFn, delayMs = 500, maxItems = 100) {
    let queue = [];
    let timeout = null;
    return async (item) => {
        queue.push(item);
        if (queue.length >= maxItems) {
            // Flush si atteint max items
            if (timeout)
                clearTimeout(timeout);
            await batchUpdateFn(queue);
            queue = [];
        }
        else {
            // Sinon, attendre le délai
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if (queue.length > 0) {
                    await batchUpdateFn(queue);
                    queue = [];
                }
            }, delayMs);
        }
    };
}
/**
 * Compression de données pour cache (ZLib)
 */
const zlib_1 = __importDefault(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib_1.default.gzip);
const gunzip = (0, util_1.promisify)(zlib_1.default.gunzip);
async function compressData(data) {
    const jsonString = JSON.stringify(data);
    return gzip(jsonString);
}
async function decompressData(buffer) {
    const jsonString = await gunzip(buffer);
    return JSON.parse(jsonString.toString());
}
//# sourceMappingURL=requestOptimization.js.map