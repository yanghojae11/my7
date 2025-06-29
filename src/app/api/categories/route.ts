// src/app/api/categories/route.ts - 정책 카테고리 API 라우트

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { CategoryFormData } from '@/types/database';

// GET /api/categories - 모든 정책 카테고리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';
    const activeOnly = searchParams.get('active_only') !== 'false'; // 기본값 true

    let query = supabase
      .from('policy_categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: categories, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    let result = categories || [];

    // 통계 정보 포함
    if (includeStats && result.length > 0) {
      const categoryIds = result.map(cat => cat.id);
      
      const { data: policyCounts } = await supabase
        .from('policies')
        .select('category_id')
        .eq('status', 'published')
        .in('category_id', categoryIds);

      // 카테고리별 정책 수 계산
      const countMap: Record<number, number> = {};
      policyCounts?.forEach(policy => {
        if (policy.category_id) {
          countMap[policy.category_id] = (countMap[policy.category_id] || 0) + 1;
        }
      });

      result = result.map(category => ({
        ...category,
        policy_count: countMap[category.id] || 0
      }));
    }

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - 새 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoryData: CategoryFormData = body;

    // 슬러그 자동 생성 (이름 기반)
    if (!categoryData.slug) {
      categoryData.slug = generateSlug(categoryData.name);
    }

    // order_index 자동 설정
    if (categoryData.order_index === undefined) {
      const { data: maxOrderCategory } = await supabase
        .from('policy_categories')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      categoryData.order_index = (maxOrderCategory?.order_index || 0) + 1;
    }

    const { data, error } = await supabase
      .from('policy_categories')
      .insert({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
        order_index: categoryData.order_index,
        is_active: categoryData.is_active ?? true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 이름에서 슬러그 생성
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .trim()
    .substring(0, 100); // 최대 100자
}