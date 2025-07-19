import { Suspense } from 'react';
import { Metadata } from 'next';
import PolicyListClient from './PolicyListClient';

export const metadata: Metadata = {
  title: '정책 검색 - MY7 정책지원',
  description: '창업지원, 주택정책, 취업지원, 교육정책, 복지혜택, 정부지원금 등 모든 정책을 한눈에 검색하고 비교해보세요.',
  keywords: ['정책검색', '정부지원', '창업지원', '주택정책', '취업지원', '교육정책', '복지혜택', '정부지원금'],
  openGraph: {
    title: '정책 검색 - MY7 정책지원',
    description: '창업지원, 주택정책, 취업지원, 교육정책, 복지혜택, 정부지원금 등 모든 정책을 한눈에 검색하고 비교해보세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '정책 검색 - MY7 정책지원',
    description: '창업지원, 주택정책, 취업지원, 교육정책, 복지혜택, 정부지원금 등 모든 정책을 한눈에 검색하고 비교해보세요.',
  },
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            정책 검색
          </h1>
          <p className="text-gray-600">
            원하는 정책을 찾아보세요. 카테고리, 대상, 정책유형별로 필터링할 수 있습니다.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12">정책 목록을 불러오는 중...</div>}>
          <PolicyListClient />
        </Suspense>
      </div>
    </div>
  );
}