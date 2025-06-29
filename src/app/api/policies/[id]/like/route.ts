// src/app/api/policies/[id]/like/route.ts - 정책 좋아요 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/policies/[id]/like - 좋아요 토글
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
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    // 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('policy_id', policyId)
      .single();

    if (existingLike) {
      // 좋아요 제거
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', user_id)
        .eq('policy_id', policyId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to remove like', details: error.message },
          { status: 500 }
        );
      }

      // 좋아요 수 감소
      await updatePolicyLikeCount(policyId, -1);

      return NextResponse.json({
        liked: false,
        message: 'Like removed successfully'
      });
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from('user_likes')
        .insert({
          user_id,
          policy_id: policyId
        });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to add like', details: error.message },
          { status: 500 }
        );
      }

      // 좋아요 수 증가
      await updatePolicyLikeCount(policyId, 1);

      return NextResponse.json({
        liked: true,
        message: 'Like added successfully'
      });
    }

  } catch (error) {
    console.error('Error in POST /api/policies/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/policies/[id]/like - 좋아요 상태 확인
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const policyId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (isNaN(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const { data: like } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .single();

    return NextResponse.json({
      liked: !!like
    });

  } catch (error) {
    console.error('Error in GET /api/policies/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 정책의 좋아요 수 업데이트
 */
async function updatePolicyLikeCount(policyId: number, increment: number) {
  try {
    const { data: currentPolicy } = await supabase
      .from('policies')
      .select('like_count')
      .eq('id', policyId)
      .single();

    if (currentPolicy) {
      const newCount = Math.max(0, (currentPolicy.like_count || 0) + increment);
      
      await supabase
        .from('policies')
        .update({ like_count: newCount })
        .eq('id', policyId);
    }
  } catch (error) {
    console.error('Error updating like count:', error);
  }
}