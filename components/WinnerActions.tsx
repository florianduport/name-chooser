'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { sharePreparedFile } from '@/lib/native-file-share';
import PushOptIn from '@/components/PushOptIn';
import AffiliateBlock from '@/components/AffiliateBlock';
import { captureAnalytics } from '@/lib/analytics-client';
import { trackDatabaseEvent } from '@/components/EventTracker';

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
  const [isPreparing, setIsPreparing] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [squareFile, setSquareFile] = useState<File | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  const prepareResultShare = useCallback(async () => {
    if (storyFile && squareFile && resultUrl) return;
    setIsPreparing(true);
    setNotice(null);
    try {
      const [url, story, square] = await Promise.all([
        resultUrl
          ? Promise.resolve(resultUrl)
          : fetch(`/api/tournaments/${tournamentId}/share`, { method: 'POST' })
              .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(t('common.error'));
                return data.url as string;
              }),
        storyFile
          ? Promise.resolve(storyFile)
          : createResultImage(winner, 'story', locale),
        squareFile
          ? Promise.resolve(squareFile)
          : createResultImage(winner, 'square', locale),
      ]);
      setResultUrl(url);
      setStoryFile(story);
      setSquareFile(square);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setIsPreparing(false);
    }
  }, [
    locale,
    resultUrl,
    squareFile,
    storyFile,
    t,
    tournamentId,
    winner,
  ]);

  useEffect(() => {
    if (panel !== 'result') return;
    const timer = window.setTimeout(prepareResultShare, 0);
    return () => window.clearTimeout(timer);
  }, [panel, prepareResultShare]);

  const dismissPushPrompt = useCallback(() => setShowPushPrompt(false), []);

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

  const shareStory = (platform?: string) => {
    if (!storyFile || !resultUrl) return;
    setNotice(null);
    const sharePromise = sharePreparedFile(
      navigator,
      storyFile,
      t('share.nativeText', { winner }),
      resultUrl,
    );
    if (sharePromise) {
      captureAnalytics('result_shared', { channel: 'native', winner });
      trackDatabaseEvent('result_shared', {
        tournamentId,
        locale,
        metadata: { channel: 'native' },
      });
      sharePromise.catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          setNotice(t('common.error'));
        }
      });
      return;
    }
    downloadFile(storyFile);
    captureAnalytics('result_shared', { channel: platform ?? 'download', winner });
    trackDatabaseEvent('result_shared', {
      tournamentId,
      locale,
      metadata: { channel: platform ?? 'download' },
    });
    setNotice(
      platform
        ? t('share.imageDownloaded', { platform })
        : t('share.downloadHint'),
    );
  };

  const download = (format: ShareImageFormat) => {
    const file = format === 'story' ? storyFile : squareFile;
    if (!file) return;
    downloadFile(file);
    captureAnalytics('result_shared', { channel: `${format}_download`, winner });
    trackDatabaseEvent('result_shared', {
      tournamentId,
      locale,
      metadata: { channel: `${format}_download` },
    });
    setNotice(
      t('share.imageDownloaded', {
        platform: format === 'story' ? 'Story' : t('share.square'),
      }),
    );
  };

  const resultWhatsApp = () => {
    if (!resultUrl) return;
    const text = `${t('share.nativeText', { winner })} ✨ ${resultUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    captureAnalytics('result_shared', { channel: 'whatsapp', winner });
    trackDatabaseEvent('result_shared', {
      tournamentId,
      locale,
      metadata: { channel: 'whatsapp' },
    });
  };

  const copyResultLink = () => run(async () => {
    if (!resultUrl) return;
    await navigator.clipboard.writeText(resultUrl);
    captureAnalytics('result_shared', { channel: 'copy_link', winner });
    trackDatabaseEvent('result_shared', {
      tournamentId,
      locale,
      metadata: { channel: 'copy_link' },
    });
    setNotice(t('share.copied'));
  });

  const nativeInviteShare = () => run(async () => {
    const value = await getInvite();
    let channel = 'copy_link';
    const data = {
      title: t('invite.nativeTitle'),
      text: t('invite.nativeText'),
      url: value.url,
    };
    if (navigator.share) {
      await navigator.share(data);
      channel = 'native';
      captureAnalytics('invite_sent', { channel: 'native' });
    } else {
      await navigator.clipboard.writeText(value.url);
      captureAnalytics('invite_sent', { channel: 'copy_link' });
      setNotice(t('invite.copied'));
    }
    setShowPushPrompt(true);
    trackDatabaseEvent('invite_shared', {
      tournamentId,
      locale,
      metadata: { channel },
    });
  });

  const inviteWhatsApp = () => run(async () => {
    const value = await getInvite();
    const text = `${t('invite.nativeText')} ✨ ${value.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setShowPushPrompt(true);
    captureAnalytics('invite_sent', { channel: 'whatsapp' });
    trackDatabaseEvent('invite_shared', {
      tournamentId,
      locale,
      metadata: { channel: 'whatsapp' },
    });
  });

  const copyInviteLink = () => run(async () => {
    const value = await getInvite();
    await navigator.clipboard.writeText(value.url);
    setShowPushPrompt(true);
    captureAnalytics('invite_sent', { channel: 'copy_link' });
    trackDatabaseEvent('invite_shared', {
      tournamentId,
      locale,
      metadata: { channel: 'copy_link' },
    });
    setNotice(t('invite.copied'));
  });

  return (
    <>
      <div className="mt-3 grid gap-2 sm:mt-5">
        <Button onClick={() => setPanel('invite')} className="h-12 rounded-xl bg-rose-700 text-white hover:bg-rose-800">
          <Users aria-hidden="true" /> {t('winner.invitePartner')}
        </Button>
        <Button onClick={() => setPanel('result')} variant="outline" className="h-11 rounded-xl bg-white">
          <Share2 aria-hidden="true" /> {t('winner.share')}
        </Button>
      </div>
      <AffiliateBlock name={winner} locale={locale} />

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
                <Button disabled={isWorking || isPreparing || !storyFile || !resultUrl} onClick={() => shareStory()} className="col-span-2 h-12 bg-stone-900 text-white hover:bg-stone-800">
                  <Share2 aria-hidden="true" /> {t('share.system')}
                </Button>
                <Button disabled={isWorking || isPreparing || !resultUrl} onClick={resultWhatsApp} variant="outline" className="h-11 bg-white">
                  <MessageCircle aria-hidden="true" /> WhatsApp
                </Button>
                <Button disabled={isWorking || isPreparing || !resultUrl} onClick={copyResultLink} variant="outline" className="h-11 bg-white">
                  <Copy aria-hidden="true" /> {t('share.copy')}
                </Button>
                <Button disabled={isWorking || isPreparing || !storyFile || !resultUrl} onClick={() => shareStory('Instagram')} variant="outline" className="h-11 bg-white">Instagram</Button>
                <Button disabled={isWorking || isPreparing || !storyFile || !resultUrl} onClick={() => shareStory('TikTok')} variant="outline" className="h-11 bg-white">TikTok</Button>
                <Button disabled={isWorking || isPreparing || !storyFile || !resultUrl} onClick={() => shareStory('Snapchat')} variant="outline" className="h-11 bg-white">Snapchat</Button>
                <Button disabled={isWorking || isPreparing || !squareFile} onClick={() => download('square')} variant="outline" className="h-11 bg-white">
                  <Download aria-hidden="true" /> {t('share.square')}
                </Button>
                <p className="col-span-2 mt-1 text-xs leading-5 text-stone-500">
                  {t('share.downloadHint')}
                </p>
                {isPreparing && (
                  <p className="col-span-2 text-center text-xs text-stone-500" role="status">
                    {t('names.processing')}
                  </p>
                )}
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
                {showPushPrompt && <PushOptIn onDismiss={dismissPushPrompt} />}
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
