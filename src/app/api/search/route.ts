// src/app/api/search/route.ts - 검색 API
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/search - Processing search request');
    
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords') || searchParams.get('query') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!keywords.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        error: null,
        message: 'No search keywords provided'
      });
    }

    console.log(`[API] Searching for: "${keywords}"${category ? ` in category: ${category}` : ''}`);

    // Build search query
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Search in title, content, and keywords array
    // Using OR conditions for comprehensive search
    const searchTerms = keywords.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length === 1) {
      // Single term search
      query = query.or(`title.ilike.%${searchTerms[0]}%,body.ilike.%${searchTerms[0]}%`);
    } else {
      // Multiple terms - search for any term in title or body
      const orConditions = searchTerms.map(term => 
        `title.ilike.%${term}%,body.ilike.%${term}%`
      ).join(',');
      query = query.or(orConditions);
    }

    // Order by relevance (newest first as a proxy for relevance)
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('[API] Error searching articles:', error);
      return NextResponse.json({
        success: false,
        data: [],
        error: error.message,
        count: 0
      }, { status: 500 });
    }

    // Additional keyword search in the keywords array if needed
    let filteredArticles = articles || [];
    
    // If we have articles and keywords field exists, do additional filtering
    if (filteredArticles.length > 0 && searchTerms.length > 0) {
      filteredArticles = filteredArticles.filter(article => {
        // Check if any search term matches the title, body, or keywords
        return searchTerms.some(term => {
          const termLower = term.toLowerCase();
          return (
            article.title?.toLowerCase().includes(termLower) ||
            article.body?.toLowerCase().includes(termLower) ||
            (Array.isArray(article.keywords) && 
             article.keywords.some((keyword: string) => keyword.toLowerCase().includes(termLower)))
          );
        });
      });
    }

    console.log(`[API] Search found ${count} total matches, returning ${filteredArticles.length} for page ${page}`);

    return NextResponse.json({
      success: true,
      data: filteredArticles,
      count: filteredArticles.length,
      totalCount: count || 0,
      error: null,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      searchQuery: keywords
    });

  } catch (error) {
    console.error('[API] Unexpected error in GET /api/search:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      count: 0
    }, { status: 500 });
  }
}

// POST endpoint for advanced search (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      keywords,
      categories,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = body;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    // Keywords search
    if (keywords && keywords.trim()) {
      const searchTerms = keywords.toLowerCase().split(' ').filter((term: string) => term.length > 0);
      const orConditions = searchTerms.map((term: string) => 
        `title.ilike.%${term}%,body.ilike.%${term}%`
      ).join(',');
      query = query.or(orConditions);
    }

    // Categories filter
    if (categories && Array.isArray(categories) && categories.length > 0) {
      query = query.in('category', categories);
    }

    // Date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('[API] Error in advanced search:', error);
      return NextResponse.json({
        success: false,
        data: [],
        error: error.message,
        count: 0
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: articles || [],
      count: count || 0,
      error: null,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      searchCriteria: body
    });

  } catch (error) {
    console.error('[API] Unexpected error in POST /api/search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}