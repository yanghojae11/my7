// src/app/api/agencies/route.ts - 정부 기관 API 라우트

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AgencyFormData } from '@/types/database';

// GET /api/agencies - 모든 정부 기관 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';
    const activeOnly = searchParams.get('active_only') !== 'false'; // 기본값 true

    let query = supabase
      .from('government_agencies')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: agencies, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch agencies', details: error.message },
        { status: 500 }
      );
    }

    let result = agencies || [];

    // 통계 정보 포함
    if (includeStats && result.length > 0) {
      const agencyIds = result.map(agency => agency.id);
      
      const { data: policyCounts } = await supabase
        .from('policies')
        .select('agency_id')
        .eq('status', 'published')
        .in('agency_id', agencyIds);

      // 기관별 정책 수 계산
      const countMap: Record<number, number> = {};
      policyCounts?.forEach(policy => {
        if (policy.agency_id) {
          countMap[policy.agency_id] = (countMap[policy.agency_id] || 0) + 1;
        }
      });

      result = result.map(agency => ({
        ...agency,
        policy_count: countMap[agency.id] || 0
      }));
    }

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error('Error in GET /api/agencies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/agencies - 새 기관 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agencyData: AgencyFormData = body;

    // 슬러그 자동 생성 (이름 기반)
    if (!agencyData.slug) {
      agencyData.slug = generateSlug(agencyData.name);
    }

    const { data, error } = await supabase
      .from('government_agencies')
      .insert({
        name: agencyData.name,
        slug: agencyData.slug,
        description: agencyData.description,
        website_url: agencyData.website_url,
        contact_info: agencyData.contact_info,
        logo_url: agencyData.logo_url,
        is_active: agencyData.is_active ?? true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create agency', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Agency created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/agencies:', error);
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