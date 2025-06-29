'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';

interface CardItem {
  title: string;
  summary: string;
  image: string | StaticImageData;
  url: string;
  tag?: string;
}

interface SectionCardListProps {
  cards: CardItem[];
}

// 설정값들 - 더 많은 콘텐츠 표시
const INITIAL_CARD_COUNT = 12; // 초기 표시 개수 증가
const CARDS_TO_LOAD = 8; // 한 번에 로드할 개수 증가

const SectionCardList: React.FC<SectionCardListProps> = ({ cards }) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_CARD_COUNT);
  const [isLoading, setIsLoading] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 border border-gray-200">
        <div className="text-3xl mb-2">📰</div>
        <p className="font-medium">표시할 기사가 없습니다</p>
        <p className="text-sm text-gray-400 mt-1">나중에 다시 확인해주세요</p>
      </div>
    );
  }

  const cardsToDisplay = cards.slice(0, displayCount);
  const hasMore = displayCount < cards.length;
  const remainingCount = cards.length - displayCount;

  const handleLoadMore = () => {
    setIsLoading(true);
    // 로딩 효과를 위한 약간의 지연
    setTimeout(() => {
      setDisplayCount(prevCount => Math.min(prevCount + CARDS_TO_LOAD, cards.length));
      setIsLoading(false);
    }, 300);
  };

  const handleShowAll = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(cards.length);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div>
      {/* 통계 정보 - 더 컴팩트하게 */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          전체 <span className="font-bold text-gray-900">{cards.length}</span>개 중{' '}
          <span className="font-bold text-blue-600">{cardsToDisplay.length}</span>개 표시
        </div>
        {hasMore && (
          <div className="text-gray-500">
            +{remainingCount}개 더
          </div>
        )}
      </div>

      {/* 카드 그리드 - 더 컴팩트한 그리드, 더 많은 콘텐츠 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cardsToDisplay.map((card, index) => (
          <Link key={card.url || index} href={card.url} className="block group">
            <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 h-full">
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                {typeof card.image === 'string' && card.image.startsWith('/placeholder-') ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <OptimizedImage
                    src={typeof card.image === 'string' ? card.image : (card.image as unknown as string)}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    priority={index < 8}
                  />
                )}
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
              </div>
              
              <div className="p-4">
                {card.tag && (
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2.5 shadow-sm">
                    {card.tag}
                  </span>
                )}
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-relaxed">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {card.summary}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* 로딩 중 표시 */}
      {isLoading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 text-blue-600">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">기사를 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 더보기 버튼들 - 더 컴팩트하게 */}
      {hasMore && !isLoading && (
        <div className="text-center mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <button
              onClick={handleLoadMore}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {CARDS_TO_LOAD}개 더 보기 →
            </button>
            
            {remainingCount > CARDS_TO_LOAD && (
              <button
                onClick={handleShowAll}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-5 rounded-full border border-gray-300 hover:border-gray-400 transition-all duration-300"
              >
                전체 {remainingCount}개 모두 보기
              </button>
            )}
          </div>
          
          {/* 진행률 표시 - 더 컴팩트하게 */}
          <div className="max-w-sm mx-auto">
            <div className="bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(displayCount / cards.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((displayCount / cards.length) * 100)}% 로딩됨
            </p>
          </div>
        </div>
      )}

      {/* 모든 기사를 다 봤을 때 */}
      {!hasMore && cards.length > INITIAL_CARD_COUNT && (
        <div className="text-center mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-xl mb-1">🎉</div>
          <p className="text-green-800 font-medium text-sm">
            모든 기사를 확인했습니다!
          </p>
          <p className="text-green-600 text-xs mt-1">
            총 {cards.length}개의 기사를 읽어보세요
          </p>
        </div>
      )}
    </div>
  );
};

export default SectionCardList;