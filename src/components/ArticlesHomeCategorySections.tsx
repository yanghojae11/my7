'use client';

import ArticlesCategorySection from './ArticlesCategorySection';

export default function ArticlesHomeCategorySections() {
  return (
    <div className="space-y-6">
      {/* 창업 지원 섹션 */}
      <ArticlesCategorySection
        title="창업 지원"
        description="정부에서 제공하는 창업 지원 프로그램과 사업 자금 지원 정보를 확인하세요."
        categorySlug="startup-support"
        icon="🚀"
        limit={4}
      />
      
      {/* 주택 정책 섹션 */}
      <ArticlesCategorySection
        title="주택 정책"
        description="주택 구매, 전세자금, 주거복지 등 주택 관련 정책 정보를 제공합니다."
        categorySlug="housing-policy"
        icon="🏠"
        limit={4}
      />
      
      {/* 취업 지원 섹션 */}
      <ArticlesCategorySection
        title="취업 지원"
        description="취업 준비생과 구직자를 위한 다양한 정부 취업 지원 프로그램을 안내합니다."
        categorySlug="employment-support"
        icon="💼"
        limit={4}
      />
      
      {/* 교육 정책 섹션 */}
      <ArticlesCategorySection
        title="교육 정책"
        description="교육비 지원, 장학금, 평생교육 등 교육 관련 정책을 확인하세요."
        categorySlug="education-policy"
        icon="📚"
        limit={4}
      />
      
      {/* 복지 혜택 섹션 */}
      <ArticlesCategorySection
        title="복지 혜택"
        description="국가 복지제도와 사회보장 혜택에 대한 정보를 제공합니다."
        categorySlug="welfare-benefits"
        icon="🤝"
        limit={4}
      />

      {/* 정부 지원금 섹션 */}
      <ArticlesCategorySection
        title="정부 지원금"
        description="각종 정부 지원금과 보조금 정보를 확인하세요."
        categorySlug="government-subsidies"
        icon="💰"
        limit={4}
      />
    </div>
  );
}