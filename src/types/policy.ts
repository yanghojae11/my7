// src/types/policy.ts - 컴포넌트에서 사용할 정책 관련 타입들

import { PolicyWithDetails, PolicyCategory, GovernmentAgency } from './database';

// 홈페이지 슬라이더용 정책 아이템
export interface PolicySlideItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
  time: string;
  summary: string;
  url: string;
  slug: string;
}

// 랭킹용 정책 아이템
export interface PolicyRankingItem {
  id: number;
  title: string;
  rank: number;
  thumbnail: string | null;
  url: string;
  view_count: number;
}

// 피드용 정책 아이템
export interface PolicyFeedItem {
  id: number;
  title: string;
  timestamp: string;
  summary: string;
  category: string | null;
  url: string;
  image_url: string | null;
  slug: string;
  created_at: string;
  policy_type: string;
}

// 카드용 정책 아이템
export interface PolicyCardItem {
  id: number;
  title: string;
  summary: string;
  description: string;
  image: string;
  image_url: string;
  url: string;
  category: string;
  policy_type: string;
  application_period_start?: string;
  application_period_end?: string;
  support_amount?: string;
  target_audience?: string[];
}

// 트렌드 키워드 아이템
export interface TrendItem {
  name: string;
  score: number;
  url?: string;
  change?: string;
}

// 홈페이지용 통계 데이터
export interface PolicyStats {
  total_policies: number;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
  recent_count: number;
}

// 검색 필터 옵션
export interface PolicyFilterOptions {
  categories: PolicyCategory[];
  agencies: GovernmentAgency[];
  policy_types: Array<{
    value: string;
    label: string;
  }>;
  target_audiences: string[];
}

// 정책 상세 페이지용 타입
export interface PolicyDetailData extends PolicyWithDetails {
  related_policies?: PolicyWithDetails[];
  is_bookmarked?: boolean;
  is_liked?: boolean;
  comments_count?: number;
}

// 댓글 관련 타입
export interface PolicyComment {
  id: number;
  policy_id: number;
  user_id: string;
  parent_id?: number;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  replies?: PolicyComment[];
}

// 정책 작성/수정 폼 데이터
export interface PolicyFormState {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category_id: number | null;
  agency_id: number | null;
  policy_type: 'subsidy' | 'support' | 'regulation' | 'announcement';
  target_audience: string[];
  eligibility_criteria: string;
  application_period_start: string;
  application_period_end: string;
  support_amount: string;
  application_url: string;
  required_documents: string[];
  meta_title: string;
  meta_description: string;
  keywords: string[];
  featured_image_url: string;
  image_alt: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

// 폼 검증 에러
export interface PolicyFormErrors {
  title?: string;
  slug?: string;
  content?: string;
  category_id?: string;
  policy_type?: string;
  application_period_start?: string;
  application_period_end?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  [key: string]: string | undefined;
}

// 사용자 상호작용 상태
export interface UserInteractionState {
  isBookmarked: boolean;
  isLiked: boolean;
  bookmarkLoading: boolean;
  likeLoading: boolean;
}

// 정책 목록 필터 상태
export interface PolicyListFilters {
  search: string;
  category_id: number | null;
  agency_id: number | null;
  policy_type: string | null;
  target_audience: string | null;
  status: string | null;
  sort_by: 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'title';
  sort_order: 'asc' | 'desc';
  page: number;
  per_page: number;
}

// API 응답 타입들
export interface PolicyListResponse {
  policies: PolicyWithDetails[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PolicyCreateResponse {
  policy: PolicyWithDetails;
  message: string;
}

export interface PolicyUpdateResponse {
  policy: PolicyWithDetails;
  message: string;
}

export interface PolicyDeleteResponse {
  success: boolean;
  message: string;
}

// 정책 카테고리 통계
export interface CategoryWithStats extends PolicyCategory {
  policy_count: number;
  recent_policies?: PolicyWithDetails[];
}

// 정부 기관 통계
export interface AgencyWithStats extends GovernmentAgency {
  policy_count: number;
  recent_policies?: PolicyWithDetails[];
}

// 홈페이지 섹션 데이터
export interface HomepageSectionData {
  startup_policies: PolicyCardItem[];
  housing_policies: PolicyCardItem[];
  employment_policies: PolicyCardItem[];
  education_policies: PolicyCardItem[];
  welfare_policies: PolicyCardItem[];
  subsidy_policies: PolicyCardItem[];
  featured_policies: PolicySlideItem[];
  popular_policies: PolicyRankingItem[];
  recent_policies: PolicyFeedItem[];
  trending_keywords: TrendItem[];
}

// 알림 관련 타입
export interface PolicyNotification {
  id: number;
  user_id: string;
  policy_id: number;
  type: 'new_policy' | 'policy_update' | 'deadline_reminder' | 'category_update';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  policy?: PolicyWithDetails;
}

// 뉴스레터 구독 관련
export interface NewsletterSubscription {
  email: string;
  name?: string;
  subscribed_categories: number[];
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    policy_types: string[];
    target_audience: string[];
  };
}

// 대시보드 통계 데이터
export interface DashboardStats {
  total_policies: number;
  published_policies: number;
  draft_policies: number;
  total_views: number;
  total_likes: number;
  total_bookmarks: number;
  recent_activity: Array<{
    type: 'view' | 'like' | 'bookmark' | 'comment';
    policy_title: string;
    user_name?: string;
    created_at: string;
  }>;
  popular_categories: Array<{
    name: string;
    count: number;
  }>;
  monthly_stats: Array<{
    month: string;
    views: number;
    likes: number;
    bookmarks: number;
  }>;
}