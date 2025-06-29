// src/app/article/[slug]/page.tsx - 개선된 버전 (카테고리 라벨 통합)

import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';

// 컴포넌트
import ArticleReactionsClient from '@/components/ArticleReactionsClientWrapper';
import CommentsSectionClient from '@/components/CommentsSectionClientWrapper';
import ShareButtonClient from '@/components/ShareButtonClientWrapper';

// 메인페이지에서 가져온 카테고리 설정
import { CATEGORY_CONFIG } from '@/app/page';

// 타입 정의
interface Article {
  id: string;
  created_at: string;
  title: string;
  body: string | null;
  slug: string;
  image_url: string | string[] | null;
  source: string | null;
  original_url: string | null;
  crawled_at: string | null;
  author_id: string | null;
  raw_source: string | null;
}

interface ReactionCounts {
  likes: number;
  sads: number;
  angrys: number;
  surpriseds: number;
  uneasys: number;
}

interface Author {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// 이미지 URL 처리 (백엔드 구조 반영)
const getImageUrlForDisplay = (image_url: string | string[] | null): string => {
  if (!image_url) return '/placeholder-article-image.jpg';
  
  let finalUrl: string;
  
  if (Array.isArray(image_url) && image_url.length > 0) {
    finalUrl = image_url[0] || '/placeholder-article-image.jpg';
  } else if (typeof image_url === 'string' && image_url.length > 0) {
    finalUrl = image_url;
  } else {
    return '/placeholder-article-image.jpg';
  }
  
  // 이미지 URL이 배열 문자열 형태로 저장된 경우 처리
  if (typeof finalUrl === 'string' && finalUrl.startsWith('[') && finalUrl.endsWith(']')) {
    try {
      const parsed = JSON.parse(finalUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        finalUrl = parsed[0];
      }
    } catch (e) {
      console.error('Failed to parse image URL array:', e);
      return '/placeholder-article-image.jpg';
    }
  }
  
  // null, undefined, 빈 문자열 체크
  if (!finalUrl || finalUrl === 'null' || finalUrl === '[]') {
    return '/placeholder-article-image.jpg';
  }
  
  // Supabase 스토리지 URL이면 프록시 경로로 변환
  if (finalUrl.includes('supabase.co/storage/v1/object/public/')) {
    const path = finalUrl.split('supabase.co/storage/v1/object/public/')[1];
    return path ? `/supabase-images/${path}` : '/placeholder-article-image.jpg';
  }
  
  // 네이버 페이 이미지 URL 처리
  if (finalUrl.includes('naver-pay') || finalUrl.includes('story.pay.naver.com')) {
    return finalUrl;
  }
  
  // 네이트 이미지 URL 처리
  if (finalUrl.includes('news.nate.com')) {
    return finalUrl;
  }
  
  return finalUrl;
};

// 카테고리 정보 가져오기
const getCategoryInfo = (rawSource: string | null) => {
  if (!rawSource) return null;
  return CATEGORY_CONFIG[rawSource as keyof typeof CATEGORY_CONFIG] || null;
};

// 소스별 카테고리 이름 매핑
const getSourceDisplayName = (rawSource: string | null, source: string | null): string => {
  const categoryInfo = getCategoryInfo(rawSource);
  return categoryInfo?.shortName || source || '뉴스';
};

// 카테고리 라벨 컴포넌트
const CategoryLabel = ({ rawSource, source }: { rawSource: string | null; source: string | null }) => {
  const categoryInfo = getCategoryInfo(rawSource);
  
  if (!categoryInfo) {
    return (
      <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
        {source || '뉴스'}
      </span>
    );
  }

  return (
    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${categoryInfo.color}`}>
      {categoryInfo.icon} {categoryInfo.shortName} 속보
    </span>
  );
};

// 랜덤 기자 선택 함수
async function getRandomReporter(): Promise<Author | null> {
  try {
    const { data: reporters, error } = await supabase
      .from('reporters')
      .select('id, name, avatar_url');

    if (error) {
      console.error('Error fetching reporters:', error);
      return null;
    }

    if (!reporters || reporters.length === 0) {
      return null;
    }

    // 랜덤하게 기자 선택
    const randomIndex = Math.floor(Math.random() * reporters.length);
    const selectedReporter = reporters[randomIndex];
    return selectedReporter || null;
  } catch (error) {
    console.error('Error in getRandomReporter:', error);
    return null;
  }
}

// generateStaticParams - 빌드 시 정적 페이지 생성
export async function generateStaticParams() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug')
      .order('created_at', { ascending: false })
      .limit(100); // 최근 100개 기사만 사전 렌더링

    if (error) {
      console.error('Error fetching slugs for generateStaticParams:', error);
      return [];
    }

    const validSlugs = (data || [])
      .filter(item => typeof item.slug === 'string' && item.slug.length > 0)
      .map((item) => ({ slug: item.slug as string }));

    console.log(`Generated ${validSlugs.length} slugs for static params.`);
    return validSlugs;
  } catch (error) {
    console.error('generateStaticParams failed:', error);
    return [];
  }
}

// generateMetadata - SEO 최적화
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = params;
  
  if (typeof slug !== 'string' || !slug) {
    return {
      title: '유효하지 않은 기사',
      description: '요청하신 기사 슬러그가 유효하지 않습니다.',
    };
  }

  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('title, body, image_url, source, created_at, raw_source')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching metadata for slug "${slug}":`, error);
      return {
        title: '기사 로딩 오류',
        description: '기사 메타데이터를 가져오는 중 오류가 발생했습니다.',
      };
    }

    if (!article) {
      return {
        title: '기사를 찾을 수 없습니다',
        description: '요청하신 기사를 찾을 수 없습니다.',
      };
    }

    const displayImageUrl = getImageUrlForDisplay(article.image_url);
    const description = article.body 
      ? article.body.substring(0, 160) + (article.body.length > 160 ? '...' : '') 
      : article.title;
    const sourceName = getSourceDisplayName(article.raw_source, article.source);
    const publishDate = new Date(article.created_at).toISOString();

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bitsonic.co.kr';
    const articleUrl = `${SITE_URL}/article/${slug}`;

    return {
      title: `${article.title} | 코인 인사이트`,
      description,
      keywords: ['암호화폐', '코인', '뉴스', '비트코인', '이더리움', '경제', '부동산', sourceName],
      authors: [{ name: sourceName }],
      alternates: {
        canonical: articleUrl,
      },
      openGraph: {
        title: article.title,
        description,
        url: articleUrl,
        siteName: '코인 인사이트',
        images: displayImageUrl ? [{
          url: displayImageUrl.startsWith('http') ? displayImageUrl : `${SITE_URL}${displayImageUrl}`,
          width: 1200,
          height: 630,
          alt: article.title,
          type: 'image/webp',
        }] : [],
        type: 'article',
        locale: 'ko_KR',
        publishedTime: publishDate,
        authors: [sourceName],
        section: sourceName,
        tags: ['암호화폐', '코인', '뉴스', '경제', '부동산'],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description,
        images: displayImageUrl ? [displayImageUrl.startsWith('http') ? displayImageUrl : `${SITE_URL}${displayImageUrl}`] : [],
        creator: '@coininsight_kr',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error(`Metadata generation failed for slug "${slug}":`, error);
    return {
      title: '기사 메타데이터 오류',
      description: '기사 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

// 사이드바 데이터 가져오기 함수
async function getSidebarData() {
  try {
    const [rankingResult, feedResult] = await Promise.all([
      // 랭킹 뉴스 (네이트 TOP 데이터 우선)
      supabase
        .from('articles')
        .select('slug, title, image_url, raw_source')
        .eq('raw_source', 'nate-top10')
        .order('created_at', { ascending: false })
        .limit(7),
      
      // 실시간 피드 (최신 경제 뉴스)
      supabase
        .from('articles')
        .select('slug, title, image_url, source, created_at, raw_source')
        .eq('raw_source', 'naver-money')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    const ranking = (rankingResult.data || []).map((item, index) => ({
      ...item,
      rank: index + 1,
      image_url: getImageUrlForDisplay(item.image_url),
      url: `/article/${item.slug}`,
    }));

    const feed = (feedResult.data || []).map(item => ({
      ...item,
      image_url: getImageUrlForDisplay(item.image_url),
      url: `/article/${item.slug}`,
      categoryInfo: getCategoryInfo(item.raw_source),
    }));

    return { ranking, feed };
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    return { ranking: [], feed: [] };
  }
}

// 관련 기사 가져오기
async function getRelatedArticles(currentArticle: Article) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, image_url, raw_source, created_at')
      .eq('raw_source', currentArticle.raw_source)
      .neq('slug', currentArticle.slug)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      image_url: getImageUrlForDisplay(item.image_url),
      url: `/article/${item.slug}`,
      categoryInfo: getCategoryInfo(item.raw_source),
    }));
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

// 기사 페이지 컴포넌트
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;

  if (typeof slug !== 'string' || !slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="text-center text-red-500 text-2xl font-bold">
          유효하지 않은 아티클 슬러그입니다.
        </div>
      </div>
    );
  }

  try {
    // 병렬로 데이터 가져오기
    const [articleResult, sidebarData, randomReporter] = await Promise.all([
      supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle<Article>(),
      getSidebarData(),
      getRandomReporter(), // 모든 기사에 랜덤 기자 할당
    ]);

    const { data: article, error: articleError } = articleResult;

    if (articleError) {
      console.error(`Error fetching article for slug "${slug}":`, articleError);
    }

    if (!article) {
      return notFound();
    }

    // 관련 기사 가져오기
    const relatedArticles = await getRelatedArticles(article);

    // 랜덤 기자를 기본으로 사용, 기존 author_id가 있다면 해당 기자 정보도 가져와서 우선 사용
    let authorProfile: Author | null = randomReporter;
    if (article.author_id) {
      const { data: authorData, error: authorError } = await supabase
        .from('reporters')
        .select('id, name, avatar_url')
        .eq('id', article.author_id)
        .maybeSingle<Author>();

      if (authorError) {
        console.error(`Error fetching author profile for ID "${article.author_id}":`, authorError);
      }
      // 기존 작성자 정보가 있으면 그것을 사용, 없으면 랜덤 기자 사용
      authorProfile = authorData || randomReporter;
    }

    // 반응 카운트 가져오기
    const reactionTypes: Array<keyof ReactionCounts> = ['likes', 'sads', 'angrys', 'surpriseds', 'uneasys'];
    const initialReactions: ReactionCounts = { likes: 0, sads: 0, angrys: 0, surpriseds: 0, uneasys: 0 };

    const reactionPromises = reactionTypes.map(async (type) => {
      const { count, error } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', article.id)
        .eq('reaction_type', type);
      
      if (error) {
        console.error(`Error fetching reaction count for article ${article.id} and type ${type}:`, error);
        return 0;
      }
      return count || 0;
    });

    const reactionCounts = await Promise.all(reactionPromises);
    reactionTypes.forEach((type, index) => {
      initialReactions[type] = reactionCounts[index] || 0;
    });

    // 댓글 가져오기
    const { data: initialComments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', article.id)
      .order('created_at', { ascending: false });
    
    if (commentsError) {
      console.error(`Error fetching comments for article ${article.id}:`, commentsError);
    }

    // 거래소별 사용법 카테고리 여부 확인
    const isExchangeGuide = article.raw_source === 'exchange';

    // 본문 처리
    const processedBody = isExchangeGuide
      ? article.body || ''
      : article.body?.replace(/\n/g, '<br />') || '';
    const displayImageUrl = getImageUrlForDisplay(article.image_url);
    const sourceName = getSourceDisplayName(article.raw_source, article.source);
    const categoryInfo = getCategoryInfo(article.raw_source);

    // JSON-LD 구조화 데이터
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.body?.substring(0, 160) || article.title,
      image: displayImageUrl ? (displayImageUrl.startsWith('http') ? displayImageUrl : `${process.env.NEXT_PUBLIC_SITE_URL}${displayImageUrl}`) : undefined,
      datePublished: article.created_at,
      dateModified: article.crawled_at || article.created_at,
      author: {
        '@type': 'Organization',
        name: sourceName,
      },
      publisher: {
        '@type': 'Organization',
        name: '코인 인사이트',
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/article/${slug}`,
      },
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/article/${slug}`,
      articleSection: sourceName,
      keywords: ['암호화폐', '코인', '뉴스', '비트코인', '이더리움', '경제', '부동산'],
    };

    return (
      <>
        {/* JSON-LD 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <main className="bg-white py-10 px-4 md:px-0">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
            {/* 메인 기사 콘텐츠 */}
            <article className="prose prose-lg max-w-none">
              {/* 기사 헤더 */}
              <header className="mb-8">
                <div className="mb-4">
                  <CategoryLabel rawSource={article.raw_source} source={article.source} />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-6 gap-4">
                <div className="flex items-center space-x-2">
                    {authorProfile?.name && (
                      <>
                        <span className="font-medium text-gray-700">{authorProfile.name}</span>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    <time dateTime={article.created_at}>
                      {new Date(article.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShareButtonClient />
                  </div>
                </div>
              </header>

              {/* 기사 이미지 */}
              {displayImageUrl && (
                <figure className="mb-8">
                  <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                    <Image
                      src={displayImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 750px"
                      priority
                    />
                  </div>
                </figure>
              )}

              {/* 기사 본문 */}
              {isExchangeGuide ? (
                <section>
                  <h3>거래소별 사용법</h3>
                  <div
                    className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processedBody }}
                  />
                </section>
              ) : (
                <div
                  className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: processedBody }}
                />
              )}

              {/* 관련 기사 섹션 */}
              {relatedArticles.length > 0 && (
                <section className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    {categoryInfo?.icon} 관련 {categoryInfo?.shortName} 뉴스
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.slug}
                        href={related.url}
                        className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        {related.image_url && (
                          <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-md relative">
                            <Image
                              src={related.image_url}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                            {related.title}
                          </h4>
                          <time className="text-xs text-gray-500 mt-1 block">
                            {new Date(related.created_at).toLocaleDateString('ko-KR')}
                          </time>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* 기사 하단 섹션 */}
              <footer className="mt-12 pt-8 border-t border-gray-200 space-y-8">
                <Suspense fallback={<div className="animate-pulse h-16 bg-gray-200 rounded" />}>
                  <ArticleReactionsClient articleId={article.id} initialReactions={initialReactions} />
                </Suspense>

                <Suspense fallback={<div className="animate-pulse h-40 bg-gray-200 rounded" />}>
                  <CommentsSectionClient articleId={article.id} initialComments={initialComments || []} />
                </Suspense>
              </footer>

              {/* 목록 돌아가기 버튼 */}
              <div className="mt-12 text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  ← 홈으로 돌아가기
                </Link>
              </div>
            </article>

            {/* 사이드바 */}
            <aside className="space-y-8">
              {/* 랭킹 뉴스 */}
              {sidebarData.ranking.length > 0 && (
                <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-4 pb-2 border-b">🏆 랭킹 뉴스</h2>
                  <Suspense fallback={<div className="animate-pulse space-y-4">{Array.from({length: 7}).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded"></div>)}</div>}>
                    <ul className="space-y-4">
                      {sidebarData.ranking.map((item) => (
                        <li key={item.slug} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {item.rank}
                          </span>
                          <div className="flex items-start gap-3 flex-1">
                            {item.image_url && item.image_url !== '/placeholder-article-image.jpg' && (
                              <div className="w-14 h-10 flex-shrink-0 overflow-hidden rounded-md relative">
                                <Image
                                  src={item.image_url}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </div>
                            )}
                            <Link 
                              href={item.url} 
                              className="text-sm text-gray-800 hover:text-purple-600 hover:underline line-clamp-2 leading-relaxed"
                            >
                              {item.title}
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Suspense>
                </section>
              )}

              {/* 실시간 피드 */}
              {sidebarData.feed.length > 0 && (
                <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-4 pb-2 border-b">💰 경제 속보</h2>
                  <Suspense fallback={<div className="animate-pulse space-y-4">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}</div>}>
                    <ul className="space-y-4">
                      {sidebarData.feed.slice(0, 6).map((item) => (
                        <li key={item.slug} className="flex items-start gap-3">
                          {item.image_url && item.image_url !== '/placeholder-article-image.jpg' && (
                            <div className="w-14 h-10 flex-shrink-0 overflow-hidden rounded-md relative">
                              <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={item.url} 
                              className="text-sm text-gray-800 hover:text-green-600 hover:underline line-clamp-2 leading-relaxed block mb-1"
                            >
                              {item.title}
                            </Link>
                            <time className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleDateString('ko-KR')}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Suspense>
                </section>
              )}

              {/* 카테고리별 더보기 */}
              <section className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white text-center">
                <h3 className="text-lg font-bold mb-2">
                  {categoryInfo?.icon} 더 많은 {categoryInfo?.shortName || '뉴스'}
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  실시간으로 업데이트되는 최신 뉴스를 확인하세요
                </p>
                <Link 
                  href="/" 
                  className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  전체 뉴스 보기
                </Link>
              </section>
            </aside>
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error(`Article page error for slug "${slug}":`, error);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            기사를 불러오는 중 오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-6">
            잠시 후 다시 시도해 주세요
          </p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
}