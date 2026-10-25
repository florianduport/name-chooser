import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Users } from 'lucide-react';
import { auth } from '@/auth';
import { getInviteMetadata } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import SignInScreen from '@/components/SignInScreen';
import { Button } from '@/components/ui/button';
import { translate } from '@/lib/i18n';
import { getPageLocale } from '@/lib/page-locale';

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = await getPageLocale(searchParams);
  const title = translate(locale, 'invite.nativeTitle');
  const description = translate(locale, 'invite.signInDescription');
  const image = `/api/og?lang=${encodeURIComponent(locale)}&kind=invite`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const invite = await getInviteMetadata(token);
  if (!invite) notFound();
  const session = await auth();
  const locale = await getPageLocale(searchParams);
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) =>
    translate(locale, key, values);
  const callbackUrl = `/invite/${token}?lang=${locale}`;

  if (!session?.user) {
    return (
      <SignInScreen
        callbackUrl={callbackUrl}
        title={t('invite.signInTitle')}
        description={t('invite.signInDescription')}
      />
    );
  }

  return (
    <main className="flex min-h-dvh items-center bg-[#f7f1e8] px-4 py-6 text-stone-900">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 p-6 text-center shadow-[0_24px_80px_-36px_rgba(77,48,38,0.45)] sm:p-9">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-sky-100 text-sky-800">
          <Users aria-hidden="true" />
        </div>
        <p className="mt-3 font-serif text-lg font-semibold tracking-[-0.03em]">LeBabyName</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">{t('invite.title')}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {t('invite.description', { count: invite.nameCount })}
        </p>
        <Button asChild className="mt-7 h-12 w-full rounded-xl bg-stone-900 text-base text-white hover:bg-stone-800">
          <Link href={`/tournament?invite=${token}&lang=${locale}`}>
            {t('invite.start')} <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
