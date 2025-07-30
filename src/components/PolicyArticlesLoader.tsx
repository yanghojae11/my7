'use client';

import { useEffect, useState } from 'react';
import MainPickSlider from "@/components/MainPickSliderWrapper";
import RankingNews from "@/components/RankingNews";
import RealTimeFeed from "@/components/RealTimeFeedWrapper";
import KeywordTrends from "@/components/KeywordTrends";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import HomeCategorySections from "@/components/HomeCategorySections";
import { getLatestPolicies, getPopularPolicies } from '@/lib/policies';
import { PolicyWithDetails } from '@/types/database';

// Convert policy to different item types for existing components
function convertPolicyToSlideItem(policy: PolicyWithDetails) {
  return {
    id: policy.id,
    title: policy.title,
    image_url: policy.featured_image_url || '/placeholder-card.jpg',
    tag: policy.category?.name || '정책',
    time: new Date(policy.published_at || policy.created_at).toLocaleDateString('ko-KR'),
    summary: policy.summary || (policy.content ? policy.content.substring(0, 100) + '...' : ''),
    url: `/policy/${policy.slug}`,
    slug: policy.slug
  };
}

function convertPolicyToRankingItem(policy: PolicyWithDetails, rank: number) {
  return {
    id: policy.id,
    title: policy.title,
    rank,
    thumbnail: policy.featured_image_url || null,
    url: `/policy/${policy.slug}`,
    view_count: policy.view_count
  };
}

function convertPolicyToFeedItem(policy: PolicyWithDetails) {
  return {
    id: policy.id,
    title: policy.title,
    timestamp: policy.published_at || policy.created_at,
    summary: policy.summary || (policy.content ? policy.content.substring(0, 70) + '...' : ''),
    tag: policy.category?.name || null,
    url: `/policy/${policy.slug}`,
    image_url: policy.featured_image_url || null,
    slug: policy.slug,
    created_at: policy.created_at,
    source: policy.application_url || null
  };
}

export default function PolicyArticlesLoader() {
  const [featuredPolicies, setFeaturedPolicies] = useState<PolicyWithDetails[]>([]);
  const [popularPolicies, setPopularPolicies] = useState<PolicyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const [featured, popular] = await Promise.all([
          getLatestPolicies(5),
          getPopularPolicies(10)
        ]);
        setFeaturedPolicies(featured);
        setPopularPolicies(popular);
        // console.log('Loaded featured policies:', featured.length);
        // console.log('Loaded popular policies:', popular.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load policies');
        console.error('Failed to load policies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <section className="bg-white py-6 shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingSkeleton type="slider" />
          </div>
        </section>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LoadingSkeleton type="cards" />
              <LoadingSkeleton type="cards" />
            </div>
            <div className="lg:col-span-1">
              <LoadingSkeleton type="ranking" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            정책 정보를 불러오는 중 문제가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // Convert to display formats
  const slideItems = featuredPolicies.map(policy => convertPolicyToSlideItem(policy));
  const rankingNewsItems = popularPolicies.map((policy, index) => convertPolicyToRankingItem(policy, index + 1));
  const feedItems = featuredPolicies.slice(0, 10).map(policy => convertPolicyToFeedItem(policy));

  const keywordTrends = [
    { name: '창업지원', score: 95, change: '+12%' },
    { name: '주택대출', score: 88, change: '+8%' },
    { name: '취업지원', score: 82, change: '+15%' },
    { name: '교육비지원', score: 75, change: '+5%' },
    { name: '복지혜택', score: 68, change: '+3%' },
    { name: '정부지원금', score: 60, change: '+10%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* 메인 슬라이더 섹션 */}
      <section className="bg-white py-6 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {slideItems.length > 0 ? (
            <MainPickSlider items={slideItems} />
          ) : (
            <div className="p-6 text-center text-gray-500 bg-gray-100 rounded-xl">
              주요 정책을 불러오는 중입니다...
            </div>
          )}
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 메인 콘텐츠 영역 - 새로운 카테고리 섹션들 */}
          <div className="lg:col-span-2">
            <HomeCategorySections />
          </div>

          {/* 오른쪽 사이드바 */}
          <aside className="lg:col-span-1 space-y-6">
            {/* 인기 정책 */}
            {rankingNewsItems.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">📰 인기 정책</h2>
                <RankingNews ranking={rankingNewsItems} />
              </section>
            )}

            {/* 최신 지원금 */}
            {feedItems.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔥 최신 지원금</h2>
                <RealTimeFeed feed={feedItems} />
              </section>
            )}

            {/* 인기 지원사업 */}
            {keywordTrends.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔍 인기 지원사업</h2>
                <KeywordTrends trends={keywordTrends} />
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}