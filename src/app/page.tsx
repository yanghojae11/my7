// src/app/page.tsx - 새로운 정책 데이터베이스 구조 사용

import { Suspense } from 'react';
import { 
  getLatestPolicies, 
  getPoliciesByCategory, 
  getPopularPolicies, 
  getPolicyCategories,
  getCategoryStats 
} from '@/lib/policies';
import MainPickSlider from "@/components/MainPickSliderWrapper";
import RankingNews from "@/components/RankingNews";
import RealTimeFeed from "@/components/RealTimeFeedWrapper";
import SectionCardList from "@/components/SectionCardListWrapper";
import HorizontalCardSlider from "@/components/HorizontalCardSliderWrapper";
import KeywordTrends from "@/components/KeywordTrends";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { 
  convertPolicyToSlideItem, 
  convertPolicyToRankingItem, 
  convertPolicyToFeedItem, 
  convertPolicyToCardItem,
  SlideItem, 
  RankingItem, 
  FeedItem, 
  CardItem, 
  TrendItem 
} from "@/types/article";

// ISR 설정 - 정책 업데이트 주기에 맞춰 조정
export const revalidate = 1800; // 30분마다 재생성

// 이미지 URL 처리 함수
const getImageUrlForDisplay = (imageUrl: string | null): string => {
  if (!imageUrl) return '/placeholder-card.jpg';
  
  // Supabase 스토리지 URL이면 그대로 사용
  if (imageUrl.includes('supabase.co/storage/v1/object/public/')) {
    return imageUrl;
  }
  
  // 상대 경로나 다른 URL은 그대로 사용
  return imageUrl;
};

export default async function Home() {
  try {
    // 병렬로 모든 데이터 가져오기
    const [
      featuredPolicies,
      startupPolicies,
      housingPolicies,
      employmentPolicies,
      educationPolicies,
      welfarePolicies,
      subsidyPolicies,
      popularPolicies,
      categories
    ] = await Promise.all([
      // 메인 슬라이더용 - 최신 정책 5개
      getLatestPolicies(5),
      
      // 창업 지원 정책
      getPoliciesByCategory('startup-support', 12),
      
      // 주택 정책
      getPoliciesByCategory('housing-policy', 12),
      
      // 취업 지원 정책
      getPoliciesByCategory('employment-support', 12),
      
      // 교육 정책
      getPoliciesByCategory('education-policy', 12),
      
      // 복지 혜택
      getPoliciesByCategory('welfare-benefits', 12),
      
      // 정부 지원금
      getPoliciesByCategory('government-subsidies', 12),
      
      // 인기 정책 (조회수 기준)
      getPopularPolicies(10),
      
      // 카테고리 목록
      getPolicyCategories()
    ]);

    // 슬라이더 아이템 변환
    const slideItems: SlideItem[] = featuredPolicies.map(policy => 
      convertPolicyToSlideItem(policy)
    );

    // 인기 정책 랭킹 변환
    const rankingNewsItems: RankingItem[] = popularPolicies.map((policy, index) => 
      convertPolicyToRankingItem(policy, index + 1)
    );

    // 최신 지원금을 실시간 피드로 사용
    const feedItems: FeedItem[] = subsidyPolicies.slice(0, 10).map(policy => 
      convertPolicyToFeedItem(policy)
    );

    // 카드 리스트 변환 함수
    const convertToCardItems = (policies: typeof startupPolicies): CardItem[] => 
      policies.map(policy => convertPolicyToCardItem(policy));

    const startupCards = convertToCardItems(startupPolicies);
    const housingCards = convertToCardItems(housingPolicies);
    const employmentCards = convertToCardItems(employmentPolicies);
    const educationCards = convertToCardItems(educationPolicies);
    const welfareCards = convertToCardItems(welfarePolicies);
    const subsidyCards = convertToCardItems(subsidyPolicies);

    // 정부 정책 트렌드 키워드 (실제로는 DB에서 가져오거나 분석 가능)
    const keywordTrends: TrendItem[] = [
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
            <Suspense fallback={<LoadingSkeleton type="slider" />}>
              {slideItems.length > 0 ? (
                <MainPickSlider items={slideItems} />
              ) : (
                <div className="p-6 text-center text-gray-500 bg-gray-100 rounded-xl">
                  주요 정책을 불러오는 중입니다...
                </div>
              )}
            </Suspense>
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
                <Suspense fallback={<LoadingSkeleton type="cards" />}>
                  {startupCards.length > 0 ? (
                    <SectionCardList cards={startupCards} />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      창업 지원 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 취업 지원 섹션 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                  💼 취업 지원
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (전체 {employmentCards.length}개)
                  </span>
                </h2>
                <Suspense fallback={<LoadingSkeleton type="cards" />}>
                  {employmentCards.length > 0 ? (
                    <SectionCardList cards={employmentCards} />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      취업 지원 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 교육 정책 섹션 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                  📚 교육 정책
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (전체 {educationCards.length}개)
                  </span>
                </h2>
                <Suspense fallback={<LoadingSkeleton type="cards" />}>
                  {educationCards.length > 0 ? (
                    <SectionCardList cards={educationCards} />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      교육 정책 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 복지 혜택 섹션 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                  🤝 복지 혜택
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (전체 {welfareCards.length}개)
                  </span>
                </h2>
                <Suspense fallback={<LoadingSkeleton type="cards" />}>
                  {welfareCards.length > 0 ? (
                    <SectionCardList cards={welfareCards} />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      복지 혜택 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 주택 정책 슬라이더 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                  🏠 주택 정책
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (전체 {housingCards.length}개)
                  </span>
                </h2>
                <Suspense fallback={<LoadingSkeleton type="cards" />}>
                  {housingCards.length > 0 ? (
                    <HorizontalCardSlider cards={housingCards} />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      주택 정책 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 정부 지원금 슬라이더 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
                  💰 정부 지원금
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (전체 {subsidyCards.length}개)
                  </span>
                </h2>
                <Suspense fallback={<LoadingSkeleton type="cards" />}>
                  {subsidyCards.length > 0 ? (
                    <HorizontalCardSlider cards={subsidyCards} />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      정부 지원금 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>
            </div>

            {/* 오른쪽 사이드바 */}
            <aside className="lg:col-span-1 space-y-6">
              {/* 인기 정책 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">📰 인기 정책</h2>
                <Suspense fallback={<LoadingSkeleton type="ranking" />}>
                  {rankingNewsItems.length > 0 ? (
                    <RankingNews ranking={rankingNewsItems} />
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      인기 정책을 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 최신 지원금 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔥 최신 지원금</h2>
                <Suspense fallback={<LoadingSkeleton type="feed" />}>
                  {feedItems.length > 0 ? (
                    <RealTimeFeed feed={feedItems} />
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      최신 지원금 정보를 불러오는 중입니다...
                    </div>
                  )}
                </Suspense>
              </section>

              {/* 인기 지원사업 */}
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">🔍 인기 지원사업</h2>
                <Suspense fallback={<LoadingSkeleton type="keywords" />}>
                  <KeywordTrends trends={keywordTrends} />
                </Suspense>
              </section>
            </aside>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Homepage data loading error:', error);
    
    // 에러 발생 시 기본 페이지 렌더링
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            정책 정보를 불러오는 중 문제가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-6">
            잠시 후 다시 시도해 주세요
          </p>
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
}

// 카테고리 설정 (컴포넌트에서 사용할 수 있도록 export)
export const CATEGORY_CONFIG = {
  'startup-support': {
    displayName: '🚀 창업 지원',
    shortName: '창업지원',
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-200',
    icon: '🚀'
  },
  'housing-policy': {
    displayName: '🏠 주택 정책',
    shortName: '주택정책',
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200',
    icon: '🏠'
  },
  'employment-support': {
    displayName: '💼 취업 지원',
    shortName: '취업지원',
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-200',
    icon: '💼'
  },
  'education-policy': {
    displayName: '📚 교육 정책',
    shortName: '교육정책',
    color: 'bg-indigo-100 text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: '📚'
  },
  'welfare-benefits': {
    displayName: '🤝 복지 혜택',
    shortName: '복지혜택',
    color: 'bg-pink-100 text-pink-700',
    borderColor: 'border-pink-200',
    icon: '🤝'
  },
  'government-subsidies': {
    displayName: '💰 정부 지원금',
    shortName: '지원금',
    color: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: '💰'
  },
  'policy-news': {
    displayName: '📰 정책 뉴스',
    shortName: '정책뉴스',
    color: 'bg-red-100 text-red-700',
    borderColor: 'border-red-200',
    icon: '📰'
  },
};