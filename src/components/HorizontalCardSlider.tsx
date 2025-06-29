'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';
import Link from 'next/link';

export interface HorizontalCard {
  title: string;
  image: string;
  url: string;
  tag?: string;
}

interface HorizontalCardSliderProps {
  cards: HorizontalCard[];
}

export default function HorizontalCardSlider({ cards }: HorizontalCardSliderProps) {
  if (!cards || cards.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">표시할 기사가 없습니다.</div>
    );
  }

  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={16}
      slidesPerView={1.1}
      breakpoints={{
        640: { slidesPerView: 2.1 },
        768: { slidesPerView: 3.1 },
        1024: { slidesPerView: 4.1 },
      }}
      className="pb-6"
    >
      {cards.map((card, idx) => (
        <SwiperSlide key={idx} className="h-auto">
          <Link href={card.url} className="block group h-full">
            <article className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 flex flex-col flex-grow">
                {card.tag && (
                  <span className="inline-block mb-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {card.tag}
                  </span>
                )}
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 flex-grow">
                  {card.title}
                </h3>
              </div>
            </article>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}