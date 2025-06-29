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

// 필요에 따라 다른 날짜 관련 유틸리티 함수를 추가할 수 있습니다.
/*
export const timeAgo = (dateString: string): string => {
  // 예: "5분 전", "2시간 전", "3일 전" 등을 계산하는 로직
  // ...
};
*/