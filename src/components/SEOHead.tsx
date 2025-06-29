// src/components/SEOHead.tsx - SEO 헤드 컴포넌트
import Head from 'next/head';
import { SITE_CONFIG } from '@/config';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description = SITE_CONFIG.description,
  keywords = SITE_CONFIG.keywords,
  image = SITE_CONFIG.ogImage,
  url = SITE_CONFIG.url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'NewsArticle' : 'WebSite',
    name: SITE_CONFIG.name,
    url: fullUrl,
    description,
    image: fullImageUrl,
    ...(type === 'article' && {
      headline: title,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        '@type': 'Organization',
        name: author || SITE_CONFIG.name,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
        },
      },
    }),
  };

  return (
    <Head>
      {/* 기본 메타 태그 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={fullUrl} />

      {/* 로봇 지시문 */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || SITE_CONFIG.name} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content="ko_KR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || SITE_CONFIG.name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content={SITE_CONFIG.twitter} />

      {/* 추가 메타 태그 */}
      <meta name="theme-color" content="#1d4ed8" />
      <meta name="format-detection" content="telephone=no" />

      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}