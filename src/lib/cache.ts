// In-Memory Cache with TTL support for fast data access
import { config } from './config';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = config.cache.maxSize, defaultTTL = config.cache.ttl) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL * 1000; // Convert to milliseconds
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const expiry = Date.now() + (ttl ? ttl * 1000 : this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    for (const [key, entry] of entries) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }

    // If still over limit, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([, entry]) => now <= entry.expiry)
        .sort((a, b) => a[1].expiry - b[1].expiry);
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize * 0.2));
      for (const [key] of toRemove) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  stats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Implement hit tracking if needed
    };
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache decorator for async functions
export function cached<T>(
  keyGenerator: (...args: unknown[]) => string,
  ttl?: number
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = keyGenerator(...args);
      const cachedResult = cache.get<T>(key);

      if (cachedResult !== null) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
}

// Simple cache wrapper for functions
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedResult = cache.get<T>(key);
  
  if (cachedResult !== null) {
    return cachedResult;
  }

  const result = await fn();
  cache.set(key, result, ttl);
  return result;
}
