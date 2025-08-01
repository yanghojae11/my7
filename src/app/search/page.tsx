// src/app/search/page.tsx

import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from './SearchResults';

interface SearchPageProps {
  searchParams: {
    q?: string;
    keyword?: string;
    keywords?: string;
    category?: string;
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || searchParams.keyword || searchParams.keywords || '';
  
  if (!query) {
    return {
      title: '검색 | MY7 정책지원',
      description: '정부 정책 및 지원사업 정보를 검색해보세요.',
    };
  }

  return {
    title: `"${query}" 검색 결과 | MY7 정책지원`,
    description: `"${query}"에 대한 정부 정책 및 지원사업 검색 결과입니다.`,
    keywords: [query, '정부정책', '지원사업', '정책검색'],
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || searchParams.keyword || searchParams.keywords || '';
  const category = searchParams.category;
  const page = parseInt(searchParams.page || '1');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 검색 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `"${query}" 검색 결과` : '정책 검색'}
          </h1>
          {query && (
            <p className="text-gray-600">
              {category && `${category} 카테고리에서 `}"{query}"에 대한 검색 결과입니다.
            </p>
          )}
        </div>

        {/* 검색 결과 */}
        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchResults query={query} category={category} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}