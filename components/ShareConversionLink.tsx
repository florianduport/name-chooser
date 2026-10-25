'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { captureAnalytics } from '@/lib/analytics-client';
import { trackDatabaseEvent } from '@/components/EventTracker';

export default function ShareConversionLink({
  href,
  label,
  shareToken,
  locale,
}: {
  href: string;
  label: string;
  shareToken: string;
  locale: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        captureAnalytics('shared_result_conversion', { share_token: shareToken });
        trackDatabaseEvent('shared_result_conversion', { shareToken, locale });
      }}
      className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-700/30"
    >
      <Heart aria-hidden="true" className="size-4" /> {label}
    </Link>
  );
}
