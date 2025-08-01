// src/app/category/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticlesByCategory } from '@/lib/articles';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { formatDateKorean } from '@/utils/dateUtils';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

const CATEGORY_INFO: Record<string, { title: string; description: string; icon: string }> = {
  'startup-support': {
    title: '창업 지원',
    description: '정부에서 제공하는 창업 지원 프로그램과 사업 자금 지원 정보를 확인하세요.',
    icon: '🚀'
  },
  'housing-policy': {
    title: '주택 정책',
    description: '주택 구매, 임대, 청년 주택 지원 등 주택 관련 정책 정보를 제공합니다.',
    icon: '🏠'
  },
  'employment-support': {
    title: '취업 지원',
    description: '취업 지원금, 직업 훈련, 구직 활동 지원 등 취업 관련 정책을 안내합니다.',
    icon: '💼'
  },
  'education-policy': {
    title: '교육 정책',
    description: '학자금 지원, 교육비 지원, 평생교육 등 교육 관련 정책 정보입니다.',
    icon: '📚'
  },
  'welfare-benefits': {
    title: '복지 혜택',
    description: '사회보장제도, 복지 급여, 생활 지원 등 복지 혜택 정보를 제공합니다.',
    icon: '🤝'
  },
  'government-subsidies': {
    title: '정부 지원금',
    description: '각종 정부 보조금, 지원금, 인센티브 정보를 한눈에 확인하세요.',
    icon: '💰'
  }
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryInfo = CATEGORY_INFO[params.slug];
  
  if (!categoryInfo) {
    return {
      title: '카테고리를 찾을 수 없음',
      description: '요청하신 카테고리를 찾을 수 없습니다.'
    };
  }

  return {
    title: `${categoryInfo.title} | MY7 정책지원`,
    description: categoryInfo.description,
    keywords: [categoryInfo.title, '정부정책', '지원사업', '정책뉴스'],
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const page = parseInt(searchParams.page || '1');
  const limit = 20;

  const categoryInfo = CATEGORY_INFO[slug];
  
  if (!categoryInfo) {
    notFound();
  }

  const articles = await getArticlesByCategory(slug, limit);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 카테고리 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{categoryInfo.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">{categoryInfo.title}</h1>
          </div>
          <p className="text-gray-600 text-lg">{categoryInfo.description}</p>
          <div className="mt-4 text-sm text-gray-500">
            총 {articles.length}개의 정책 정보가 있습니다.
          </div>
        </div>

        {/* 기사 목록 */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/article/${article.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-blue-300">
                  {article.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <OptimizedImage
                        src={Array.isArray(article.image_url) ? article.image_url[0] : article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    {article.body && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.body.substring(0, 150)}...
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
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

                    <div className="mt-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        정책뉴스
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryInfo.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              아직 {categoryInfo.title} 정보가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              새로운 정책 정보가 업데이트되면 이곳에 표시됩니다.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        )}

        {/* 더보기 버튼 (추후 페이지네이션으로 확장 가능) */}
        {articles.length >= limit && (
          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              더 많은 {categoryInfo.title} 정보 보기
            </button>
          </div>
        )}

        {/* 뒤로가기 버튼 */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}