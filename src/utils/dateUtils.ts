// src/utils/dateUtils.ts

/**
 * ISO 8601 형식의 날짜 문자열을 읽기 쉬운 형식으로 포맷합니다.
 * 예: "2023-10-27T10:00:00Z" -> "2023년 10월 27일 오전 10:00"
 * @param dateString 포맷할 날짜 문자열 (ISO 8601)
 * @returns 포맷된 날짜 문자열 또는 "날짜 정보 없음"
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "날짜 정보 없음";
  }
  try {
    const date = new Date(dateString);
    // 날짜가 유효한지 확인
    if (isNaN(date.getTime())) {
      return "잘못된 날짜 형식";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // 오전/오후 표시
    };

    return date.toLocaleDateString('ko-KR', options);
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return "날짜 포맷 오류";
  }
};

/**
 * 날짜를 한국어 형식으로 포맷합니다 (날짜만).
 * 예: "2023-10-27" -> "2023년 10월 27일"
 * @param dateString 포맷할 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
export const formatDateKorean = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "날짜 정보 없음";
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "잘못된 날짜 형식";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleDateString('ko-KR', options);
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return "날짜 포맷 오류";
  }
};

/**
 * 시간 경과를 나타내는 문자열을 반환합니다.
 * @param dateString ISO 8601 형식의 날짜 문자열
 * @returns "방금 전", "5분 전", "2시간 전", "3일 전" 등
 */
export const timeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "방금 전";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    } else {
      return formatDateKorean(dateString);
    }
  } catch (error) {
    console.error("시간 경과 계산 오류:", error);
    return formatDateKorean(dateString);
  }
};