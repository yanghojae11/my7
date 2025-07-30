'use client';

import CategorySection from './CategorySection';

export default function StartupSupportSection() {
  return (
    <CategorySection
      title="창업 지원"
      description="정부에서 제공하는 창업 지원 프로그램과 사업 자금 지원 정보를 확인하세요."
      categorySlug="startup-support"
      icon="🚀"
      limit={4}
    />
  );
}