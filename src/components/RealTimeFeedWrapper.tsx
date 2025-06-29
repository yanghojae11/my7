'use client';
import dynamic from 'next/dynamic';

const RealTimeFeed = dynamic(() => import('./RealTimeFeed'), { ssr: false });

export default RealTimeFeed;