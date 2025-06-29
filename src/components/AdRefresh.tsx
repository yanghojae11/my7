'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Trigger a re-scan whenever the route changes
      // @ts-ignore — global injected by AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, [pathname]);

  return null;
}