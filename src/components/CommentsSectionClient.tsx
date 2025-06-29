'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, User, Send } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentsSectionClientProps {
  articleId: string;
  initialComments: Comment[];
}

const CommentsSectionClient: React.FC<CommentsSectionClientProps> = ({
  articleId,
  initialComments,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('익명');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            article_id: articleId,
            comment_text: commentText,
            author_name: authorName,
          },
        ])
        .select()
        .single();

      if (error) {
        alert('댓글 등록 실패');
        console.error(error);
        return;
      }

      // 댓글 즉시 반영
      setComments([
        { ...data },
        ...comments,
      ]);
      setCommentText('');
    } catch (error) {
      console.error('댓글 등록 중 오류:', error);
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mt-6 sm:mt-10">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <MessageCircle size={20} className="text-blue-600" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          댓글 ({comments.length})
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6">
        <div className="space-y-3">
          {/* 이름 입력 */}
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름 (선택)"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          {/* 댓글 내용 입력 */}
          <div className="relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="댓글을 입력하세요 (Ctrl+Enter로 빠른 전송)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {commentText.length}/500
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 hidden sm:block">
              Ctrl+Enter로 빠른 전송
            </p>
            <button
              onClick={handleSubmit}
              disabled={!commentText.trim() || isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isSubmitting ? '등록중...' : '댓글 작성'}
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3 sm:space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p>첫 번째 댓글을 작성해보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow duration-200"
            >
              {/* 댓글 헤더 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={12} className="sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    {comment.author_name || '익명'}
                  </span>
                </div>
                <time className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>

              {/* 댓글 내용 */}
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {comment.comment_text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSectionClient;