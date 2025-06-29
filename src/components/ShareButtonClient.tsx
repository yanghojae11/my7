// src/components/ShareButtonClient.tsx
'use client'; // 이 지시문이 중요합니다!

import { Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ShareButtonClient() {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // 클라이언트 사이드에서만 window.location.href에 접근
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.clipboard && currentUrl) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert('클립보드에 링크가 복사되었습니다!'); // 간단한 알림
      } catch (err) {
        console.error('클립보드 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      }
    } else if (currentUrl) {
      // navigator.clipboard를 사용할 수 없는 구형 브라우저나 환경을 위한 대체 로직 (선택적)
      // 예: 임시 textarea를 만들어 복사
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('클립보드에 링크가 복사되었습니다! (대체 방식)');
      } catch (err) {
        console.error('클립보드 복사 실패 (대체 방식):', err);
        alert('링크 복사에 실패했습니다.');
      }
      document.body.removeChild(textArea);
    }
  };

  if (!currentUrl) {
    // URL을 아직 가져오지 못했거나 서버 사이드 렌더링 중에는 버튼을 비활성화하거나 숨길 수 있습니다.
    return null; 
  }

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      title="링크 복사"
    >
      <Share2 size={18} className="text-gray-600" />
    </button>
  );
}