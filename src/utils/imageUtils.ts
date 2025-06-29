// src/utils/imageUtils.ts

/**
 * 기사 이미지 URL을 처리하여 표시 가능한 단일 URL로 변환합니다.
 * 
 * @param imageUrl 배열 또는 단일 문자열로 된 이미지 URL
 * @returns 표시할 이미지 URL
 */
export function getArticleImageUrl(
  imageUrl: string | string[] | null | undefined
): string {
  // undefined, null 또는 빈 배열/문자열인 경우 기본 이미지 반환
  if (!imageUrl) {
    return '/placeholder-card.jpg';
  }
  
  // 배열인 경우 첫 번째 항목 사용
  if (Array.isArray(imageUrl)) {
    return imageUrl.length > 0 ? imageUrl[0] : '/placeholder-card.jpg';
  }
  
  // 문자열인데 배열 형태로 저장된 경우 (JSON 문자열)
  if (typeof imageUrl === 'string' && imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
    try {
      const parsedUrl = JSON.parse(imageUrl);
      if (Array.isArray(parsedUrl) && parsedUrl.length > 0) {
        return parsedUrl[0];
      }
      return '/placeholder-card.jpg';
    } catch (e) {
      console.error('Failed to parse image URL array:', e);
      return '/placeholder-card.jpg';
    }
  }
  
  return imageUrl;
}

/**
 * 프로필 이미지 URL을 처리합니다.
 * DiceBear API를 통해 생성된 SVG 이미지 포함
 * 
 * @param avatarUrl 프로필 이미지 URL
 * @returns 표시할 프로필 이미지 URL
 */
export function getProfileImageUrl(
  avatarUrl: string | null | undefined
): string {
  if (!avatarUrl) {
    return '/placeholder-thumb.jpg';
  }
  
  // DiceBear 이미지인 경우 그대로 사용
  if (avatarUrl.includes('api.dicebear.com')) {
    return avatarUrl;
  }
  
  return avatarUrl;
}