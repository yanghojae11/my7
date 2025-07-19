'use client';

import { useEffect, useState } from 'react';
import MainPickSlider from "@/components/MainPickSliderWrapper";
import RankingNews from "@/components/RankingNews";
import RealTimeFeed from "@/components/RealTimeFeedWrapper";
import SectionCardList from "@/components/SectionCardListWrapper";
import HorizontalCardSlider from "@/components/HorizontalCardSliderWrapper";
import KeywordTrends from "@/components/KeywordTrends";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
  category: string;
  original_url?: string | null;
  image_url?: string | null;
  view_count: number;
  created_at: string;
}

interface ArticleResponse {
  success: boolean;
  data: Article[];
  count: number;
  error: string | null;
}

// Convert article to different item types
function convertArticleToSlideItem(article: Article) {
  return {
    id: article.id,
    title: article.title,
    image_url: article.image_url || '/placeholder-card.jpg',
    tag: article.category || '정책',
    time: new Date(article.created_at).toLocaleDateString('ko-KR'),
    summary: article.body ? article.body.substring(0, 100) + '...' : '',
    url: `/article/${article.slug}`,
    slug: article.slug
  };
}

function convertArticleToRankingItem(article: Article, rank: number) {
  return {
    id: article.id,
    title: article.title,
    rank,
    thumbnail: article.image_url || null,
    url: `/article/${article.slug}`,
    view_count: article.view_count
  };
}

function convertArticleToFeedItem(article: Article) {
  return {
    id: article.id,
    title: article.title,
    timestamp: article.created_at,
    summary: article.body ? article.body.substring(0, 70) + '...' : '',
    tag: article.category || null,
    url: `/article/${article.slug}`,
    image_url: article.image_url || null,
    slug: article.slug,
    created_at: article.created_at,
    source: article.original_url || null
  };
}

function convertArticleToCardItem(article: Article) {
  return {
    id: article.id,
    title: article.title,
    summary: article.body ? article.body.substring(0, 100) + '...' : '',
    description: article.body ? article.body.substring(0, 150) + '...' : '',
    image: article.image_url || '/placeholder-card.jpg',
    image_url: article.image_url || '/placeholder-card.jpg',
    url: `/article/${article.slug}`,
    category: article.category || '정책'
  };
}

// Fetch function
async function fetchArticles(params: string = ''): Promise<Article[]> {
  try {
    const response = await fetch(`/api/articles${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ArticleResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch articles');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default function ArticlesLoader() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const allArticles = await fetchArticles('?limit=25&sortBy=created_at&sortOrder=desc');
        setArticles(allArticles);
        console.log('Loaded articles:', allArticles.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles');
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
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

  // Filter articles by category
  const allCategories = [...new Set(articles.map(a => a.category))];
  console.log('Available categories:', allCategories);
  
  const startupArticles = articles.filter(a => a.category === 'startup-support' || a.category === '창업지원');
  const housingArticles = articles.filter(a => a.category === 'housing-policy' || a.category === '주택정책');
  const employmentArticles = articles.filter(a => a.category === 'employment-support' || a.category === '취업지원');
  const educationArticles = articles.filter(a => a.category === 'education-policy' || a.category === '교육정책');
  const welfareArticles = articles.filter(a => a.category === 'welfare-benefits' || a.category === '복지혜택');
  const subsidyArticles = articles.filter(a => a.category === 'government-subsidies' || a.category === '정부지원금');
  const policyNewsArticles = articles.filter(a => a.category === 'policy-news' || a.category === '정책뉴스');

  // Use all articles if specific categories are empty
  const featuredArticles = articles.slice(0, 5);
  const popularArticles = articles.sort((a, b) => b.view_count - a.view_count).slice(0, 10);

  // Convert to display formats
  const slideItems = featuredArticles.map(article => convertArticleToSlideItem(article));
  const rankingNewsItems = popularArticles.map((article, index) => convertArticleToRankingItem(article, index + 1));
  const feedItems = (subsidyArticles.length > 0 ? subsidyArticles : articles).slice(0, 10).map(article => convertArticleToFeedItem(article));

  const convertToCardItems = (articlesList: Article[]) => articlesList.map(article => convertArticleToCardItem(article));

  // Use actual articles or fallback to all articles
  const startupCards = convertToCardItems(startupArticles.length > 0 ? startupArticles.slice(0, 12) : articles.slice(0, 12));
  const housingCards = convertToCardItems(housingArticles.length > 0 ? housingArticles.slice(0, 12) : articles.slice(0, 12));
  const employmentCards = convertToCardItems(employmentArticles.length > 0 ? employmentArticles.slice(0, 12) : articles.slice(0, 12));
  const educationCards = convertToCardItems(educationArticles.length > 0 ? educationArticles.slice(0, 12) : articles.slice(0, 12));
  const welfareCards = convertToCardItems(welfareArticles.length > 0 ? welfareArticles.slice(0, 12) : articles.slice(0, 12));
  const subsidyCards = convertToCardItems(subsidyArticles.length > 0 ? subsidyArticles.slice(0, 12) : articles.slice(0, 12));
  const policyNewsCards = convertToCardItems(policyNewsArticles.length > 0 ? policyNewsArticles.slice(0, 12) : articles.slice(0, 12));

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
          {/* 왼쪽 메인 콘텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 창업 지원 섹션 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                🚀 창업 지원
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (전체 {startupCards.length}개)
                </span>
              </h2>
              {startupCards.length > 0 ? (
                <SectionCardList cards={startupCards} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  창업 지원 정보를 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 취업 지원 섹션 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                💼 취업 지원
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (전체 {employmentCards.length}개)
                </span>
              </h2>
              {employmentCards.length > 0 ? (
                <SectionCardList cards={employmentCards} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  취업 지원 정보를 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 교육 정책 섹션 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                📚 교육 정책
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (전체 {educationCards.length}개)
                </span>
              </h2>
              {educationCards.length > 0 ? (
                <SectionCardList cards={educationCards} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  교육 정책 정보를 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 복지 혜택 섹션 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                🤝 복지 혜택
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (전체 {welfareCards.length}개)
                </span>
              </h2>
              {welfareCards.length > 0 ? (
                <SectionCardList cards={welfareCards} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  복지 혜택 정보를 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 주택 정책 슬라이더 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                🏠 주택 정책
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (전체 {housingCards.length}개)
                </span>
              </h2>
              {housingCards.length > 0 ? (
                <HorizontalCardSlider cards={housingCards} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  주택 정책 정보를 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 정부 지원금 슬라이더 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                💰 정부 지원금
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (전체 {subsidyCards.length}개)
                </span>
              </h2>
              {subsidyCards.length > 0 ? (
                <HorizontalCardSlider cards={subsidyCards} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  정부 지원금 정보를 불러오는 중입니다...
                </div>
              )}
            </section>
          </div>

          {/* 오른쪽 사이드바 */}
          <aside className="lg:col-span-1 space-y-6">
            {/* 인기 정책 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900">📰 인기 정책</h2>
              {rankingNewsItems.length > 0 ? (
                <RankingNews ranking={rankingNewsItems} />
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  인기 정책을 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 최신 지원금 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔥 최신 지원금</h2>
              {feedItems.length > 0 ? (
                <RealTimeFeed feed={feedItems} />
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  최신 지원금 정보를 불러오는 중입니다...
                </div>
              )}
            </section>

            {/* 인기 지원사업 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔍 인기 지원사업</h2>
              <KeywordTrends trends={keywordTrends} />
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}