'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Slide 타입 정의
export type Slide = {
  title: string;
  image_url: string;
  tag: string;
  time: string;
  summary: string;
  url: string;
  slug: string;
};

type MainPickSliderProps = {
  items: Slide[];
};

export default function MainPickSlider({ items }: MainPickSliderProps) {
  if (!items?.length) {
    return (
      <section className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl shadow-lg text-gray-500">
        주요 정책 소식을 불러올 수 없습니다.
      </section>
    );
  }

  return (
    <section className="w-full flex justify-center">
      <div className="w-full max-w-screen-xl px-0 sm:px-4">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          loop
          spaceBetween={0}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          className="w-full relative rounded-xl overflow-hidden shadow-md min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:aspect-[21/9]"
        >
          {items.map((slide, idx) => (
            <SwiperSlide
              key={slide.slug || idx}
              className="relative min-h-[300px]"
            >
              {slide.image_url ? (
                slide.image_url.startsWith('/placeholder-') ? (
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 100vw"
                      priority={idx === 0}
                    />
                  </div>
                )
              ) : (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-white text-sm">
                  이미지 없음
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-0" />

              <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 text-black">
                  <div className="mb-2">
                    <span className="text-xs sm:text-sm bg-blue-600 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                      {slide.tag}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-snug drop-shadow-md mb-1 sm:mb-2 line-clamp-2">
                    <Link href={slide.url} className="hover:underline">
                      {slide.title}
                    </Link>
                  </h2>

                  <p className="hidden sm:block text-xs sm:text-sm text-gray-700 drop-shadow-sm line-clamp-2 mb-2">
                    {slide.summary}
                  </p>

                  <div className="text-xs text-gray-600">
                    <span>{slide.time}</span>
                    <Link
                      href={slide.url}
                      className="ml-4 font-medium text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      자세히 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
