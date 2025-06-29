'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';

interface CopyLinkButtonProps {
  url: string;
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      aria-label="링크 복사"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <Copy
        className={`w-5 h-5 ${
          copied ? 'text-emerald-500' : 'hover:text-emerald-500'
        }`}
      />
    </button>
  );
}

