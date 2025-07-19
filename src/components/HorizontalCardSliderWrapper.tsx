'use client';

// Wrapper to dynamically load the heavy HorizontalCardSlider component
import dynamic from 'next/dynamic';
import LoadingSkeleton from './LoadingSkeleton';

const HorizontalCardSlider = dynamic(() => import('./HorizontalCardSlider'), {
  loading: () => <LoadingSkeleton type="cards" />,
  ssr: true
});

export default HorizontalCardSlider;