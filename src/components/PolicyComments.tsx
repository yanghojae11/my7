// src/components/PolicyComments.tsx - 정책 댓글 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { MessageCircle, Reply, Send, User } from 'lucide-react';
import { PolicyComment } from '@/types/policy';

interface PolicyCommentsProps {
  policyId: number;
  className?: string;
}

export default function PolicyComments({ policyId, className = '' }: PolicyCommentsProps) {
  const user = useUser();
  
  const [comments, setComments] = useState<PolicyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [policyId]);

  const fetchComments = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      
      const response = await fetch(`/api/policies/${policyId}/comments?page=${pageNum}&per_page=10`);
      if (response.ok) {
        const data = await response.json();
        
        if (pageNum === 1) {
          setComments(data.data);
        } else {
          setComments(prev => [...prev, ...data.data]);
        }
        
        setHasMore(data.has_next);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (content: string, parentId?: number) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/policies/${policyId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId,
        }),
      });

      if (response.ok) {
        alert('댓글이 작성되었습니다. 승인 후 표시됩니다.');
        
        // 폼 초기화
        if (parentId) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
        
        // 댓글 목록 새로고침
        fetchComments(1);
      } else {
        const errorData = await response.json();
        alert(errorData.error || '댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = () => {
    submitComment(newComment);
  };

  const handleSubmitReply = (parentId: number) => {
    submitComment(replyContent, parentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment: PolicyComment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {comment.user?.avatar_url ? (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.full_name || comment.user.username || '사용자'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {comment.user?.full_name || comment.user?.username || '익명 사용자'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            
            {!isReply && (
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Reply size={14} />
                  답글
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 답글 작성 폼 */}
        {replyingTo === comment.id && (
          <div className="mt-4 pl-11">
            <div className="flex gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 작성해주세요..."
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                maxLength={1000}
              />
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={submitting || !replyContent.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 답글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div id="comments-section" className={`${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            댓글 {comments.length}개
          </h3>
        </div>

        {/* 새 댓글 작성 */}
        {user ? (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="내 프로필"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 작성해주세요..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  maxLength={1000}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/1000
                  </span>
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {submitting ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
          </div>
        )}

        {/* 댓글 목록 */}
        {loading && page === 1 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 text-sm">댓글을 불러오는 중...</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
            
            {/* 더 보기 버튼 */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => fetchComments(page + 1)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? '로딩 중...' : '댓글 더 보기'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-sm">아직 댓글이 없습니다.</p>
            <p className="text-gray-500 text-xs mt-1">첫 번째 댓글을 작성해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}