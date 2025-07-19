// src/app/page.tsx - Client-side article loading

import ArticlesLoader from '@/components/ArticlesLoader';

// ISR 설정 - 정책 업데이트 주기에 맞춰 조정
export const revalidate = 900; // 15분마다 재생성

// 정적 생성을 위한 메타데이터 설정
export const metadata = {
  title: 'MY7 정책지원 - 정부 정책 및 지원사업 종합 정보',
  description: '창업지원, 주택정책, 취업지원, 교육정책, 복지혜택, 정부지원금 등 모든 정책을 한눈에 확인하세요.',
  keywords: ['정부정책', '지원사업', '창업지원', '주택정책', '취업지원', '교육정책', '복지혜택', '정부지원금'],
  openGraph: {
    title: 'MY7 정책지원 - 정부 정책 및 지원사업 종합 정보',
    description: '창업지원, 주택정책, 취업지원, 교육정책, 복지혜택, 정부지원금 등 모든 정책을 한눈에 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};


export default function Home() {
  return <ArticlesLoader />;
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