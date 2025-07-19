import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET endpoint for fetching articles with optional filters
export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/articles - Fetching articles');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Add sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('[API] Error fetching articles:', error);
      return NextResponse.json({
        success: false,
        data: [],
        error: error.message,
        count: 0
      }, { status: 500 });
    }

    console.log(`[API] Found ${count} articles, returning ${articles?.length || 0} for page ${page}`);

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
    console.error('[API] Unexpected error in GET /api/articles:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      count: 0
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 인증 (Bearer)
    const auth = req.headers.get('authorization');
    if (auth !== 'Bearer sk_live_b8d81e8adbdc499ebcf6bb3b6fc41827_KEY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 데이터 파싱
    const body = await req.json();
    const { title, url, content, date, category, keywords, image_url } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({
        error: 'Title and content are required'
      }, { status: 400 });
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 200);

    // Save to database
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        html_content: content,
        category: category || 'general',
        original_url: url || null,
        image_url: image_url || null,
        keywords: keywords || [],
        status: 'published',
        word_count: content.length,
        view_count: 0,
        created_at: date || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Error saving article:', error);
      return NextResponse.json({
        error: 'Failed to save article',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Article saved successfully!',
      data,
    });

  } catch (error) {
    console.error('[API] Unexpected error in POST /api/articles:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
