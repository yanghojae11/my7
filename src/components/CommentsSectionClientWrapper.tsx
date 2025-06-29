'use client';
import dynamic from 'next/dynamic';

const CommentsSectionClient = dynamic(() => import('./CommentsSectionClient'), {
  ssr: false,
});

export default CommentsSectionClient;