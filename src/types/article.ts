// src/types/article.ts - 레거시 호환성을 위한 타입들
// 새로운 정책 타입은 @/types/policy.ts를 사용하세요

import { PolicySlideItem, PolicyRankingItem, PolicyFeedItem, PolicyCardItem, TrendItem as PolicyTrendItem } from './policy';
import { PolicyWithDetails } from './database';

// 레거시 호환성을 위한 타입 별칭들
export type SlideItem = PolicySlideItem;
export type RankingItem = PolicyRankingItem;
export type FeedItem = PolicyFeedItem;
export type CardItem = PolicyCardItem;
export type TrendItem = PolicyTrendItem;

// 레거시 Article 타입을 새로운 Policy 타입으로 매핑
export type Article = PolicyWithDetails & {
  // 레거시 필드 호환성
  source?: string;
  body?: string;
  raw_source?: string;
};

// 컴포넌트에서 사용하는 유틸리티 함수들
export function convertPolicyToSlideItem(policy: PolicyWithDetails): PolicySlideItem {
  return {
    id: policy.id,
    title: policy.title,
    image_url: policy.featured_image_url || '/placeholder-card.jpg',
    category: policy.category?.name || '정책',
    time: new Date(policy.published_at || policy.created_at).toLocaleDateString('ko-KR'),
    summary: policy.summary || policy.content.substring(0, 100) + '...',
    url: `/policy/${policy.slug}`,
    slug: policy.slug
  };
}

export function convertPolicyToRankingItem(policy: PolicyWithDetails, rank: number): PolicyRankingItem {
  return {
    id: policy.id,
    title: policy.title,
    rank,
    thumbnail: policy.featured_image_url,
    url: `/policy/${policy.slug}`,
    view_count: policy.view_count
  };
}

export function convertPolicyToFeedItem(policy: PolicyWithDetails): PolicyFeedItem {
  return {
    id: policy.id,
    title: policy.title,
    timestamp: policy.published_at || policy.created_at,
    summary: policy.summary || policy.content.substring(0, 70) + '...',
    category: policy.category?.name || null,
    url: `/policy/${policy.slug}`,
    image_url: policy.featured_image_url,
    slug: policy.slug,
    created_at: policy.created_at,
    policy_type: policy.policy_type
  };
}

export function convertPolicyToCardItem(policy: PolicyWithDetails): PolicyCardItem {
  return {
    id: policy.id,
    title: policy.title,
    summary: policy.summary || policy.content.substring(0, 100) + '...',
    description: policy.summary || policy.content.substring(0, 150) + '...',
    image: policy.featured_image_url || '/placeholder-card.jpg',
    image_url: policy.featured_image_url || '/placeholder-card.jpg',
    url: `/policy/${policy.slug}`,
    category: policy.category?.name || '정책',
    policy_type: policy.policy_type,
    application_period_start: policy.application_period_start,
    application_period_end: policy.application_period_end,
    support_amount: policy.support_amount,
    target_audience: policy.target_audience
  };
}

// 레거시 인터페이스들 (더 이상 사용하지 않음)
export interface LegacyArticle {
  slug: string;
  title: string;
  created_at: string;
  image_url: string | string[] | null;
  source: string;
  body?: string;
  category?: string;
  raw_source?: string | null;
  policy_type?: 'startup' | 'housing' | 'employment' | 'education' | 'welfare' | 'subsidy' | 'news';
  target_audience?: string;
  application_period?: string;
  application_method?: string;
  contact_info?: string;
  requirements?: string;
  benefits?: string;
}

export interface LegacyTrendItem {
  name: string;
  score: number;
  url?: string;
  change?: string;
}