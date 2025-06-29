import React from 'react';
import Link from 'next/link';

interface TrendItem {
  name: string;
  score: number; // page.tsx의 TrendItem 정의와 일치시킴
  url?: string;
  change?: string;
}

interface KeywordTrendsProps {
  trends: TrendItem[];
}

const KeywordTrends: React.FC<KeywordTrendsProps> = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="p-3 text-center text-gray-500 text-sm">
        인기 키워드가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 제목은 page.tsx에서 관리하므로 여기서는 제거 */}
      <div className="flex flex-wrap gap-2">
        {trends.map((item, idx) => (
          <Link
            key={item.url || item.name || idx}
            href={item.url || `/search?keyword=${encodeURIComponent(item.name)}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors group"
          >
            <span className="group-hover:scale-105 transition-transform">{item.name}</span>
            {item.change && (
              <span
                className={`ml-1.5 text-xs font-semibold ${
                  item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </span>
            )}
            {/* 수치 출력 - 더 작게 표시 */}
            <span className="ml-1.5 text-xs text-gray-500">({item.score})</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default KeywordTrends;