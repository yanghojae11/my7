'use client';

import CategorySection from './CategorySection';

export default function HousingPolicySection() {
  return (
    <CategorySection
      title="주택 정책"
      description="주택 구매 지원, 임대 지원, 부동산 정책 정보를 한눈에 확인하세요."
      categorySlug="housing-policy"
      icon="🏠"
      limit={4}
    />
  );
}