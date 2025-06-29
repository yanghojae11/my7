// next-sitemap.config.js - 사이트맵 자동 생성 설정 (수정됨)
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://bitsonic.co.kr',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // 단순한 구조로 변경
  
  // 사이트맵 설정
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  
  // 제외할 경로
  exclude: [
    '/api/*',
    '/admin/*',
    '/404',
    '/500',
    '/_next/*',
    '/sitemap.xml', // 무한 루프 방지
    '/sitemap-*.xml',
    '/server-sitemap-index.xml',
  ],
  
  // 추가 경로 설정
  additionalPaths: async (config) => {
    const result = [];
    
    // 주요 페이지들 추가
    const staticPages = [
      {
        loc: '/',
        priority: 1.0,
        changefreq: 'hourly',
      },
      {
        loc: '/about',
        priority: 0.8,
        changefreq: 'monthly',
      },
      {
        loc: '/contact',
        priority: 0.6,
        changefreq: 'monthly',
      },
      {
        loc: '/privacy',
        priority: 0.3,
        changefreq: 'yearly',
      },
      {
        loc: '/terms',
        priority: 0.3,
        changefreq: 'yearly',
      },
    ];
    
    staticPages.forEach((page) => {
      result.push({
        loc: page.loc,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString(),
      });
    });
    
    return result;
  },
  
  // robots.txt 설정 (서버 사이트맵 참조 제거)
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/404',
          '/500',
        ],
      },
    ],
    // additionalSitemaps 제거 - 충돌 방지
  },
  
  // transform 함수 개선
  transform: async (config, path) => {
    // 기사 페이지는 더 높은 우선순위 설정
    if (path.startsWith('/article/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }
    
    // 메인 페이지
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'hourly',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }
    
    // 기본 설정
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};