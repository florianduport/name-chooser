'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  Share2,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createResultImage, ShareImageFormat } from '@/lib/share-image';
import { useI18n } from '@/components/LocaleProvider';

type Panel = 'result' | 'invite' | null;

export default function WinnerActions({
  winner,
  tournamentId,
}: {
  winner: string;
  tournamentId: string;
}) {
  const { locale, t } = useI18n();
  const [panel, setPanel] = useState<Panel>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [invite, setInvite] = useState<{ url: string; compareUrl: string } | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const getResultUrl = async () => {
    if (resultUrl) return resultUrl;
    const response = await fetch(`/api/tournaments/${tournamentId}/share`, { method: 'POST' });
    const data = await response.json();
    if (!response.ok) throw new Error(t('common.error'));
    setResultUrl(data.url);
    return data.url as string;
  };

  const getInvite = async () => {
    if (invite) return invite;
    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(t('common.error'));
    const value = { url: data.url as string, compareUrl: data.compareUrl as string };
    setInvite(value);
    return value;
  };

  const run = async (action: () => Promise<void>) => {
    setIsWorking(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t('common.loading'));
    } finally {
      setIsWorking(false);
    }
  };

  const nativeResultShare = () => run(async () => {
    const url = await getResultUrl();
    const files = await Promise.all([
      createResultImage(winner, 'story', locale),
      createResultImage(winner, 'square', locale),
    ]);
    const shareData = {
      title: t('share.nativeTitle', { winner }),
      text: t('share.nativeText', { winner }),
      url,
      files,
    };
    if (navigator.share && navigator.canShare?.({ files })) {
      await navigator.share(shareData);
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: shareData.title, text: shareData.text, url });
      return;
    }
    downloadFile(files[0]);
    setNotice(t('share.downloadHint'));
  });

  const download = (format: ShareImageFormat, platform?: string) => run(async () => {
    downloadFile(await createResultImage(winner, format, locale));
    setNotice(
      platform
        ? t('share.imageDownloaded', { platform })
        : t('share.imageDownloaded', { platform: format === 'story' ? 'Story' : t('share.square') }),
    );
  });

  const resultWhatsApp = () => run(async () => {
    const url = await getResultUrl();
    const text = `${t('share.nativeText', { winner })} ✨ ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });

  const copyResultLink = () => run(async () => {
    await navigator.clipboard.writeText(await getResultUrl());
    setNotice(t('share.copied'));
  });

  const nativeInviteShare = () => run(async () => {
    const value = await getInvite();
    const data = {
      title: t('invite.nativeTitle'),
      text: t('invite.nativeText'),
      url: value.url,
    };
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(value.url);
      setNotice(t('invite.copied'));
    }
  });

  const inviteWhatsApp = () => run(async () => {
    const value = await getInvite();
    const text = `${t('invite.nativeText')} ✨ ${value.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });

  const copyInviteLink = () => run(async () => {
    const value = await getInvite();
    await navigator.clipboard.writeText(value.url);
    setNotice(t('invite.copied'));
  });

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5">
        <Button onClick={() => setPanel('result')} variant="outline" className="h-11 rounded-xl bg-white">
          <Share2 aria-hidden="true" /> {t('winner.share')}
        </Button>
        <Button onClick={() => setPanel('invite')} variant="outline" className="h-11 rounded-xl bg-white">
          <Users aria-hidden="true" /> {t('winner.invite')}
        </Button>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 flex items-end bg-stone-950/35 p-2 sm:items-center sm:justify-center" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-3xl bg-[#fffaf2] p-5 text-left shadow-2xl sm:max-w-lg sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="share-title" className="font-serif text-3xl tracking-[-0.03em]">
                  {panel === 'result' ? t('share.title') : t('invite.shareTitle')}
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {panel === 'result'
                    ? t('share.subtitle')
                    : t('invite.shareSubtitle')}
                </p>
              </div>
              <Button variant="ghost" size="icon-lg" onClick={() => setPanel(null)} aria-label={t('common.close')}>
                <X aria-hidden="true" />
              </Button>
            </div>

            {panel === 'result' ? (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button disabled={isWorking} onClick={nativeResultShare} className="col-span-2 h-12 bg-stone-900 text-white hover:bg-stone-800">
                  <Share2 aria-hidden="true" /> {t('share.system')}
                </Button>
                <Button disabled={isWorking} onClick={resultWhatsApp} variant="outline" className="h-11 bg-white">
                  <MessageCircle aria-hidden="true" /> WhatsApp
                </Button>
                <Button disabled={isWorking} onClick={copyResultLink} variant="outline" className="h-11 bg-white">
                  <Copy aria-hidden="true" /> {t('share.copy')}
                </Button>
                <Button disabled={isWorking} onClick={() => download('story', 'Instagram')} variant="outline" className="h-11 bg-white">Instagram</Button>
                <Button disabled={isWorking} onClick={() => download('story', 'TikTok')} variant="outline" className="h-11 bg-white">TikTok</Button>
                <Button disabled={isWorking} onClick={() => download('story', 'Snapchat')} variant="outline" className="h-11 bg-white">Snapchat</Button>
                <Button disabled={isWorking} onClick={() => download('square')} variant="outline" className="h-11 bg-white">
                  <Download aria-hidden="true" /> {t('share.square')}
                </Button>
                <p className="col-span-2 mt-1 text-xs leading-5 text-stone-500">
                  {t('share.downloadHint')}
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button disabled={isWorking} onClick={nativeInviteShare} className="col-span-2 h-12 bg-stone-900 text-white hover:bg-stone-800">
                  <Share2 aria-hidden="true" /> {t('invite.system')}
                </Button>
                <Button disabled={isWorking} onClick={inviteWhatsApp} variant="outline" className="h-11 bg-white">
                  <MessageCircle aria-hidden="true" /> WhatsApp
                </Button>
                <Button disabled={isWorking} onClick={copyInviteLink} variant="outline" className="h-11 bg-white">
                  <Copy aria-hidden="true" /> {t('invite.copy')}
                </Button>
                {invite && (
                  <Button asChild variant="outline" className="col-span-2 h-11 bg-white">
                    <Link href={invite.compareUrl}>
                      <ExternalLink aria-hidden="true" /> {t('invite.responses')}
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {notice && <p role="status" className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-stone-700">{notice}</p>}
          </section>
        </div>
      )}
    </>
  );
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
