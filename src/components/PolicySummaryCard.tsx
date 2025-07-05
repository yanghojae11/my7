'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Building2, Eye, Heart, ChevronRight, Share2 } from 'lucide-react';
import { PolicyArticle } from '@/types/database';
import TargetAudienceTags from './TargetAudienceTags';

interface PolicySummaryCardProps {
  policy: PolicyArticle;
  showImages?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
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

export default function PolicySummaryCard({ 
  policy, 
  showImages = true, 
  variant = 'default',
  className = '' 
}: PolicySummaryCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: policy.title,
          text: policy.summary || policy.meta_description || '',
          url: `/article/${policy.slug}`
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/article/${policy.slug}`);
    }
  };

  if (variant === 'compact') {
    return (
      <Link 
        href={`/article/${policy.slug}`}
        className={`block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow duration-200 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${policyTypeColors[policy.policy_type]}`}>
                {policyTypeLabels[policy.policy_type]}
              </span>
              {policy.target_audience && (
                <TargetAudienceTags audiences={policy.target_audience} size="sm" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {policy.title}
            </h3>
            {policy.summary && (
              <p className="text-xs text-gray-600 line-clamp-1">
                {policy.summary}
              </p>
            )}
          </div>
          {showImages && policy.additional_images && policy.additional_images[0] && !imageError && (
            <div className="w-16 h-16 flex-shrink-0">
              <Image
                src={policy.additional_images[0]}
                alt={policy.title}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link 
        href={`/article/${policy.slug}`}
        className={`block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}
      >
        {showImages && policy.additional_images && policy.additional_images[0] && !imageError && (
          <div className="relative h-48 bg-gray-100">
            <Image
              src={policy.additional_images[0]}
              alt={policy.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${policyTypeColors[policy.policy_type]}`}>
                {policyTypeLabels[policy.policy_type]}
              </span>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-3">
            {policy.target_audience && (
              <TargetAudienceTags audiences={policy.target_audience} size="sm" className="mb-3" />
            )}
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
              {policy.title}
            </h3>
          </div>
          
          {policy.summary && (
            <p className="text-gray-600 line-clamp-3 mb-4">
              {policy.summary}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {policy.agency && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{policy.agency.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(policy.created_at)}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/article/${policy.slug}`}
      className={`block bg-white rounded-lg border hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${policyTypeColors[policy.policy_type]}`}>
                {policyTypeLabels[policy.policy_type]}
              </span>
              {policy.target_audience && (
                <TargetAudienceTags audiences={policy.target_audience} size="sm" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {policy.title}
            </h3>
            
            {policy.summary && (
              <p className="text-gray-600 line-clamp-2 mb-4">
                {policy.summary}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {policy.agency && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{policy.agency.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(policy.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{policy.view_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{policy.like_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {showImages && policy.additional_images && policy.additional_images[0] && !imageError && (
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={policy.additional_images[0]}
                alt={policy.title}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            공유하기
          </button>
          
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>자세히 보기</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}