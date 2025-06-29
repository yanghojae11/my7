// src/config/index.ts - 전역 설정 파일

export const SITE_CONFIG = {
  name: 'MY7 정책지원',
  description: '정부 정책 및 지원사업 종합 정보 플랫폼',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://my7.co.kr',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  ogImage: '/og-image.png',
  twitterImage: '/twitter-image.png',
  twitter: '@my7_policy',
  keywords: [
    '정부정책',
    '지원사업',
    '창업지원',
    '주택정책',
    '취업지원',
    '교육정책',
    '복지혜택',
    '정부지원금',
    '정책뉴스',
    '보조금'
  ],
} as const;

export const API_CONFIG = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  revalidate: {
    homepage: 1800, // 30분
    article: 3600,  // 1시간
    sitemap: 86400, // 24시간
  },
} as const;

export const UI_CONFIG = {
  pagination: {
    articlesPerPage: 12,
    maxPages: 50,
  },
  limits: {
    mainSlider: 5,
    rankingNews: 7,
    realTimeFeed: 8,
    sectionCards: 6,
    sidebarItems: 6,
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export const SOURCE_CONFIG = {
  'startup-support': {
    displayName: '창업 지원',
    icon: '🚀',
    color: 'purple',
    category: 'startup',
  },
  'housing-policy': {
    displayName: '주택 정책',
    icon: '🏠',
    color: 'blue',
    category: 'housing',
  },
  'employment-support': {
    displayName: '취업 지원',
    icon: '💼',
    color: 'green',
    category: 'employment',
  },
  'education-policy': {
    displayName: '교육 정책',
    icon: '📚',
    color: 'indigo',
    category: 'education',
  },
  'welfare-benefits': {
    displayName: '복지 혜택',
    icon: '🤝',
    color: 'pink',
    category: 'welfare',
  },
  'gov-subsidy': {
    displayName: '정부 지원금',
    icon: '💰',
    color: 'yellow',
    category: 'subsidy',
  },
  'policy-news': {
    displayName: '정책 뉴스',
    icon: '📰',
    color: 'red',
    category: 'news',
  },
} as const;

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/my7_policy',
  telegram: 'https://t.me/my7_policy',
  youtube: 'https://youtube.com/@my7policy',
  email: 'contact@my7.co.kr',
} as const;

// 타입 헬퍼
export type SourceType = keyof typeof SOURCE_CONFIG;
export type CategoryType = (typeof SOURCE_CONFIG)[SourceType]['category'];