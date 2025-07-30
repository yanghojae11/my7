'use client';

import StartupSupportSection from './StartupSupportSection';
import HousingPolicySection from './HousingPolicySection';
import EmploymentSupportSection from './EmploymentSupportSection';
import EducationPolicySection from './EducationPolicySection';
import WelfareBenefitsSection from './WelfareBenefitsSection';

export default function HomeCategorySections() {
  return (
    <div className="space-y-6">
      {/* 창업 지원 섹션 */}
      <StartupSupportSection />
      
      {/* 주택 정책 섹션 */}
      <HousingPolicySection />
      
      {/* 취업 지원 섹션 */}
      <EmploymentSupportSection />
      
      {/* 교육 정책 섹션 */}
      <EducationPolicySection />
      
      {/* 복지 혜택 섹션 */}
      <WelfareBenefitsSection />
    </div>
  );
}