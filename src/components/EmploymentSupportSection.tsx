'use client';

import CategorySection from './CategorySection';

export default function EmploymentSupportSection() {
  return (
    <CategorySection
      title="취업 지원"
      description="직업 훈련 프로그램, 청년 고용 지원, 경력 개발 정책을 확인하세요."
      categorySlug="employment-support"
      icon="💼"
      limit={4}
    />
  );
}