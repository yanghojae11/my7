// src/app/search/SearchResults.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { formatDateKorean } from '@/utils/dateUtils';

interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
  category: string;
  image_url?: string | null;
  view_count: number;
  created_at: string;
}

interface SearchResponse {
  success: boolean;
  data: Article[];
  count: number;
  totalCount?: number;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  searchQuery?: string;
}

interface SearchResultsProps {
  query: string;
  category?: string | undefined;
  page: number;
}

export default function SearchResults({ query, category, page }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({
          success: true,
          data: [],
          count: 0,
          error: null,
          page: 1,
          limit: 20,
          totalPages: 0,
          searchQuery: query
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const searchParams = new URLSearchParams();
        searchParams.set('keywords', query);
        if (category) searchParams.set('category', category);
        searchParams.set('page', page.toString());
        searchParams.set('limit', '20');

        const response = await fetch(`/api/search?${searchParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SearchResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Search failed');
        }
        
        console.log(`[Search] Found ${data.count} results for "${query}"`);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, page]);

  if (loading) {
    return <LoadingSkeleton type="cards" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 중 오류가 발생했습니다</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!results || results.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {query ? `"${query}"에 대한 검색 결과가 없습니다` : '검색어를 입력해주세요'}
        </h3>
        <p className="text-gray-600 mb-6">
          다른 키워드로 검색해보시거나 홈페이지에서 다양한 정책 정보를 확인해보세요.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 검색 결과 개수 */}
      <div className="mb-6 text-sm text-gray-600">
        총 <strong className="text-gray-900">{results.totalCount || results.count}</strong>개의 결과를 찾았습니다.
        {results.totalPages > 1 && (
          <span className="ml-2">
            (페이지 {results.page} / {results.totalPages})
          </span>
        )}
      </div>

      {/* 검색 결과 목록 */}
      <div className="space-y-6">
        {results.data.map((article) => (
          <Link 
            key={article.id} 
            href={`/article/${article.slug}`}
            className="group block"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <div className="flex gap-4">
                {article.image_url && (
                  <div className="flex-shrink-0 w-24 h-18 relative overflow-hidden rounded-lg">
                    <OptimizedImage
                      src={Array.isArray(article.image_url) ? article.image_url[0] : article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  {article.body && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {article.body.substring(0, 200)}...
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="font-medium">작성일:</span>
                        <span className="ml-1">
                          {formatDateKorean(article.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">조회수:</span>
                        <span className="ml-1">{article.view_count}회</span>
                      </div>
                    </div>
                    
                    <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      정책뉴스
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 (추후 구현 가능) */}
      {results.totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2">
            {page > 1 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                이전
              </Link>
            )}
            
            <span className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
              {page}
            </span>
            
            {page < results.totalPages && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}