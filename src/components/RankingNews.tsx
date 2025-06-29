'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type RankingItem = {
  title: string;
  rank: number;
  thumbnail: string | null;
  url: string;
};

type RankingNewsProps = {
  ranking: RankingItem[];
};

const INITIAL_RANK_COUNT = 8;
const RANK_TO_LOAD = 4;

export default function RankingNews({ ranking }: RankingNewsProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_RANK_COUNT);

  if (!ranking?.length) {
    return (
      <div className="p-3 text-center text-gray-500 text-sm">
        인기 정책 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const rankingToDisplay = ranking.slice(0, displayCount);
  const hasMore = displayCount < ranking.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + RANK_TO_LOAD, ranking.length));
  };

  return (
    <div className="space-y-3">
      <ol className="space-y-2.5">
        {rankingToDisplay.map((item) => (
          <li
            key={item.url}
            className="flex items-center gap-2.5 group hover:bg-gray-50 px-2 py-2 rounded-md transition-colors"
          >
            <span
              className={`text-base font-bold min-w-[20px] text-center ${
                item.rank <= 3 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {item.rank}
            </span>

            <div className="relative w-12 h-9 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="48px"
                  priority={item.rank <= 3}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  N/A
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={item.url}
                className="block text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-700 hover:underline transition-colors leading-relaxed"
                title={item.title}
              >
                {item.title}
              </Link>
            </div>
          </li>
        ))}
      </ol>

      {hasMore && (
        <div className="text-center pt-3">
          <button
            onClick={handleLoadMore}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
          >
            {RANK_TO_LOAD}개 더 보기 →
          </button>
        </div>
      )}
    </div>
  );
}