// src/app/api/policies/route.ts - 정책 API 라우트

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { PolicySearchParams, PolicyFormData } from '@/types/database';

// GET /api/policies - 정책 목록 조회 및 검색
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: PolicySearchParams = {
      query: searchParams.get('query') || undefined,
      category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined,
      agency_id: searchParams.get('agency_id') ? parseInt(searchParams.get('agency_id')!) : undefined,
      policy_type: searchParams.get('policy_type') as any || undefined,
      status: searchParams.get('status') as any || 'published',
      target_audience: searchParams.get('target_audience') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : 20,
      sort_by: searchParams.get('sort_by') as any || 'published_at',
      sort_order: searchParams.get('sort_order') as any || 'desc'
    };

    // 쿼리 빌더 시작
    let query = supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `, { count: 'exact' })
      .eq('status', params.status);

    // 검색어 필터
    if (params.query) {
      query = query.or(`title.ilike.%${params.query}%,summary.ilike.%${params.query}%,content.ilike.%${params.query}%`);
    }

    // 카테고리 필터
    if (params.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    // 기관 필터
    if (params.agency_id) {
      query = query.eq('agency_id', params.agency_id);
    }

    // 정책 유형 필터
    if (params.policy_type) {
      query = query.eq('policy_type', params.policy_type);
    }

    // 대상자 필터
    if (params.target_audience) {
      query = query.contains('target_audience', [params.target_audience]);
    }

    // 정렬
    query = query.order(params.sort_by, { ascending: params.sort_order === 'asc' });

    // 페이지네이션
    const from = (params.page - 1) * params.per_page;
    const to = from + params.per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch policies', details: error.message },
        { status: 500 }
      );
    }

    const total_pages = Math.ceil((count || 0) / params.per_page);

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page: params.page,
      per_page: params.per_page,
      total_pages,
      has_next: params.page < total_pages,
      has_previous: params.page > 1
    });

  } catch (error) {
    console.error('Error in GET /api/policies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/policies - 새 정책 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const policyData: PolicyFormData = body;

    // 슬러그 자동 생성 (제목 기반)
    if (!policyData.slug) {
      policyData.slug = generateSlug(policyData.title);
    }

    // 새 정책 생성
    const { data, error } = await supabase
      .from('policies')
      .insert({
        title: policyData.title,
        slug: policyData.slug,
        summary: policyData.summary,
        content: policyData.content,
        category_id: policyData.category_id,
        agency_id: policyData.agency_id,
        policy_type: policyData.policy_type,
        target_audience: policyData.target_audience,
        eligibility_criteria: policyData.eligibility_criteria,
        application_period_start: policyData.application_period_start,
        application_period_end: policyData.application_period_end,
        support_amount: policyData.support_amount,
        application_url: policyData.application_url,
        required_documents: policyData.required_documents,
        meta_title: policyData.meta_title,
        meta_description: policyData.meta_description,
        keywords: policyData.keywords,
        featured_image_url: policyData.featured_image_url,
        image_alt: policyData.image_alt,
        status: policyData.status,
        published_at: policyData.status === 'published' ? new Date().toISOString() : null
      })
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create policy', details: error.message },
        { status: 500 }
      );
    }

    // 태그 관계 생성
    if (policyData.tags && policyData.tags.length > 0) {
      await createPolicyTagRelations(data.id, policyData.tags);
    }

    return NextResponse.json({
      data,
      message: 'Policy created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/policies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 유틸리티 함수들

/**
 * 제목에서 슬러그 생성
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .trim()
    .substring(0, 100); // 최대 100자
}

/**
 * 정책-태그 관계 생성
 */
async function createPolicyTagRelations(policyId: number, tags: string[]) {
  try {
    // 기존 태그들 가져오기 또는 새로 생성
    const tagIds: number[] = [];
    
    for (const tagName of tags) {
      const slug = generateSlug(tagName);
      
      // 기존 태그 확인
      let { data: existingTag } = await supabase
        .from('policy_tags')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingTag) {
        tagIds.push(existingTag.id);
        
        // 사용 횟수 증가
        await supabase
          .from('policy_tags')
          .update({ usage_count: supabase.sql`usage_count + 1` })
          .eq('id', existingTag.id);
      } else {
        // 새 태그 생성
        const { data: newTag } = await supabase
          .from('policy_tags')
          .insert({
            name: tagName,
            slug,
            usage_count: 1
          })
          .select('id')
          .single();

        if (newTag) {
          tagIds.push(newTag.id);
        }
      }
    }

    // 정책-태그 관계 생성
    if (tagIds.length > 0) {
      const relations = tagIds.map(tagId => ({
        policy_id: policyId,
        tag_id: tagId
      }));

      await supabase
        .from('policy_tag_relations')
        .insert(relations);
    }

  } catch (error) {
    console.error('Error creating policy tag relations:', error);
  }
}