// src/types/database.ts - MY7 정책지원 데이터베이스 타입 정의

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernmentAgency {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website_url?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
    [key: string]: any;
  };
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  category_id?: number;
  agency_id?: number;
  
  // 정책 메타 정보
  policy_type: 'subsidy' | 'support' | 'regulation' | 'announcement';
  target_audience?: string[];
  eligibility_criteria?: string;
  application_period_start?: string;
  application_period_end?: string;
  support_amount?: string;
  application_url?: string;
  required_documents?: string[];
  
  // SEO 및 메타데이터
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  
  // 상태 및 통계
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  bookmark_count: number;
  
  // 미디어
  featured_image_url?: string;
  image_alt?: string;
  
  // 날짜
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // 작성자
  author_id?: string;
  
  // 관계 데이터 (JOIN시 포함)
  category?: PolicyCategory;
  agency?: GovernmentAgency;
  author?: Profile;
  tags?: PolicyTag[];
}

export interface PolicyTag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface PolicyTagRelation {
  policy_id: number;
  tag_id: number;
}

export interface UserBookmark {
  id: number;
  user_id: string;
  policy_id: number;
  created_at: string;
  
  // 관계 데이터
  policy?: Policy;
}

export interface UserLike {
  id: number;
  user_id: string;
  policy_id: number;
  created_at: string;
  
  // 관계 데이터
  policy?: Policy;
}

export interface Comment {
  id: number;
  policy_id: number;
  user_id: string;
  parent_id?: number;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  user?: Profile;
  policy?: Policy;
  parent?: Comment;
  replies?: Comment[];
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name?: string;
  is_subscribed: boolean;
  subscribed_categories?: number[];
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Supabase Database 타입 정의
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      policy_categories: {
        Row: PolicyCategory;
        Insert: Omit<PolicyCategory, 'id' | 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PolicyCategory, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      government_agencies: {
        Row: GovernmentAgency;
        Insert: Omit<GovernmentAgency, 'id' | 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<GovernmentAgency, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      policies: {
        Row: Policy;
        Insert: Omit<Policy, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'bookmark_count'> & {
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          like_count?: number;
          bookmark_count?: number;
        };
        Update: Partial<Omit<Policy, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      policy_tags: {
        Row: PolicyTag;
        Insert: Omit<PolicyTag, 'id' | 'usage_count' | 'created_at'> & {
          usage_count?: number;
          created_at?: string;
        };
        Update: Partial<Omit<PolicyTag, 'id' | 'created_at'>>;
      };
      policy_tag_relations: {
        Row: PolicyTagRelation;
        Insert: PolicyTagRelation;
        Update: never;
      };
      user_bookmarks: {
        Row: UserBookmark;
        Insert: Omit<UserBookmark, 'id' | 'created_at'> & {
          created_at?: string;
        };
        Update: never;
      };
      user_likes: {
        Row: UserLike;
        Insert: Omit<UserLike, 'id' | 'created_at'> & {
          created_at?: string;
        };
        Update: never;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_approved'> & {
          created_at?: string;
          updated_at?: string;
          is_approved?: boolean;
        };
        Update: Partial<Omit<Comment, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<NewsletterSubscriber, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SiteSetting, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      policy_type: 'subsidy' | 'support' | 'regulation' | 'announcement';
      policy_status: 'draft' | 'published' | 'archived';
    };
  };
}

// 컴포넌트에서 사용할 유틸리티 타입들
export type PolicyWithDetails = Policy & {
  category?: PolicyCategory;
  agency?: GovernmentAgency;
  author?: Profile;
  tags?: PolicyTag[];
  is_bookmarked?: boolean;
  is_liked?: boolean;
};

export type CategoryWithPolicies = PolicyCategory & {
  policies?: Policy[];
  policy_count?: number;
};

export type AgencyWithPolicies = GovernmentAgency & {
  policies?: Policy[];
  policy_count?: number;
};

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// 검색 및 필터링 타입
export interface PolicySearchParams {
  query?: string;
  category_id?: number;
  agency_id?: number;
  policy_type?: Policy['policy_type'];
  status?: Policy['status'];
  target_audience?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'title';
  sort_order?: 'asc' | 'desc';
}

// 폼 검증을 위한 타입들
export interface PolicyFormData {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  category_id?: number;
  agency_id?: number;
  policy_type: Policy['policy_type'];
  target_audience?: string[];
  eligibility_criteria?: string;
  application_period_start?: string;
  application_period_end?: string;
  support_amount?: string;
  application_url?: string;
  required_documents?: string[];
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  featured_image_url?: string;
  image_alt?: string;
  status: Policy['status'];
  tags?: string[];
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface AgencyFormData {
  name: string;
  slug?: string;
  description?: string;
  website_url?: string;
  contact_info?: GovernmentAgency['contact_info'];
  logo_url?: string;
  is_active?: boolean;
}