// src/app/layout.tsx - 애드센스 스크립트 추가 버전
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import Script from 'next/script';
import AdRefresh from '@/components/AdRefresh';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // 폰트 로딩 최적화
  preload: true,
});

// 환경변수에서 도메인 URL 가져오기
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://my7.co.kr';

export const metadata: Metadata = {
  title: {
    default: 'MY7 정책지원: 정부 정책 및 지원사업 종합 정보',
    template: '%s | MY7 정책지원'
  },
  description: '정부 정책, 지원사업, 보조금, 창업지원, 주택정책, 취업지원, 교육정책, 복지혜택 등 정부 지원 정보를 한눈에 확인하세요. 최신 정책 뉴스와 신청 방법을 제공합니다.',
  keywords: [
    '정부정책', '지원사업', '보조금', '창업지원', 
    '주택정책', '취업지원', '교육정책', '복지혜택', 
    '정부지원금', '정책뉴스', '정책정보', '지원금신청'
  ],
  authors: [{ name: 'MY7 정책지원 편집팀' }],
  creator: 'MY7 정책지원',
  publisher: 'MY7 정책지원',
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'MY7 정책지원',
    title: 'MY7 정책지원: 정부 정책 및 지원사업 종합 정보',
    description: '정부 정책, 지원사업, 보조금, 창업지원, 주택정책, 취업지원, 교육정책, 복지혜택 등 정부 지원 정보를 한눈에 확인하세요.',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MY7 정책지원 - 정부 정책 및 지원사업 정보 플랫폼',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MY7 정책지원: 정부 정책 및 지원사업 종합 정보',
    description: '정부 정책, 지원사업, 보조금, 창업지원, 주택정책, 취업지원, 교육정책, 복지혜택 등 정부 지원 정보를 한눈에 확인하세요.',
    images: [`${SITE_URL}/twitter-image.png`],
    creator: '@my7_policy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Google Search Console 인증 코드
    // yandex: 'your-yandex-verification-code',
    // other: 'your-other-verification-code',
  },
  category: 'government',
  classification: 'Government Services',
};

// JSON-LD 구조화 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MY7 정책지원',
  url: SITE_URL,
  description: '정부 정책 및 지원사업 종합 정보 플랫폼',
  publisher: {
    '@type': 'Organization',
    name: 'MY7 정책지원',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        {/* JSON-LD 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* DNS Prefetch 최적화 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//qfqwqvcmvbyxgzpokkla.supabase.co" />
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon 및 아이콘 - ICO 제거 버전 */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="24x24" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* 성능 최적화 힌트 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1D4ED8" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Google AdSense Auto-Ads */}
        <Script
          id="google-adsense"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1 overflow-x-hidden">
              <AdRefresh />
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
        
        {/* 웹 바이탈 측정 스크립트 (개발 환경에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}