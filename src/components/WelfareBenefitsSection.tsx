'use client';

import CategorySection from './CategorySection';

export default function WelfareBenefitsSection() {
  return (
    <CategorySection
      title="복지 혜택"
      description="사회보장 혜택, 복지 프로그램, 사회 지원 정책을 확인하세요."
      categorySlug="welfare-benefits"
      icon="🤝"
      limit={4}
    />
  );
}