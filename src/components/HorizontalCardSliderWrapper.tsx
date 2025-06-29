'use client';

// Wrapper to dynamically load the heavy HorizontalCardSlider component
import dynamic from 'next/dynamic';

const HorizontalCardSlider = dynamic(() => import('./HorizontalCardSlider'), {
  ssr: false,
});

export default HorizontalCardSlider;