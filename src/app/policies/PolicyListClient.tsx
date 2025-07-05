'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CategoryFilter, { FilterState } from '@/components/CategoryFilter';
import PolicySummaryCard from '@/components/PolicySummaryCard';
import PolicyKeyPointsGallery from '@/components/PolicyKeyPointsGallery';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { PolicyArticle } from '@/types/database';

export default function PolicyListClient() {
  const [policies, setPolicies] = useState<PolicyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredPolicies, setFeaturedPolicies] = useState<PolicyArticle[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('q') || '',
    selectedCategories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    selectedAudiences: searchParams.get('audiences')?.split(',').filter(Boolean) || [],
    selectedPolicyTypes: searchParams.get('types')?.split(',').filter(Boolean) || [],
    sortBy: (searchParams.get('sort') as FilterState['sortBy']) || 'latest'
  });

  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.selectedCategories.length > 0) params.set('categories', newFilters.selectedCategories.join(','));
    if (newFilters.selectedAudiences.length > 0) params.set('audiences', newFilters.selectedAudiences.join(','));
    if (newFilters.selectedPolicyTypes.length > 0) params.set('types', newFilters.selectedPolicyTypes.join(','));
    if (newFilters.sortBy !== 'latest') params.set('sort', newFilters.sortBy);

    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/policies${newURL}`, { scroll: false });
  }, [router]);

  const fetchPolicies = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12',
        sort_by: filters.sortBy === 'latest' ? 'created_at' : 
                 filters.sortBy === 'popular' ? 'like_count' : 'view_count',
        sort_order: 'desc'
      });

      if (filters.query) params.append('query', filters.query);
      if (filters.selectedCategories.length > 0) {
        filters.selectedCategories.forEach(cat => params.append('categories', cat));
      }
      if (filters.selectedAudiences.length > 0) {
        filters.selectedAudiences.forEach(aud => params.append('audiences', aud));
      }
      if (filters.selectedPolicyTypes.length > 0) {
        filters.selectedPolicyTypes.forEach(type => params.append('types', type));
      }

      const response = await fetch(`/api/policies?${params}`);
      const data = await response.json();

      if (data.success) {
        setPolicies(page === 1 ? data.data : [...policies, ...data.data]);
        setTotalCount(data.total);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch policies:', data.error);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, policies]);

  const fetchFeaturedPolicies = useCallback(async () => {
    try {
      const response = await fetch('/api/policies?featured=true&per_page=5');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedPolicies(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured policies:', error);
    }
  }, []);

  useEffect(() => {
    fetchPolicies(1);
    fetchFeaturedPolicies();
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateURL(newFilters);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && policies.length < totalCount) {
      fetchPolicies(currentPage + 1);
    }
  };

  const getFeaturedPolicyImages = () => {
    const images: string[] = [];
    featuredPolicies.forEach(policy => {
      if (policy.additional_images && policy.additional_images.length > 0) {
        images.push(...policy.additional_images.slice(0, 2));
      }
    });
    return images.slice(0, 6);
  };

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <CategoryFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        resultsCount={totalCount}
        isLoading={loading}
      />

      {/* 주요 정책 핵심 포인트 갤러리 */}
      {featuredPolicies.length > 0 && getFeaturedPolicyImages().length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              💡 주요 정책 핵심 포인트
            </h2>
            <PolicyKeyPointsGallery 
              images={getFeaturedPolicyImages()}
              title="주요 정책 핵심 포인트"
            />
          </div>
        </div>
      )}

      {/* 정책 리스트 */}
      <div className="space-y-4">
        {loading && currentPage === 1 ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} type="cards" />
            ))}
          </div>
        ) : (
          <>
            {policies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600">
                  검색 조건을 변경하거나 다른 키워드로 검색해보세요.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {policies.map((policy, index) => (
                  <PolicySummaryCard 
                    key={`${policy.id}-${index}`}
                    policy={policy}
                    showImages={true}
                    variant="default"
                  />
                ))}
              </div>
            )}

            {/* 더 보기 버튼 */}
            {policies.length < totalCount && (
              <div className="text-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      로딩 중...
                    </span>
                  ) : (
                    `더 보기 (${policies.length}/${totalCount})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 추천 정책 섹션 */}
      {featuredPolicies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🌟 추천 정책
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredPolicies.slice(0, 4).map((policy) => (
                <PolicySummaryCard 
                  key={policy.id}
                  policy={policy}
                  showImages={true}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}