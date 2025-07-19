'use client';

import { useState, useEffect, useCallback, lazy, Suspense, useMemo, memo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FilterState } from '@/components/CategoryFilter';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import VirtualizedList from '@/components/VirtualizedList';
import { memoryCache, createCacheKey } from '@/lib/cache';

const CategoryFilter = lazy(() => import('@/components/CategoryFilter'));
const PolicySummaryCard = lazy(() => import('@/components/PolicySummaryCard'));
const PolicyKeyPointsGallery = lazy(() => import('@/components/PolicyKeyPointsGallery'));
import { PolicyArticle } from '@/types/database';

function PolicyListClient() {
  const [policies, setPolicies] = useState<PolicyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredPolicies, setFeaturedPolicies] = useState<PolicyArticle[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams?.get('q') || '',
    selectedCategories: searchParams?.get('categories')?.split(',').filter(Boolean) || [],
    selectedAudiences: searchParams?.get('audiences')?.split(',').filter(Boolean) || [],
    selectedPolicyTypes: searchParams?.get('types')?.split(',').filter(Boolean) || [],
    sortBy: (searchParams?.get('sort') as FilterState['sortBy']) || 'latest'
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

      // 캐시 키 생성
      const cacheKey = createCacheKey('policies', { params: params.toString(), page });
      
      // 캐시에서 먼저 확인
      const cached = memoryCache.get(cacheKey);
      if (cached && page === 1) {
        setPolicies(cached.data);
        setTotalCount(cached.total);
        setCurrentPage(page);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/policies?${params}`);
      const data = await response.json();

      if (data.success) {
        const newPolicies = page === 1 ? data.data : [...policies, ...data.data];
        setPolicies(newPolicies);
        setTotalCount(data.total);
        setCurrentPage(page);
        
        // 첫 페이지만 캐시에 저장 (5분)
        if (page === 1) {
          memoryCache.set(cacheKey, { data: data.data, total: data.total }, 300000);
        }
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

  const getFeaturedPolicyImages = useMemo(() => {
    const images: string[] = [];
    featuredPolicies.forEach(policy => {
      if (policy.additional_images && policy.additional_images.length > 0) {
        images.push(...policy.additional_images.slice(0, 2));
      }
    });
    return images.slice(0, 6);
  }, [featuredPolicies]);

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <Suspense fallback={<LoadingSkeleton type="cards" />}>
        <CategoryFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          resultsCount={totalCount}
          isLoading={loading}
        />
      </Suspense>

      {/* 주요 정책 핵심 포인트 갤러리 */}
      {featuredPolicies.length > 0 && getFeaturedPolicyImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              💡 주요 정책 핵심 포인트
            </h2>
            <Suspense fallback={<LoadingSkeleton type="cards" />}>
              <PolicyKeyPointsGallery 
                images={getFeaturedPolicyImages}
                title="주요 정책 핵심 포인트"
              />
            </Suspense>
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <VirtualizedList
                  items={policies}
                  itemHeight={200}
                  containerHeight={800}
                  renderItem={(policy, index) => (
                    <div className="p-4 border-b border-gray-100 last:border-b-0">
                      <Suspense fallback={<LoadingSkeleton type="cards" />}>
                        <PolicySummaryCard 
                          policy={policy}
                          showImages={true}
                          variant="default"
                        />
                      </Suspense>
                    </div>
                  )}
                  onLoadMore={handleLoadMore}
                  hasMore={policies.length < totalCount}
                  loading={loading}
                  overscan={3}
                />
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
                <Suspense key={policy.id} fallback={<LoadingSkeleton type="card" />}>
                  <PolicySummaryCard 
                    policy={policy}
                    showImages={true}
                    variant="compact"
                  />
                </Suspense>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PolicyListClient);