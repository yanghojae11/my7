'use client';

import CategorySection from './CategorySection';

export default function EducationPolicySection() {
  return (
    <CategorySection
      title="교육 정책"
      description="교육 자금 지원, 장학금, 교육 지원 프로그램 정보를 확인하세요."
      categorySlug="education-policy"
      icon="📚"
      limit={4}
    />
  );
}