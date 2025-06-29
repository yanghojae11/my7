'use client';
import dynamic from 'next/dynamic';

const ArticleReactionsClient = dynamic(() => import('./ArticleReactionsClient'), {
  ssr: false,
});

export default ArticleReactionsClient;