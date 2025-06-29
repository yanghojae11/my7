// src/lib/supabaseClient.ts - 최적화된 Supabase 클라이언트
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { API_CONFIG } from '@/config/index';

// Supabase 클라이언트 인스턴스를 한 번만 생성하고 재사용하기 위한 싱글톤 패턴
declare global {
  // eslint-disable-next-line no-var
  var supabase: SupabaseClient<Database> | undefined;
}

let supabase: SupabaseClient<Database>;

if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서는 항상 새로운 클라이언트를 생성
  if (!API_CONFIG.supabase.url || !API_CONFIG.supabase.anonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
  
  supabase = createClient(API_CONFIG.supabase.url, API_CONFIG.supabase.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'my7-policy-support',
      },
    },
  });
} else {
  // 개발 환경에서는 전역 객체를 사용하여 클라이언트 인스턴스를 재사용
  if (!global.supabase) {
    if (!API_CONFIG.supabase.url || !API_CONFIG.supabase.anonKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }
    
    global.supabase = createClient(API_CONFIG.supabase.url, API_CONFIG.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'my7-policy-support-dev',
        },
      },
    });
  }
  supabase = global.supabase;
}

export { supabase };

// 레거시 호환성을 위한 타입 리엑스포트
export type { Database } from '@/types/database';