// src/components/LoadingSkeleton.tsx
'use client';

interface LoadingSkeletonProps {
  type: 'slider' | 'cards' | 'ranking' | 'feed' | 'keywords';
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  const baseSkeletonClass = "animate-pulse bg-gray-200 rounded";

  switch (type) {
    case 'slider':
      return (
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-lg">슬라이더 로딩 중...</div>
        </div>
      );

    case 'cards':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className={`${baseSkeletonClass} w-full aspect-[16/9]`} />
              <div className="p-4 space-y-3">
                <div className={`${baseSkeletonClass} h-4 w-20`} />
                <div className={`${baseSkeletonClass} h-5 w-full`} />
                <div className={`${baseSkeletonClass} h-5 w-3/4`} />
                <div className={`${baseSkeletonClass} h-4 w-full`} />
                <div className={`${baseSkeletonClass} h-4 w-2/3`} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'ranking':
      return (
        <div className="space-y-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`${baseSkeletonClass} w-6 h-6 rounded-full`} />
              <div className={`${baseSkeletonClass} w-16 h-12 rounded`} />
              <div className="flex-1 space-y-2">
                <div className={`${baseSkeletonClass} h-4 w-full`} />
                <div className={`${baseSkeletonClass} h-4 w-2/3`} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'feed':
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`${baseSkeletonClass} w-full sm:w-24 h-40 sm:h-24 rounded`} />
              <div className="flex-1 space-y-2">
                <div className={`${baseSkeletonClass} h-3 w-16`} />
                <div className={`${baseSkeletonClass} h-4 w-full`} />
                <div className={`${baseSkeletonClass} h-4 w-3/4`} />
                <div className={`${baseSkeletonClass} h-3 w-20`} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'keywords':
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div 
              key={i} 
              className={`${baseSkeletonClass} h-8 rounded-full`}
              style={{ width: `${Math.random() * 60 + 40}px` }}
            />
          ))}
        </div>
      );

    default:
      return (
        <div className={`${baseSkeletonClass} w-full h-32 flex items-center justify-center`}>
          <div className="text-gray-400">로딩 중...</div>
        </div>
      );
  }
}