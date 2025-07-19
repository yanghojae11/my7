// src/app/api/startup/route.ts - 창업 지원 정책 API
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/startup - Fetching startup support articles');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // articles 테이블에서 창업 지원 카테고리 데이터 조회
    const { data: articles, error, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('category', 'startup-support')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[API] Error fetching startup articles:', error);
      return NextResponse.json({
        success: false,
        data: [],
        error: error.message,
        count: 0
      }, { status: 500 });
    }

    console.log(`[API] Found ${count} startup articles, returning ${articles?.length || 0} for page ${page}`);

    return NextResponse.json({
      success: true,
      data: articles || [],
      count: count || 0,
      error: null,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('[API] Unexpected error in GET /api/startup:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      count: 0
    }, { status: 500 });
  }
}

// POST endpoint for creating new startup articles (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json({
        success: false,
        error: 'Title and body are required'
      }, { status: 400 });
    }

    // Create slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 200);

    const articleData = {
      title: body.title,
      slug,
      body: body.body,
      html_content: body.html_content || body.body,
      category: 'startup-support',
      image_url: body.image_url || null,
      keywords: body.keywords || [],
      original_url: body.original_url || null,
      source: body.source || 'manual',
      status: body.status || 'published',
      word_count: body.body ? body.body.length : 0,
      view_count: 0
    };

    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('[API] Error creating startup article:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      error: null
    }, { status: 201 });

  } catch (error) {
    console.error('[API] Unexpected error in POST /api/startup:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}