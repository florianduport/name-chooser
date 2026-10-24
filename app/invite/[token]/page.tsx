import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Users } from 'lucide-react';
import { auth } from '@/auth';
import { getInviteMetadata } from '@/lib/tournaments-db';
import { isUuid } from '@/lib/tokens';
import SignInScreen from '@/components/SignInScreen';
import { Button } from '@/components/ui/button';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const invite = await getInviteMetadata(token);
  if (!invite) notFound();
  const session = await auth();
  const callbackUrl = `/invite/${token}`;

  if (!session?.user) {
    return (
      <SignInScreen
        callbackUrl={callbackUrl}
        title="On vous invite à choisir."
        description={`Connectez-vous pour départager la même liste de ${invite.nameCount} prénoms. Votre résultat restera privé entre vous et la personne qui vous invite.`}
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
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em]">À vous de choisir.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Parcourez la même liste de {invite.nameCount} prénoms de {invite.gender === 'girl' ? 'fille' : 'garçon'} et découvrez si vos favoris correspondent.
        </p>
        <Button asChild className="mt-7 h-12 w-full rounded-xl bg-stone-900 text-base text-white hover:bg-stone-800">
          <Link href={`/tournament?invite=${token}`}>
            Commencer le tournoi <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
