'use client';
import dynamic from 'next/dynamic';

const ShareButtonClient = dynamic(() => import('./ShareButtonClient'), {
  ssr: false,
});

export default ShareButtonClient;