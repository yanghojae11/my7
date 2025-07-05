import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, Heart, Building2 } from 'lucide-react';
import { PolicyArticle } from '@/types/database';
import TargetAudienceTags from './TargetAudienceTags';

interface ArticleCardProps {
  title?: string;
  summary?: string;
  url?: string;
  policy?: PolicyArticle;
  showKeyPointsPreview?: boolean;
}

const policyTypeLabels = {
  information: '정보',
  support: '지원',
  benefit: '혜택',
  subsidy: '보조금',
  regulation: '규제',
  announcement: '공지'
} as const;

const policyTypeColors = {
  information: 'bg-blue-100 text-blue-800',
  support: 'bg-green-100 text-green-800',
  benefit: 'bg-purple-100 text-purple-800',
  subsidy: 'bg-orange-100 text-orange-800',
  regulation: 'bg-red-100 text-red-800',
  announcement: 'bg-gray-100 text-gray-800'
} as const;

export default function ArticleCard({ 
  title, 
  summary, 
  url, 
  policy,
  showKeyPointsPreview = true 
}: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);

  // Legacy support for basic title/summary/url props
  if (!policy && title && summary && url) {
    return (
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3">
          {summary}
        </p>
        <Link
          href={url}
          target="_blank"
          className="inline-block mt-4 text-blue-600 font-medium hover:underline text-sm"
        >
          Read More →
        </Link>
      </div>
    );
  }

  if (!policy) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const keyPointImage = policy.additional_images?.[0];
  const hasKeyPointsImages = policy.additional_images && policy.additional_images.length > 0;

  return (
    <Link href={`/policy/${policy.slug}`}>
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
        {/* 키 포인트 이미지 미리보기 */}
        {showKeyPointsPreview && hasKeyPointsImages && keyPointImage && !imageError && (
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <Image
              src={keyPointImage}
              alt={`${policy.title} 핵심 포인트`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* 이미지 개수 표시 */}
            {policy.additional_images && policy.additional_images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                +{policy.additional_images.length - 1} 더보기
              </div>
            )}

            {/* 정책 유형 뱃지 */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${policyTypeColors[policy.policy_type]}`}>
                {policyTypeLabels[policy.policy_type]}
              </span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* 카테고리 및 태그 (이미지가 없는 경우만) */}
          {(!showKeyPointsPreview || !hasKeyPointsImages) && (
            <div className="flex items-center gap-2 mb-3">
              {policy.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {policy.category.icon && <span className="mr-1">{policy.category.icon}</span>}
                  {policy.category.name}
                </span>
              )}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${policyTypeColors[policy.policy_type]}`}>
                {policyTypeLabels[policy.policy_type]}
              </span>
            </div>
          )}

          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {policy.title}
          </h3>

          {/* 요약 */}
          {policy.summary && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
              {policy.summary}
            </p>
          )}

          {/* 대상 태그 */}
          {policy.target_audience && policy.target_audience.length > 0 && (
            <div className="mb-4">
              <TargetAudienceTags audiences={policy.target_audience} size="sm" />
            </div>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {policy.agency && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-20">{policy.agency.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(policy.created_at)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{policy.view_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{policy.like_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
