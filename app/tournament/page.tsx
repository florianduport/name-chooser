'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ModeSelection from '@/components/ModeSelection';
import NameListInput from '@/components/NameListInput';
import TournamentBracket from '@/components/TournamentBracket';
import { Button } from '@/components/ui/button';
import { Gender, TournamentMode } from '@/types';
import { useI18n } from '@/components/LocaleProvider';
import { captureAnalytics } from '@/lib/analytics-client';

type TournamentPhase = 'mode-selection' | 'name-input' | 'tournament' | 'loading';

function TournamentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useI18n();
    const genderParam = searchParams.get('gender');
    const inviteToken = searchParams.get('invite');
    const seededName = searchParams.get('name')?.trim() ?? '';
    const [gender, setGender] = useState<Gender>(genderParam === 'girl' ? 'girl' : 'boy');
    const [phase, setPhase] = useState<TournamentPhase>(inviteToken ? 'loading' : seededName ? 'name-input' : 'mode-selection');
    const [names, setNames] = useState<string[]>([]);
    const [tournamentId, setTournamentId] = useState<string | null>(null);
    const [tournamentMode, setTournamentMode] = useState<TournamentMode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inviteStarted = useRef(false);

    useEffect(() => {
        if (inviteToken) {
            if (inviteStarted.current) return;
            inviteStarted.current = true;
            fetch(`/api/invites/${inviteToken}/accept`, { method: 'POST' })
                .then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) throw new Error(t('tournament.empty'));
                    setGender(data.gender);
                    setNames(data.names);
                    setTournamentId(data.id);
                    setTournamentMode(data.mode);
                    setPhase('tournament');
                    captureAnalytics('invite_accepted', { invite_token: inviteToken });
                    captureAnalytics('duel_started', { mode: data.mode, gender: data.gender, invited: true });
                })
                .catch((error: unknown) => {
                    setError(error instanceof Error ? error.message : t('tournament.empty'));
                    setPhase('mode-selection');
                });
            return;
        }
        if (genderParam !== 'boy' && genderParam !== 'girl') {
            router.replace('/');
        }
    }, [genderParam, inviteToken, router, t]);

    const handleModeSelect = (selectedMode: TournamentMode | 'manage') => {
        setError(null);
        if (selectedMode === 'manage') {
            router.push('/manage');
            return;
        }
        if (selectedMode === 'database') {
            loadNamesFromDatabase();
        } else {
            setPhase('name-input');
        }
    };

    const startTournament = async (
        nameList: string[],
        mode: TournamentMode,
    ) => {
        const response = await fetch('/api/tournaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: nameList, gender, mode }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(t('common.error'));
        }
        setTournamentId(data.id);
        setTournamentMode(mode);
        setNames(nameList);
        setPhase('tournament');
        captureAnalytics('duel_started', { mode, gender, name_count: nameList.length, invited: false });
    };

    const loadNamesFromDatabase = async () => {
        setPhase('loading');
        setError(null);
        try {
            const response = await fetch(`/api/names?gender=${gender}`);
            if (!response.ok) throw new Error(t('manage.empty'));
            const data = await response.json();

            if (data.names && data.names.length > 0) {
                const nameList = data.names.map((n: { name: string }) => n.name);
                await startTournament(nameList, 'database');
            } else {
                throw new Error(t('manage.empty'));
            }
        } catch (error) {
            console.error('Error loading names:', error);
            setError(error instanceof Error ? error.message : t('common.loading'));
            setPhase('mode-selection');
        }
    };

    const handleCustomNamesConfirm = async (customNames: string[], saveNames: boolean) => {
        setError(null);
        try {
            if (saveNames) {
                const responses = await Promise.all(
                    customNames.map((name) =>
                        fetch('/api/names', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, gender }),
                        }),
                    ),
                );
                if (responses.some((response) => !response.ok)) {
                    throw new Error(t('common.loading'));
                }
            }

            await startTournament(customNames, 'custom');
        } catch (error) {
            console.error('Error processing names:', error);
            setError(error instanceof Error ? error.message : t('names.processing'));
        }
    };

    const handleBack = () => {
        if (phase === 'name-input') {
            setPhase('mode-selection');
        } else if (phase === 'tournament') {
            setPhase('mode-selection');
            setNames([]);
            setTournamentId(null);
            setTournamentMode(null);
        } else {
            router.push('/');
        }
    };

    if (phase === 'loading') {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#f7f1e8]">
                <div className="text-center space-y-4">
                    <RefreshCw aria-hidden="true" className="mx-auto size-8 animate-spin text-rose-700" />
                    <p className="text-lg text-stone-700">{t('tournament.preparing')}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-dvh bg-[#f7f1e8] p-3 text-stone-900 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {error && (
                    <div role="alert" className="mx-auto mt-4 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                        {error}
                    </div>
                )}
                {phase === 'mode-selection' && (
                    <div className="flex min-h-[calc(100dvh-1.5rem)] flex-col items-center justify-center gap-2 sm:min-h-[calc(100dvh-3rem)] sm:gap-4">
                        <Button onClick={handleBack} variant="ghost" className="h-10 self-start">
                            <ArrowLeft aria-hidden="true" /> {t('common.back')}
                        </Button>
                        <ModeSelection onModeSelect={handleModeSelect} />
                    </div>
                )}

                {phase === 'name-input' && (
                    <div className="flex min-h-[calc(100dvh-1.5rem)] flex-col items-center justify-center gap-2 sm:min-h-[calc(100dvh-3rem)] sm:gap-4">
                        <Button onClick={handleBack} variant="ghost" className="h-10 self-start">
                            <ArrowLeft aria-hidden="true" /> {t('common.back')}
                        </Button>
                        <NameListInput onConfirm={handleCustomNamesConfirm} gender={gender} initialName={seededName} />
                    </div>
                )}

                {phase === 'tournament' && names.length > 0 && tournamentId && tournamentMode && (
                    <TournamentBracket initialNames={names} gender={gender} tournamentId={tournamentId} mode={tournamentMode} invited={Boolean(inviteToken)} />
                )}
            </div>
        </main>
    );
}

export default function TournamentPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-dvh items-center justify-center bg-[#f7f1e8]">
                <div className="space-y-4 text-center">
                    <RefreshCw aria-hidden="true" className="mx-auto size-8 animate-spin text-rose-700" />
                    <p className="text-lg text-stone-700">LeBabyName</p>
                </div>
            </div>
        }>
            <TournamentContent />
        </Suspense>
    );
}
