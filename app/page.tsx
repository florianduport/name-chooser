import { auth } from '@/auth';
import GenderSelection from '@/components/GenderSelection';
import SignInScreen from '@/components/SignInScreen';
import HomeSeoFooter from '@/components/HomeSeoFooter';
import { getRequestLocale } from '@/lib/locale-server';

export default async function Home() {
  const [session, locale] = await Promise.all([auth(), getRequestLocale()]);
  return (
    <>
      {session?.user ? <GenderSelection /> : <SignInScreen />}
      <HomeSeoFooter locale={locale} />
    </>
  );
}
