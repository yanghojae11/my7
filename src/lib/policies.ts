// src/lib/policies.ts - 정책 데이터 관련 유틸리티 함수들

import { supabase } from './supabaseClient';
import { Policy, PolicyCategory, GovernmentAgency, PolicyWithDetails, PolicySearchParams, PaginatedResponse } from '@/types/database';

/**
 * 모든 정책 카테고리를 가져오는 함수
 */
export async function getPolicyCategories(): Promise<PolicyCategory[]> {
  try {
    const { data, error } = await supabase
      .from('policy_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching policy categories:', error);
    return [];
  }
}

/**
 * 모든 정부 기관을 가져오는 함수
 */
export async function getGovernmentAgencies(): Promise<GovernmentAgency[]> {
  try {
    const { data, error } = await supabase
      .from('government_agencies')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching government agencies:', error);
    return [];
  }
}

/**
 * 최신 정책들을 가져오는 함수
 */
export async function getLatestPolicies(limit: number = 10): Promise<PolicyWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching latest policies:', error);
    return [];
  }
}

/**
 * 카테고리별 정책들을 가져오는 함수
 */
export async function getPoliciesByCategory(categorySlug: string, limit?: number): Promise<PolicyWithDetails[]> {
  try {
    // First get the category ID
    const { data: category, error: categoryError } = await supabase
      .from('policy_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError || !category) {
      console.error('Category not found:', categorySlug);
      return [];
    }

    let query = supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `)
      .eq('status', 'published')
      .eq('category_id', category.id)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching policies by category:', error);
    return [];
  }
}

/**
 * 특정 정책을 슬러그로 가져오는 함수
 */
export async function getPolicyBySlug(slug: string): Promise<PolicyWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw error;
    }

    // 조회수 증가
    await incrementPolicyViewCount(data.id);

    return data;
  } catch (error) {
    console.error('Error fetching policy by slug:', error);
    return null;
  }
}

/**
 * 인기 정책들을 가져오는 함수 (조회수 기준)
 */
export async function getPopularPolicies(limit: number = 10): Promise<PolicyWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `)
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching popular policies:', error);
    return [];
  }
}

/**
 * 정책 검색 함수
 */
export async function searchPolicies(params: PolicySearchParams): Promise<PaginatedResponse<PolicyWithDetails>> {
  try {
    const {
      query,
      category_id,
      agency_id,
      policy_type,
      status = 'published',
      target_audience,
      page = 1,
      per_page = 20,
      sort_by = 'published_at',
      sort_order = 'desc'
    } = params;

    let supabaseQuery = supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `, { count: 'exact' })
      .eq('status', status);

    // 검색어 필터
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`);
    }

    // 카테고리 필터
    if (category_id) {
      supabaseQuery = supabaseQuery.eq('category_id', category_id);
    }

    // 기관 필터
    if (agency_id) {
      supabaseQuery = supabaseQuery.eq('agency_id', agency_id);
    }

    // 정책 유형 필터
    if (policy_type) {
      supabaseQuery = supabaseQuery.eq('policy_type', policy_type);
    }

    // 대상자 필터
    if (target_audience) {
      supabaseQuery = supabaseQuery.contains('target_audience', [target_audience]);
    }

    // 정렬
    supabaseQuery = supabaseQuery.order(sort_by, { ascending: sort_order === 'asc' });

    // 페이지네이션
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) throw error;

    const total_pages = Math.ceil((count || 0) / per_page);

    return {
      data: data || [],
      count: count || 0,
      page,
      per_page,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1
    };
  } catch (error) {
    console.error('Error searching policies:', error);
    return {
      data: [],
      count: 0,
      page,
      per_page,
      total_pages: 0,
      has_next: false,
      has_previous: false
    };
  }
}

/**
 * 정책 조회수 증가
 */
export async function incrementPolicyViewCount(policyId: number): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_policy_view_count', {
      policy_id: policyId
    });

    if (error) {
      // RPC 함수가 없는 경우 직접 업데이트
      const { data: currentData } = await supabase
        .from('policies')
        .select('view_count')
        .eq('id', policyId)
        .single();

      if (currentData) {
        await supabase
          .from('policies')
          .update({ view_count: (currentData.view_count || 0) + 1 })
          .eq('id', policyId);
      }
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * 사용자의 북마크된 정책들을 가져오는 함수
 */
export async function getUserBookmarkedPolicies(userId: string): Promise<PolicyWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(`
        policy:policies(
          *,
          category:policy_categories(*),
          agency:government_agencies(*),
          author:profiles(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => item.policy).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching user bookmarked policies:', error);
    return [];
  }
}

/**
 * 정책 북마크 토글
 */
export async function togglePolicyBookmark(userId: string, policyId: number): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .single();

    if (existing) {
      // 북마크 제거
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('policy_id', policyId);

      if (error) throw error;
      return false;
    } else {
      // 북마크 추가
      const { error } = await supabase
        .from('user_bookmarks')
        .insert({ user_id: userId, policy_id: policyId });

      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

/**
 * 정책 좋아요 토글
 */
export async function togglePolicyLike(userId: string, policyId: number): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .single();

    if (existing) {
      // 좋아요 제거
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('policy_id', policyId);

      if (error) throw error;
      return false;
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from('user_likes')
        .insert({ user_id: userId, policy_id: policyId });

      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * 사용자가 특정 정책을 북마크했는지 확인
 */
export async function isPolicyBookmarked(userId: string, policyId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}

/**
 * 사용자가 특정 정책을 좋아요했는지 확인
 */
export async function isPolicyLiked(userId: string, policyId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}

/**
 * 정책 타입별 통계 가져오기
 */
export async function getPolicyTypeStats(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('policy_type')
      .eq('status', 'published');

    if (error) throw error;

    const stats: Record<string, number> = {};
    data?.forEach(item => {
      stats[item.policy_type] = (stats[item.policy_type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching policy type stats:', error);
    return {};
  }
}

/**
 * 카테고리별 정책 수 통계
 */
export async function getCategoryStats(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select(`
        category_id,
        category:policy_categories(name)
      `)
      .eq('status', 'published');

    if (error) throw error;

    const stats: Record<string, number> = {};
    data?.forEach(item => {
      if (item.category?.name) {
        stats[item.category.name] = (stats[item.category.name] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return {};
  }
}