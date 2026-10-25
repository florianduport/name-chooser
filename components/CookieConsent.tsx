'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/components/LocaleProvider';

const COPY = {
  fr: {
    text: 'LeBabyName utilise des cookies facultatifs pour mesurer l’usage et, si activée, afficher de la publicité. Le duel fonctionne de la même façon dans tous les cas.',
    refuse: 'Refuser',
    accept: 'Accepter les cookies facultatifs',
    label: 'Préférences de cookies',
  },
  'en-GB': {
    text: 'LeBabyName uses optional cookies to measure usage and, when enabled, show advertising. The duel works exactly the same either way.',
    refuse: 'Refuse',
    accept: 'Accept optional cookies',
    label: 'Cookie preferences',
  },
  'en-US': {
    text: 'LeBabyName uses optional cookies to measure usage and, when enabled, show advertising. The matchup works exactly the same either way.',
    refuse: 'Decline',
    accept: 'Accept optional cookies',
    label: 'Cookie preferences',
  },
  es: {
    text: 'LeBabyName usa cookies opcionales para medir el uso y, si se activa, mostrar publicidad. Los duelos funcionan igual en cualquier caso.',
    refuse: 'Rechazar',
    accept: 'Aceptar cookies opcionales',
    label: 'Preferencias de cookies',
  },
  pt: {
    text: 'A LeBabyName usa cookies opcionais para medir a utilização e, quando ativada, mostrar publicidade. O duelo funciona da mesma forma em qualquer caso.',
    refuse: 'Recusar',
    accept: 'Aceitar cookies opcionais',
    label: 'Preferências de cookies',
  },
  it: {
    text: 'LeBabyName usa cookie facoltativi per misurare l’utilizzo e, se attivata, mostrare pubblicità. Il duello funziona allo stesso modo in ogni caso.',
    refuse: 'Rifiuta',
    accept: 'Accetta cookie facoltativi',
    label: 'Preferenze cookie',
  },
};

export default function CookieConsent({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);
  const { locale } = useI18n();
  const copy = COPY[locale];

  useEffect(() => {
    if (
      enabled &&
      !localStorage.getItem('lebabyname-cookie-consent') &&
      !localStorage.getItem('lebabyname-ad-consent')
    ) setVisible(true);
  }, [enabled]);

  if (!visible) return null;
  const decide = (value: 'granted' | 'denied') => {
    localStorage.setItem('lebabyname-cookie-consent', value);
    window.dispatchEvent(new Event('lebabyname-consent'));
    setVisible(false);
  };

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_18px_55px_-22px_rgba(28,25,23,0.45)]"
      aria-label={copy.label}
    >
      <p className="text-sm leading-6 text-stone-700">
        {copy.text}
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => decide('denied')} className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500">
          {copy.refuse}
        </button>
        <button type="button" onClick={() => decide('granted')} className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-rose-700/30">
          {copy.accept}
        </button>
      </div>
    </aside>
  );
}
