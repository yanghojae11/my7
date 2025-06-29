'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';

interface FeedItem {
  title: string;
  timestamp: string;
  summary: string;
  tag: string | null;
  url: string;
  image_url: string | null;
  slug: string;
  created_at: string;
  source: string | null;
}

interface RealTimeFeedProps {
  feed: FeedItem[];
}

const INITIAL_FEED_COUNT = 6;
const FEED_TO_LOAD = 4;

const RealTimeFeed: React.FC<RealTimeFeedProps> = ({ feed }) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_FEED_COUNT);

  if (!feed || feed.length === 0) {
    return (
      <div className="p-3 text-center text-gray-500 text-sm">
        실시간 피드 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const feedToDisplay = feed.slice(0, displayCount);
  const hasMore = displayCount < feed.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + FEED_TO_LOAD, feed.length));
  };

  return (
    <div className="space-y-3">
      {/* 실시간 피드 목록 - 제목 제거, page.tsx에서 관리 */}
      <ul className="space-y-3">
        {feedToDisplay.map((item, index) => (
          <li
            key={item.slug || index}
            className="flex items-start bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors p-3 group"
          >
            {item.image_url && (
              <div className="relative w-16 h-12 mr-3 rounded-md overflow-hidden flex-shrink-0">
                <OptimizedImage
                  src={item.image_url as string}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="64px"
                  priority={index === 0}
                />
              </div>
            )}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {item.tag && (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed mb-1">
                <Link href={item.url} className="hover:text-blue-600 hover:underline">
                  {item.title}
                </Link>
              </h3>
              {item.summary && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="text-center pt-3">
          <button
            onClick={handleLoadMore}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
          >
            {FEED_TO_LOAD}개 더 보기 →
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeFeed;