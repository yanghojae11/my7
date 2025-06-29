// src/components/PerformanceMonitor.tsx - 성능 모니터링
'use client';

import { useEffect } from 'react';

interface WebVital {
  name: string;
  value: number;
  delta: number;
  id: string;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Web Vitals 측정
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        const logVital = (vital: WebVital) => {
          console.log(`[Web Vital] ${vital.name}:`, vital.value);
          
          // 프로덕션에서는 분석 서비스로 전송
          // 예: analytics.track('web-vital', vital);
        };

        getCLS(logVital);
        getFID(logVital);
        getFCP(logVital);
        getLCP(logVital);
        getTTFB(logVital);
      });
    }
  }, []);

  return null;
}