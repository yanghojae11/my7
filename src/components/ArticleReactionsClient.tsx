'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ThumbsUp,
  Frown,
  Flame,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface ReactionCounts {
  likes: number;
  sads: number;
  angrys: number;
  surpriseds: number;
  uneasys: number;
}

interface ArticleReactionsClientProps {
  articleId: string;
  initialReactions?: Partial<ReactionCounts>;
}

const defaultReactions: ReactionCounts = {
  likes: 0,
  sads: 0,
  angrys: 0,
  surpriseds: 0,
  uneasys: 0,
};

const ArticleReactionsClient: React.FC<ArticleReactionsClientProps> = ({
  articleId,
  initialReactions = {},
}) => {
  const [reactions, setReactions] = useState<ReactionCounts>({
    ...defaultReactions,
    ...initialReactions,
  });
  const [loading, setLoading] = useState(false);

  const handleReaction = async (type: keyof ReactionCounts) => {
    if (loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('reactions')
        .insert([{ article_id: articleId, reaction_type: type }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error.message);
        alert('반응 추가 중 오류가 발생했습니다.');
        return;
      }

      if (!data) {
        console.warn('⚠️ 반응 추가 실패: 응답 데이터 없음. RLS 정책을 확인하세요.');
        alert('반응 추가 실패: 서버 응답이 없습니다.');
        return;
      }

      setReactions((prev) => ({
        ...prev,
        [type]: (prev[type] ?? 0) + 1,
      }));
    } catch (e) {
      console.error('❌ 반응 추가 오류:', e);
      alert('반응 추가 중 예외가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">
        이 기사 어떠셨나요?
      </h2>
      
      {/* 모바일: 2x3 그리드, 태블릿/데스크톱: 1x5 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-around sm:items-center sm:space-x-2 lg:space-x-4">
        <ReactionButton
          label="좋아요"
          icon={<ThumbsUp size={20} className="sm:w-6 sm:h-6" />}
          count={reactions.likes}
          onClick={() => handleReaction('likes')}
          loading={loading}
        />
        <ReactionButton
          label="슬퍼요"
          icon={<Frown size={20} className="sm:w-6 sm:h-6" />}
          count={reactions.sads}
          onClick={() => handleReaction('sads')}
          loading={loading}
        />
        <ReactionButton
          label="화나요"
          icon={<Flame size={20} className="sm:w-6 sm:h-6" />}
          count={reactions.angrys}
          onClick={() => handleReaction('angrys')}
          loading={loading}
        />
        <ReactionButton
          label="놀랐어요"
          icon={<Zap size={20} className="sm:w-6 sm:h-6" />}
          count={reactions.surpriseds}
          onClick={() => handleReaction('surpriseds')}
          loading={loading}
        />
        <div className="col-span-2 sm:col-span-1 flex justify-center sm:block">
          <ReactionButton
            label="찜찜해요"
            icon={<HelpCircle size={20} className="sm:w-6 sm:h-6" />}
            count={reactions.uneasys}
            onClick={() => handleReaction('uneasys')}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

interface ReactionButtonProps {
  label: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
  loading: boolean;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  label,
  icon,
  count,
  onClick,
  loading,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 transition-all duration-200 min-h-[70px] sm:min-h-[80px] touch-manipulation"
    disabled={loading}
  >
    <div className="mb-1">
      {icon}
    </div>
    <span className="text-xs sm:text-sm font-medium text-center leading-tight">
      {label}
      <br />
      <span className="text-gray-500">({count})</span>
    </span>
  </button>
);

export default ArticleReactionsClient;