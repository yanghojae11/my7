// src/components/OptimizedImage.tsx - 이미지 최적화 컴포넌트
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

// URL validation helper
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  
  // Check for valid URL pattern
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Allow common image domains and local paths
    return url.startsWith('/') || 
           url.startsWith('data:image/') ||
           ['localhost', 'qfqwqvcmvbyxgzpokkla.supabase.co', 'unsplash.com', 'pexels.com', 'cloudinary.com', 'dicebear.com'].some(domain => 
             urlObj.hostname.includes(domain)
           );
  } catch {
    return url.startsWith('/'); // Allow local paths
  }
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = '100vw',
  fallbackSrc = '/placeholder-card.jpg',
}: OptimizedImageProps) {
  // Validate and sanitize initial src
  const validatedSrc = isValidImageUrl(src) ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState(validatedSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(!isValidImageUrl(src));

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    console.warn(`[OptimizedImage] Failed to load image: ${imgSrc}`);
    if (imgSrc !== fallbackSrc && isValidImageUrl(fallbackSrc)) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      // If fallback also fails, show a placeholder div
      setHasError(true);
    }
    setIsLoading(false);
  };

  // 🔧 수정: 이미지 props를 분리하여 조건부 전달
  const imageProps: any = {
    src: imgSrc,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      hasError ? 'filter grayscale' : '',
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality: 85,
    loading: priority ? 'eager' : 'lazy',
  };

  // fill과 width/height를 조건적으로 추가
  if (fill) {
    imageProps.fill = true;
  } else {
    imageProps.width = width;
    imageProps.height = height;
  }
  imageProps.sizes = sizes;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      {hasError && imgSrc === fallbackSrc ? (
        // Ultimate fallback when even placeholder fails
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 text-gray-300" aria-label="이미지 없음">📷</div>
            <div>이미지 없음</div>
          </div>
        </div>
      ) : (
        <Image {...imageProps} />
      )}
    </div>
  );
}