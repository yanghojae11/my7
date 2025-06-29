'use client';
import dynamic from 'next/dynamic';

const SectionCardList = dynamic(() => import('./SectionCardList'), { ssr: false });

export default SectionCardList;