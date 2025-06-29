// src/components/icons/ReactionIcon.tsx
type ReactionType = 'like' | 'sad' | 'angry' | 'surprised' | 'anxious';

const emojiMap: Record<ReactionType, string> = {
  like: '😄',
  sad: '😢',
  angry: '😡',
  surprised: '😮',
  anxious: '😣',
};

export default function ReactionIcon({
  type,
  size = 24,
}: {
  type: ReactionType;
  size?: number;
}) {
  return (
    <span style={{ fontSize: size, display: 'inline-block' }}>
      {emojiMap[type]}
    </span>
  );
}
