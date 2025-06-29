// src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트를 초기화하는 파일입니다.
// 실제 애플리케이션에서는 환경 변수를 사용하여 API 키와 URL을 안전하게 관리해야 합니다.
// .env.local 파일에 다음과 같이 추가해야 합니다:
// NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 클라이언트를 한 번만 초기화하도록 singleton 패턴을 적용합니다.
let supabaseClient: any = null; // 실제 SupabaseClient 타입으로 지정 필요

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not set in environment variables.');
  // 개발 환경에서는 오류를 내보내지만, 빌드 과정에서는 오류를 방지하기 위해 빈 클라이언트를 반환하거나 적절히 처리할 수 있습니다.
  // 이 예시에서는 오류 메시지만 출력하고 실제 빌드에는 영향을 미치지 않도록 합니다.
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabaseClient };
