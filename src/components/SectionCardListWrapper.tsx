'use client';
import dynamic from 'next/dynamic';
import LoadingSkeleton from './LoadingSkeleton';

const SectionCardList = dynamic(() => import('./SectionCardList'), { 
  loading: () => <LoadingSkeleton type="cards" />,
  ssr: true
});

export default SectionCardList;