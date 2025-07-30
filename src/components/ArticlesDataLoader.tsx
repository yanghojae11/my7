'use client';

import { useEffect, useState } from 'react';
import MainPickSlider from "@/components/MainPickSliderWrapper";
import RankingNews from "@/components/RankingNews";
import RealTimeFeed from "@/components/RealTimeFeedWrapper";
import KeywordTrends from "@/components/KeywordTrends";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ArticlesHomeCategorySections from "@/components/ArticlesHomeCategorySections";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";
import { getLatestArticles, getPopularArticles, convertArticleToSlideItem, convertArticleToRankingItem, convertArticleToFeedItem } from '@/lib/articles';
import { Article } from '@/lib/articles';

export default function ArticlesDataLoader() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Starting to load articles...');
        
        const [featured, popular] = await Promise.all([
          getLatestArticles(5),
          getPopularArticles(10)
        ]);
        
        console.log('📊 Loaded articles:', {
          featured: featured.length,
          popular: popular.length
        });
        
        setFeaturedArticles(featured);
        setPopularArticles(popular);
        
      } catch (err) {
        console.error('❌ Failed to load articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Show diagnostics if there's an error or no data
  useEffect(() => {
    if (error || (!loading && featuredArticles.length === 0 && popularArticles.length === 0)) {
      setShowDiagnostics(true);
    }
  }, [error, loading, featuredArticles.length, popularArticles.length]);

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

  // Convert to display formats
  const slideItems = featuredArticles.map(article => convertArticleToSlideItem(article));
  const rankingNewsItems = popularArticles.map((article, index) => convertArticleToRankingItem(article, index + 1));
  const feedItems = featuredArticles.slice(0, 10).map(article => convertArticleToFeedItem(article));

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
      {/* Show diagnostics section if needed */}
      {showDiagnostics && (
        <section className="bg-white py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SupabaseConnectionTest />
            {(featuredArticles.length > 0 || popularArticles.length > 0) && (
              <button
                onClick={() => setShowDiagnostics(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hide Diagnostics & Show Content
              </button>
            )}
          </div>
        </section>
      )}

      {error && (
        <section className="bg-red-50 py-6 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center p-6">
              <h1 className="text-2xl font-bold text-red-900 mb-4">
                ⚠️ 데이터 로딩 오류
              </h1>
              <p className="text-red-700 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main slider section */}
      <section className="bg-white py-6 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {slideItems.length > 0 ? (
            <MainPickSlider items={slideItems} />
          ) : (
            <div className="p-6 text-center text-gray-500 bg-gray-100 rounded-xl">
              {loading ? '주요 정책을 불러오는 중입니다...' : '표시할 주요 정책이 없습니다.'}
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left main content area */}
          <div className="lg:col-span-2">
            <ArticlesHomeCategorySections />
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Popular articles */}
            {rankingNewsItems.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">📰 인기 정책</h2>
                <RankingNews ranking={rankingNewsItems} />
              </section>
            )}

            {/* Latest articles */}
            {feedItems.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔥 최신 지원금</h2>
                <RealTimeFeed feed={feedItems} />
              </section>
            )}

            {/* Keyword trends */}
            {keywordTrends.length > 0 && (
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔍 인기 지원사업</h2>
                <KeywordTrends trends={keywordTrends} />
              </section>
            )}
          </aside>
        </div>

        {/* Debug information */}
        {!showDiagnostics && (featuredArticles.length > 0 || popularArticles.length > 0) && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">
                  ✅ 데이터 로딩 성공: {featuredArticles.length}개 주요 기사, {popularArticles.length}개 인기 기사
                </p>
              </div>
              <button
                onClick={() => setShowDiagnostics(true)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                진단 정보 보기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}