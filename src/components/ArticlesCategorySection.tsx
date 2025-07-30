'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { getArticlesByCategory, Article } from '@/lib/articles';
import { getArticleImageUrl } from '@/utils/imageUtils';

interface ArticlesCategorySectionProps {
  title: string;
  description?: string;
  categorySlug: string;
  icon?: string;
  limit?: number;
  className?: string;
}

export default function ArticlesCategorySection({
  title,
  description,
  categorySlug,
  icon,
  limit = 4,
  className = ''
}: ArticlesCategorySectionProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Loading articles for category: ${categorySlug}`);
        const data = await getArticlesByCategory(categorySlug, limit);
        console.log(`📊 Found ${data.length} articles for ${categorySlug}`);
        
        setArticles(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '기사를 불러오는데 실패했습니다';
        setError(errorMessage);
        console.error(`❌ Error loading articles for category ${categorySlug}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [categorySlug, limit]);

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        <LoadingSkeleton type="cards" />
      </div>
    );
  }

  if (error || articles.length === 0) {
    // Show a minimal message for debugging but don't render the full section
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`bg-yellow-50 p-4 rounded-lg border border-yellow-200 ${className}`}>
          <p className="text-yellow-800 text-sm">
            🔍 {title}: {error || `${categorySlug} 카테고리에 데이터가 없습니다`}
          </p>
        </div>
      );
    }
    return null; // Don't show empty sections in production
  }

  return (
    <section className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({articles.length}개)
          </span>
        </h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {articles.map((article) => (
          <Link 
            key={article.id} 
            href={`/article/${article.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
              {article.image_url && (
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={getArticleImageUrl(article.image_url)}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              
              {article.body && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {article.body.length > 100 ? article.body.substring(0, 100) + '...' : article.body}
                </p>
              )}
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="font-medium">게시일:</span>
                  <span className="ml-1">
                    {new Date(article.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                
                {article.view_count > 0 && (
                  <div className="flex items-center">
                    <span className="font-medium">조회수:</span>
                    <span className="ml-1">{article.view_count.toLocaleString()}회</span>
                  </div>
                )}
                
                {article.keywords && article.keywords.length > 0 && (
                  <div className="flex items-start">
                    <span className="font-medium">키워드:</span>
                    <span className="ml-1 line-clamp-1">
                      {article.keywords.slice(0, 3).join(', ')}
                    </span>
                  </div>
                )}
                
                {article.original_url && (
                  <div className="flex items-center">
                    <span className="font-medium">출처:</span>
                    <span className="ml-1 truncate">정부 공식 사이트</span>
                  </div>
                )}
              </div>

              {article.category && (
                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    article.category.includes('startup') || article.category.includes('창업') ? 'bg-purple-100 text-purple-700' :
                    article.category.includes('housing') || article.category.includes('주택') ? 'bg-blue-100 text-blue-700' :
                    article.category.includes('employment') || article.category.includes('취업') ? 'bg-green-100 text-green-700' :
                    article.category.includes('education') || article.category.includes('교육') ? 'bg-indigo-100 text-indigo-700' :
                    article.category.includes('welfare') || article.category.includes('복지') ? 'bg-pink-100 text-pink-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {article.category}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link 
          href={`/category/${categorySlug}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          더보기
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}