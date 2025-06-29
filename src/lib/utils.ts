// src/lib/utils.ts - 최적화된 유틸리티 함수들

// 날짜 포맷팅 함수
export function formatKoreanDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '날짜 정보 없음';
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '날짜 정보 없음';
  }
}

// 상대 시간 표시 (예: "3시간 전")
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }
    
    // 일주일 이상이면 날짜 표시
    return formatKoreanDate(dateString);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatKoreanDate(dateString);
  }
}

// 텍스트 길이 제한 및 말줄임표 추가
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

// 이미지 URL 검증 및 대체
export function validateImageUrl(url: string | null): string {
  if (!url) return '/placeholder-card.jpg';
  
  try {
    // 절대 URL인지 확인
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 상대 URL인지 확인
    if (url.startsWith('/')) {
      return url;
    }
    
    // 잘못된 형식이면 기본 이미지 반환
    return '/placeholder-card.jpg';
  } catch (error) {
    console.error('Image URL validation error:', error);
    return '/placeholder-card.jpg';
  }
}

// HTML 태그 제거 함수
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  try {
    // 간단한 HTML 태그 제거 (서버사이드에서 안전)
    return html
      .replace(/<br\s*\/?>/gi, '\n') // <br> 태그를 줄바꿈으로
      .replace(/<[^>]*>/g, '') // 모든 HTML 태그 제거
      .replace(/&nbsp;/g, ' ') // &nbsp; 엔티티를 공백으로
      .replace(/&amp;/g, '&') // &amp; 엔티티를 &로
      .replace(/&lt;/g, '<') // &lt; 엔티티를 <로
      .replace(/&gt;/g, '>') // &gt; 엔티티를 >로
      .replace(/&quot;/g, '"') // &quot; 엔티티를 "로
      .trim();
  } catch (error) {
    console.error('HTML stripping error:', error);
    return html;
  }
}

// URL slug 생성 함수
export function generateSlug(title: string): string {
  if (!title) return '';
  
  try {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w가-힣\s-]/g, '') // 특수문자 제거 (한글, 영문, 숫자, 공백, 하이픈만 유지)
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속된 하이픈을 하나로
      .replace(/^-|-$/g, ''); // 시작과 끝의 하이픈 제거
  } catch (error) {
    console.error('Slug generation error:', error);
    return 'article';
  }
}

// 클래스명 조합 함수 (clsx 대체)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 로컬 스토리지 안전 접근 함수
export function safeLocalStorage() {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  
  try {
    return {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // 저장 실패 시 무시
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // 삭제 실패 시 무시
        }
      },
    };
  } catch {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
}

// 숫자 포맷팅 함수
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
}

// 환경변수 안전 접근 함수
export function getEnvVar(key: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

// 에러 로깅 함수
export function logError(error: any, context: string = 'Unknown') {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }
  
  // 프로덕션에서는 외부 로깅 서비스로 전송
  // 예: Sentry, LogRocket 등
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL 유효성 검사
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 배열 청크 함수
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 객체 깊은 복사
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}