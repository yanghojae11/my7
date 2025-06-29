// src/app/api/policies/[id]/bookmark/route.ts - 정책 북마크 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/policies/[id]/bookmark - 북마크 토글
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

    // 기존 북마크 확인
    const { data: existingBookmark } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', user_id)
      .eq('policy_id', policyId)
      .single();

    if (existingBookmark) {
      // 북마크 제거
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user_id)
        .eq('policy_id', policyId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to remove bookmark', details: error.message },
          { status: 500 }
        );
      }

      // 북마크 수 감소
      await updatePolicyBookmarkCount(policyId, -1);

      return NextResponse.json({
        bookmarked: false,
        message: 'Bookmark removed successfully'
      });
    } else {
      // 북마크 추가
      const { error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id,
          policy_id: policyId
        });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to add bookmark', details: error.message },
          { status: 500 }
        );
      }

      // 북마크 수 증가
      await updatePolicyBookmarkCount(policyId, 1);

      return NextResponse.json({
        bookmarked: true,
        message: 'Bookmark added successfully'
      });
    }

  } catch (error) {
    console.error('Error in POST /api/policies/[id]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/policies/[id]/bookmark - 북마크 상태 확인
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

    const { data: bookmark } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .single();

    return NextResponse.json({
      bookmarked: !!bookmark
    });

  } catch (error) {
    console.error('Error in GET /api/policies/[id]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 정책의 북마크 수 업데이트
 */
async function updatePolicyBookmarkCount(policyId: number, increment: number) {
  try {
    const { data: currentPolicy } = await supabase
      .from('policies')
      .select('bookmark_count')
      .eq('id', policyId)
      .single();

    if (currentPolicy) {
      const newCount = Math.max(0, (currentPolicy.bookmark_count || 0) + increment);
      
      await supabase
        .from('policies')
        .update({ bookmark_count: newCount })
        .eq('id', policyId);
    }
  } catch (error) {
    console.error('Error updating bookmark count:', error);
  }
}