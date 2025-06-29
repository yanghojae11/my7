/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 및 ESLint 빌드 오류 무시 (추가)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 성능 최적화
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'swiper'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // 압축 및 최적화
  compress: true,
  poweredByHeader: false,
  
  // 환경 변수
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  
  // 이미지 최적화
  images: {
    domains: ['qfqwqvcmvbyxgzpokkla.supabase.co','api.dicebear.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qfqwqvcmvbyxgzpokkla.supabase.co',
        pathname: '/storage/v1/object/public/:path*',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/8.x/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24시간
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // URL 리라이트 (사이트맵 리라이트 제거)
  async rewrites() {
    return [
      {
        source: '/supabase-images/:path*',
        destination: 'https://qfqwqvcmvbyxgzpokkla.supabase.co/storage/v1/object/public/:path*',
      },
      // RSS 피드만 유지
      {
        source: '/rss.xml',
        destination: '/api/rss',
      },
      // 사이트맵 리라이트 제거 - next-sitemap이 처리하도록 함
    ];
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/supabase-images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  
  // 리다이렉트
  async redirects() {
    return [
      {
        source: '/news/:slug',
        destination: '/article/:slug',
        permanent: true,
      },
      {
        source: '/posts/:slug',
        destination: '/article/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;