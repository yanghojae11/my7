// src/app/api/policies/[id]/route.ts - 개별 정책 API 라우트

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { PolicyFormData } from '@/types/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/policies/[id] - 특정 정책 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const policyId = parseInt(params.id);

    if (isNaN(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*),
        tags:policy_tag_relations(
          tag:policy_tags(*)
        )
      `)
      .eq('id', policyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Policy not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch policy', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error in GET /api/policies/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/policies/[id] - 정책 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const policyId = parseInt(params.id);
    
    if (isNaN(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const policyData: Partial<PolicyFormData> = body;

    // 기존 정책 확인
    const { data: existingPolicy, error: fetchError } = await supabase
      .from('policies')
      .select('id, status')
      .eq('id', policyId)
      .single();

    if (fetchError || !existingPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // 발행 상태 변경 시 발행일 업데이트
    const updateData: any = { ...policyData };
    if (policyData.status === 'published' && existingPolicy.status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }

    // 정책 업데이트
    const { data, error } = await supabase
      .from('policies')
      .update(updateData)
      .eq('id', policyId)
      .select(`
        *,
        category:policy_categories(*),
        agency:government_agencies(*),
        author:profiles(*)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update policy', details: error.message },
        { status: 500 }
      );
    }

    // 태그 관계 업데이트
    if (policyData.tags !== undefined) {
      await updatePolicyTagRelations(policyId, policyData.tags || []);
    }

    return NextResponse.json({
      data,
      message: 'Policy updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/policies/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/policies/[id] - 정책 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const policyId = parseInt(params.id);
    
    if (isNaN(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    // 정책 존재 확인
    const { data: existingPolicy, error: fetchError } = await supabase
      .from('policies')
      .select('id')
      .eq('id', policyId)
      .single();

    if (fetchError || !existingPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // 정책 삭제 (관련 데이터는 CASCADE로 자동 삭제)
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', policyId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete policy', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/policies/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 유틸리티 함수들

/**
 * 정책-태그 관계 업데이트
 */
async function updatePolicyTagRelations(policyId: number, tags: string[]) {
  try {
    // 기존 태그 관계 삭제
    await supabase
      .from('policy_tag_relations')
      .delete()
      .eq('policy_id', policyId);

    // 새 태그 관계 생성
    if (tags.length > 0) {
      const tagIds: number[] = [];
      
      for (const tagName of tags) {
        const slug = generateSlug(tagName);
        
        // 기존 태그 확인
        const { data: existingTag } = await supabase
          .from('policy_tags')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existingTag) {
          tagIds.push(existingTag.id);
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
    }

    // 사용되지 않는 태그의 usage_count 업데이트
    await updateTagUsageCounts();

  } catch (error) {
    console.error('Error updating policy tag relations:', error);
  }
}

/**
 * 태그 사용 횟수 업데이트
 */
async function updateTagUsageCounts() {
  try {
    const { data: tags } = await supabase
      .from('policy_tags')
      .select('id, slug');

    if (tags) {
      for (const tag of tags) {
        const { count } = await supabase
          .from('policy_tag_relations')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        await supabase
          .from('policy_tags')
          .update({ usage_count: count || 0 })
          .eq('id', tag.id);
      }
    }
  } catch (error) {
    console.error('Error updating tag usage counts:', error);
  }
}

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