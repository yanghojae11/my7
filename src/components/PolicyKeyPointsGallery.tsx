'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface PolicyKeyPointsGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export default function PolicyKeyPointsGallery({ 
  images, 
  title, 
  className = '' 
}: PolicyKeyPointsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType>();

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          핵심 정책 포인트
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-blue-500',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600'
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative group cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={image}
                    alt={`${title} 핵심 포인트 ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-white rounded-full shadow-lg"
                      aria-label="이미지 확대"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600 text-center">
                  포인트 {index + 1}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg z-10"
              aria-label="닫기"
            >
              <ChevronLeft className="w-4 h-4 rotate-45" />
            </button>
            
            <div className="relative">
              <Image
                src={selectedImage}
                alt={`${title} 핵심 포인트 확대`}
                width={800}
                height={500}
                className="rounded-lg max-h-[80vh] w-auto"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}