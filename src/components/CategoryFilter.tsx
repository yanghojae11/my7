'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TargetAudienceFilter } from './TargetAudienceTags';

export const CATEGORY_CONFIG = {
  'startup-support': {
    id: 1,
    displayName: '🚀 창업 지원',
    shortName: '창업지원',
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-200',
    icon: '🚀'
  },
  'housing-policy': {
    id: 2,
    displayName: '🏠 주택 정책',
    shortName: '주택정책',
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200',
    icon: '🏠'
  },
  'employment-support': {
    id: 3,
    displayName: '💼 취업 지원',
    shortName: '취업지원',
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-200',
    icon: '💼'
  },
  'education-policy': {
    id: 4,
    displayName: '📚 교육 정책',
    shortName: '교육정책',
    color: 'bg-indigo-100 text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: '📚'
  },
  'welfare-benefits': {
    id: 5,
    displayName: '🤝 복지 혜택',
    shortName: '복지혜택',
    color: 'bg-pink-100 text-pink-700',
    borderColor: 'border-pink-200',
    icon: '🤝'
  },
  'government-subsidies': {
    id: 6,
    displayName: '💰 정부 지원금',
    shortName: '지원금',
    color: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: '💰'
  },
  'policy-news': {
    id: 7,
    displayName: '📰 정책 뉴스',
    shortName: '정책뉴스',
    color: 'bg-red-100 text-red-700',
    borderColor: 'border-red-200',
    icon: '📰'
  },
} as const;

const POLICY_TYPES = {
  'information': '정보',
  'support': '지원',
  'benefit': '혜택',
  'subsidy': '보조금',
  'regulation': '규제',
  'announcement': '공지'
} as const;

export interface FilterState {
  query: string;
  selectedCategories: string[];
  selectedAudiences: string[];
  selectedPolicyTypes: string[];
  sortBy: 'latest' | 'popular' | 'views';
}

interface CategoryFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultsCount?: number;
  isLoading?: boolean;
}

export default function CategoryFilter({ 
  filters, 
  onFiltersChange, 
  resultsCount,
  isLoading = false 
}: CategoryFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleQueryChange = (query: string) => {
    onFiltersChange({ ...filters, query });
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = filters.selectedCategories.includes(categorySlug)
      ? filters.selectedCategories.filter(c => c !== categorySlug)
      : [...filters.selectedCategories, categorySlug];
    onFiltersChange({ ...filters, selectedCategories: newCategories });
  };

  const handleAudienceChange = (audiences: string[]) => {
    onFiltersChange({ ...filters, selectedAudiences: audiences });
  };

  const handlePolicyTypeToggle = (policyType: string) => {
    const newTypes = filters.selectedPolicyTypes.includes(policyType)
      ? filters.selectedPolicyTypes.filter(t => t !== policyType)
      : [...filters.selectedPolicyTypes, policyType];
    onFiltersChange({ ...filters, selectedPolicyTypes: newTypes });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      selectedCategories: [],
      selectedAudiences: [],
      selectedPolicyTypes: [],
      sortBy: 'latest'
    });
  };

  const hasActiveFilters = 
    filters.query ||
    filters.selectedCategories.length > 0 ||
    filters.selectedAudiences.length > 0 ||
    filters.selectedPolicyTypes.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 검색 바 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="정책명, 키워드 검색..."
              value={filters.query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isFilterOpen
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* 결과 카운트 */}
        {resultsCount !== undefined && (
          <div className="mt-3 text-sm text-gray-600">
            {isLoading ? (
              <span className="text-gray-400">검색 중...</span>
            ) : (
              <span>총 <strong>{resultsCount.toLocaleString()}</strong>개 정책</span>
            )}
          </div>
        )}
      </div>

      {/* 필터 패널 */}
      {isFilterOpen && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-6">
            {/* 카테고리 필터 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">카테고리</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(CATEGORY_CONFIG).map(([slug, config]) => {
                  const isSelected = filters.selectedCategories.includes(slug);
                  return (
                    <button
                      key={slug}
                      onClick={() => handleCategoryToggle(slug)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? `${config.color} ${config.borderColor} ring-2 ring-offset-1 ring-current`
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.shortName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 대상 필터 */}
            <TargetAudienceFilter
              selectedAudiences={filters.selectedAudiences}
              onAudienceChange={handleAudienceChange}
            />

            {/* 정책 유형 필터 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">정책 유형</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(POLICY_TYPES).map(([type, label]) => {
                  const isSelected = filters.selectedPolicyTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handlePolicyTypeToggle(type)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">정렬</h4>
              <div className="flex gap-2">
                {[
                  { value: 'latest', label: '최신순' },
                  { value: 'popular', label: '인기순' },
                  { value: 'views', label: '조회순' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleSortChange(value as FilterState['sortBy'])}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      filters.sortBy === value
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 필터 초기화 */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                  모든 필터 초기화
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="p-4 flex flex-wrap gap-2">
          {filters.selectedCategories.map(category => {
            const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
            return (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.borderColor} border`}
              >
                <span>{config.icon}</span>
                <span>{config.shortName}</span>
                <X className="w-3 h-3" />
              </button>
            );
          })}

          {filters.selectedAudiences.map(audience => (
            <button
              key={audience}
              onClick={() => handleAudienceChange(filters.selectedAudiences.filter(a => a !== audience))}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
            >
              <span>{audience}</span>
              <X className="w-3 h-3" />
            </button>
          ))}

          {filters.selectedPolicyTypes.map(type => (
            <button
              key={type}
              onClick={() => handlePolicyTypeToggle(type)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
            >
              <span>{POLICY_TYPES[type as keyof typeof POLICY_TYPES]}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}