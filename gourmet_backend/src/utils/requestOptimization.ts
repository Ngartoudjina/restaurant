// src/utils/requestOptimization.ts
/**
 * Utilitaires pour optimiser les requêtes
 */

/**
 * Parallel batch reads - Lire plusieurs collections en parallèle
 */
export async function parallelBatchReads(
  queries: Array<{ name: string; promise: Promise<any> }>
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  try {
    const promises = queries.map(async (q) => {
      try {
        results[q.name] = await q.promise;
      } catch (error) {
        console.error(`Error in batch read ${q.name}:`, error);
        results[q.name] = null;
      }
    });

    await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Parallel batch reads error:', error);
    return results;
  }
}

/**
 * Utility pour gérer les large result sets avec streaming
 */
export function createStreamableResponse(data: any[], chunkSize: number = 100) {
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
export class FirestoreCircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private successThreshold = 2,
    private timeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - request rejected');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
        console.log('✅ Circuit breaker CLOSED');
      }
    }
  }

  private onFailure() {
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

/**
 * Debounce pour éviter les updates en cascade
 */
export function createDebouncedBatchUpdate(
  batchUpdateFn: (items: any[]) => Promise<void>,
  delayMs: number = 500,
  maxItems: number = 100
) {
  let queue: any[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return async (item: any) => {
    queue.push(item);

    if (queue.length >= maxItems) {
      // Flush si atteint max items
      if (timeout) clearTimeout(timeout);
      await batchUpdateFn(queue);
      queue = [];
    } else {
      // Sinon, attendre le délai
      if (timeout) clearTimeout(timeout);
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
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export async function compressData(data: any): Promise<Buffer> {
  const jsonString = JSON.stringify(data);
  return gzip(jsonString);
}

export async function decompressData(buffer: Buffer): Promise<any> {
  const jsonString = await gunzip(buffer);
  return JSON.parse(jsonString.toString());
}
