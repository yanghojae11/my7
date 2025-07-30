'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { getPoliciesByCategory } from '@/lib/policies';
import { PolicyWithDetails } from '@/types/database';
import { formatDateKorean } from '@/utils/dateUtils';

interface CategorySectionProps {
  title: string;
  description?: string;
  categorySlug: string;
  icon?: string;
  limit?: number;
  className?: string;
}

export default function CategorySection({
  title,
  description,
  categorySlug,
  icon,
  limit = 4,
  className = ''
}: CategorySectionProps) {
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const data = await getPoliciesByCategory(categorySlug, limit);
        setPolicies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '정책을 불러오는데 실패했습니다');
        console.error(`Error loading policies for category ${categorySlug}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, [categorySlug, limit]);

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        <LoadingSkeleton type="cards" />
      </div>
    );
  }

  if (error || policies.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <section className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({policies.length}개)
          </span>
        </h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {policies.map((policy) => (
          <Link 
            key={policy.id} 
            href={`/policy/${policy.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
              {policy.featured_image_url && (
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={policy.featured_image_url}
                    alt={policy.image_alt || policy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {policy.title}
              </h3>
              
              {policy.summary && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {policy.summary}
                </p>
              )}
              
              <div className="space-y-2 text-xs text-gray-500">
                {policy.application_period_end && (
                  <div className="flex items-center">
                    <span className="font-medium">신청기한:</span>
                    <span className="ml-1">
                      {formatDateKorean(policy.application_period_end)}
                    </span>
                  </div>
                )}
                
                {policy.target_audience && policy.target_audience.length > 0 && (
                  <div className="flex items-start">
                    <span className="font-medium">대상:</span>
                    <span className="ml-1 line-clamp-1">
                      {policy.target_audience.join(', ')}
                    </span>
                  </div>
                )}
                
                {policy.support_amount && (
                  <div className="flex items-center">
                    <span className="font-medium">지원금액:</span>
                    <span className="ml-1 text-blue-600 font-semibold">
                      {policy.support_amount}
                    </span>
                  </div>
                )}
                
                {policy.agency?.name && (
                  <div className="flex items-center">
                    <span className="font-medium">담당기관:</span>
                    <span className="ml-1">{policy.agency.name}</span>
                  </div>
                )}
              </div>

              {policy.policy_type && (
                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    policy.policy_type === 'support' ? 'bg-green-100 text-green-700' :
                    policy.policy_type === 'benefit' ? 'bg-blue-100 text-blue-700' :
                    policy.policy_type === 'subsidy' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {policy.policy_type === 'support' ? '지원' :
                     policy.policy_type === 'benefit' ? '혜택' :
                     policy.policy_type === 'subsidy' ? '보조금' :
                     policy.policy_type === 'information' ? '정보' :
                     policy.policy_type === 'regulation' ? '규정' :
                     '공지'}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link 
          href={`/category/${categorySlug}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          더보기
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}