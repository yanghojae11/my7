'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PolicyArticle } from '@/types/database';
import PolicySummaryCard from './PolicySummaryCard';

interface VirtualizedListProps {
  items: PolicyArticle[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: PolicyArticle, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  overscan?: number;
}

export default function VirtualizedList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  onLoadMore,
  hasMore = false,
  loading = false,
  overscan = 5
}: VirtualizedListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);

    // Load more when approaching the end
    if (
      onLoadMore &&
      hasMore &&
      !loading &&
      scrollTop + containerHeight >= totalHeight - itemHeight * 3
    ) {
      onLoadMore();
    }

    // Clear scrolling state after scroll stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onLoadMore, hasMore, loading, containerHeight, totalHeight, itemHeight]);

  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (items[i]) {
        result.push({
          index: i,
          item: items[i],
          style: {
            position: 'absolute' as const,
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          },
        });
      }
    }
    return result;
  }, [visibleRange, items, itemHeight]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="relative"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'relative',
          }}
        >
          {visibleItems.map(({ index, item, style }) => (
            <div key={`${item.id}-${index}`} style={style}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-gray-600">로딩 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}