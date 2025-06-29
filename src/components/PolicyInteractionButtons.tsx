// src/components/PolicyInteractionButtons.tsx - 정책 상호작용 버튼 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { useUser } from '@/contexts/AuthContext';

interface PolicyInteractionButtonsProps {
  policyId: number;
  initialLikeCount?: number;
  initialBookmarkCount?: number;
  initialCommentCount?: number;
  className?: string;
}

export default function PolicyInteractionButtons({
  policyId,
  initialLikeCount = 0,
  initialBookmarkCount = 0,
  initialCommentCount = 0,
  className = ''
}: PolicyInteractionButtonsProps) {
  const user = useUser();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [commentCount] = useState(initialCommentCount);
  
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 사용자의 상호작용 상태 확인
  useEffect(() => {
    if (user?.id) {
      checkUserInteractions();
    }
  }, [user?.id, policyId]);

  const checkUserInteractions = async () => {
    if (!user?.id) return;

    try {
      // 좋아요 상태 확인
      const likeResponse = await fetch(`/api/policies/${policyId}/like?user_id=${user.id}`);
      if (likeResponse.ok) {
        const likeData = await likeResponse.json();
        setIsLiked(likeData.liked);
      }

      // 북마크 상태 확인
      const bookmarkResponse = await fetch(`/api/policies/${policyId}/bookmark?user_id=${user.id}`);
      if (bookmarkResponse.ok) {
        const bookmarkData = await bookmarkResponse.json();
        setIsBookmarked(bookmarkData.bookmarked);
      }
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await fetch(`/api/policies/${policyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      } else {
        const errorData = await response.json();
        alert(errorData.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await fetch(`/api/policies/${policyId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        setBookmarkCount(prev => data.bookmarked ? prev + 1 : prev - 1);
      } else {
        const errorData = await response.json();
        alert(errorData.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '정책 정보 공유',
          url: url,
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우 무시
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      try {
        await navigator.clipboard.writeText(url);
        alert('링크가 클립보드에 복사되었습니다.');
      } catch (error) {
        // 클립보드 API를 지원하지 않는 경우
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('링크가 클립보드에 복사되었습니다.');
      }
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 좋아요 버튼 */}
      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isLiked
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Heart 
          size={18} 
          className={isLiked ? 'fill-current' : ''} 
        />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>

      {/* 북마크 버튼 */}
      <button
        onClick={handleBookmark}
        disabled={bookmarkLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isBookmarked
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Bookmark 
          size={18} 
          className={isBookmarked ? 'fill-current' : ''} 
        />
        <span className="text-sm font-medium">{bookmarkCount}</span>
      </button>

      {/* 댓글 버튼 */}
      <button
        onClick={() => {
          // 댓글 섹션으로 스크롤
          const commentsSection = document.getElementById('comments-section');
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <MessageCircle size={18} />
        <span className="text-sm font-medium">{commentCount}</span>
      </button>

      {/* 공유 버튼 */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <Share2 size={18} />
        <span className="text-sm font-medium">공유</span>
      </button>
    </div>
  );
}