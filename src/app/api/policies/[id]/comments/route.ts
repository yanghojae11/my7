// src/app/api/policies/[id]/comments/route.ts - 정책 댓글 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/policies/[id]/comments - 정책 댓글 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const policyId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const approved_only = searchParams.get('approved_only') !== 'false'; // 기본값 true
    
    if (isNaN(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('comments')
      .select(`
        *,
        user:profiles(*),
        replies:comments!parent_id(
          *,
          user:profiles(*)
        )
      `, { count: 'exact' })
      .eq('policy_id', policyId)
      .is('parent_id', null) // 최상위 댓글만 (대댓글은 replies에 포함)
      .order('created_at', { ascending: false });

    if (approved_only) {
      query = query.eq('is_approved', true);
    }

    // 페이지네이션
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data: comments, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: error.message },
        { status: 500 }
      );
    }

    const total_pages = Math.ceil((count || 0) / per_page);

    return NextResponse.json({
      data: comments || [],
      count: count || 0,
      page,
      per_page,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1
    });

  } catch (error) {
    console.error('Error in GET /api/policies/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/policies/[id]/comments - 새 댓글 작성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const policyId = parseInt(params.id);
    
    if (isNaN(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { user_id, content, parent_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // 정책 존재 확인
    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .select('id')
      .eq('id', policyId)
      .single();

    if (policyError || !policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // 대댓글인 경우 부모 댓글 존재 확인
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, policy_id')
        .eq('id', parent_id)
        .single();

      if (parentError || !parentComment || parentComment.policy_id !== policyId) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // 댓글 생성
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        policy_id: policyId,
        user_id,
        parent_id: parent_id || null,
        content: content.trim(),
        is_approved: false // 기본적으로 승인 대기 상태
      })
      .select(`
        *,
        user:profiles(*),
        policy:policies(title)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create comment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: comment,
      message: 'Comment created successfully. It will be visible after approval.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/policies/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}