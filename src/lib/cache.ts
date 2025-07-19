// src/lib/cache.ts - 캐싱 전략 및 유틸리티

import { unstable_cache } from 'next/cache';

export interface CacheConfig {
  revalidate?: number;
  tags?: string[];
}

// 캐시 키 생성 함수
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  
  return `${prefix}:${paramString}`;
}

// 기본 캐시 설정
export const CACHE_CONFIGS = {
  // 정책 목록 - 15분 캐시
  policies: {
    revalidate: 900, // 15분
    tags: ['policies'],
  },
  
  // 카테고리 목록 - 1시간 캐시
  categories: {
    revalidate: 3600, // 1시간
    tags: ['categories'],
  },
  
  // 인기 정책 - 30분 캐시
  popular: {
    revalidate: 1800, // 30분
    tags: ['policies', 'popular'],
  },
  
  // 최신 정책 - 10분 캐시
  latest: {
    revalidate: 600, // 10분
    tags: ['policies', 'latest'],
  },
  
  // 단일 정책 - 1시간 캐시
  policy: {
    revalidate: 3600, // 1시간
    tags: ['policies'],
  },
  
  // 기관 정보 - 6시간 캐시
  agencies: {
    revalidate: 21600, // 6시간
    tags: ['agencies'],
  },
} as const;

// 캐시된 함수 생성 헬퍼
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyPrefix: string,
  config: CacheConfig = {}
) {
  return unstable_cache(
    fn,
    [keyPrefix],
    {
      revalidate: config.revalidate,
      tags: config.tags,
    }
  );
}

// 메모리 캐시 (클라이언트 사이드)
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000) { // 기본 5분
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  // 만료된 항목 정리
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 전역 메모리 캐시 인스턴스
export const memoryCache = new MemoryCache();

// 주기적으로 캐시 정리 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 300000); // 5분마다 정리
}

// 캐시 태그 무효화 함수
export function invalidateCache(tags: string[]) {
  // Next.js 13+ 캐시 무효화는 서버 사이드에서만 가능
  if (typeof window === 'undefined') {
    // 서버 사이드에서 revalidateTag 사용
    // import { revalidateTag } from 'next/cache';
    // tags.forEach(tag => revalidateTag(tag));
  }
}

// 캐시 통계 (개발 환경에서 사용)
export function getCacheStats() {
  return {
    memoryCache: {
      size: memoryCache['cache'].size,
      keys: Array.from(memoryCache['cache'].keys()),
    },
  };
}

// 캐시 미들웨어 함수
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    keyPrefix: string;
    cacheConfig?: CacheConfig;
    memoryTTL?: number;
  }
) {
  return async (...args: T): Promise<R> => {
    const key = createCacheKey(options.keyPrefix, { args });
    
    // 먼저 메모리 캐시 확인
    const cached = memoryCache.get(key);
    if (cached) {
      return cached;
    }
    
    // 캐시 미스, 함수 실행
    const result = await fn(...args);
    
    // 메모리 캐시에 저장
    memoryCache.set(key, result, options.memoryTTL);
    
    return result;
  };
}