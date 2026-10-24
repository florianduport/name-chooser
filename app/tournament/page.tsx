'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ModeSelection from '@/components/ModeSelection';
import NameListInput from '@/components/NameListInput';
import TournamentBracket from '@/components/TournamentBracket';
import { Button } from '@/components/ui/button';
import { Gender, TournamentMode } from '@/types';

type TournamentPhase = 'mode-selection' | 'name-input' | 'tournament' | 'loading';

function TournamentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const genderParam = searchParams.get('gender');
    const gender: Gender = genderParam === 'girl' ? 'girl' : 'boy';
    const [phase, setPhase] = useState<TournamentPhase>('mode-selection');
    const [names, setNames] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (genderParam !== 'boy' && genderParam !== 'girl') {
            router.replace('/');
        }
    }, [genderParam, router]);

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

    const loadNamesFromDatabase = async () => {
        setPhase('loading');
        setError(null);
        try {
            let response = await fetch(`/api/names?gender=${gender}`);
            if (!response.ok) throw new Error('Impossible de lire les prénoms enregistrés.');
            let data = await response.json();

            if (!data.names?.length) {
                const seedResponse = await fetch('/api/names/seed', { method: 'POST' });
                if (!seedResponse.ok) {
                    throw new Error('Impossible d’initialiser la sélection de prénoms.');
                }
                response = await fetch(`/api/names?gender=${gender}`);
                if (!response.ok) throw new Error('Impossible de lire les prénoms enregistrés.');
                data = await response.json();
            }

            if (data.names && data.names.length > 0) {
                const nameList = data.names.map((n: { name: string }) => n.name);
                setNames(nameList);
                setPhase('tournament');
            } else {
                throw new Error('Aucun prénom n’est disponible. Ajoutez-en depuis la page de gestion.');
            }
        } catch (error) {
            console.error('Error loading names:', error);
            setError(error instanceof Error ? error.message : 'Le chargement a échoué.');
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
                    throw new Error('Certains prénoms n’ont pas pu être enregistrés. Réessayez.');
                }
            }

            setNames(customNames);
            setPhase('tournament');
        } catch (error) {
            console.error('Error processing names:', error);
            setError(error instanceof Error ? error.message : 'La préparation du tournoi a échoué.');
        }
    };

    const handleBack = () => {
        if (phase === 'name-input') {
            setPhase('mode-selection');
        } else if (phase === 'tournament') {
            setPhase('mode-selection');
            setNames([]);
        } else {
            router.push('/');
        }
    };

    if (phase === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
                <div className="text-center space-y-4">
                    <RefreshCw aria-hidden="true" className="mx-auto size-8 animate-spin text-rose-700" />
                    <p className="text-lg text-stone-700">Préparation de votre tournoi…</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f1e8] p-4 text-stone-900 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {error && (
                    <div role="alert" className="mx-auto mt-4 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                        {error}
                    </div>
                )}
                {phase === 'mode-selection' && (
                    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                        <Button onClick={handleBack} variant="ghost" className="self-start">
                            <ArrowLeft aria-hidden="true" /> Retour
                        </Button>
                        <ModeSelection onModeSelect={handleModeSelect} gender={gender} />
                    </div>
                )}

                {phase === 'name-input' && (
                    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                        <Button onClick={handleBack} variant="ghost" className="self-start">
                            <ArrowLeft aria-hidden="true" /> Retour
                        </Button>
                        <NameListInput onConfirm={handleCustomNamesConfirm} gender={gender} />
                    </div>
                )}

                {phase === 'tournament' && names.length > 0 && (
                    <TournamentBracket initialNames={names} gender={gender} />
                )}
            </div>
        </main>
    );
}

export default function TournamentPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
                <div className="space-y-4 text-center">
                    <RefreshCw aria-hidden="true" className="mx-auto size-8 animate-spin text-rose-700" />
                    <p className="text-lg text-stone-700">Chargement…</p>
                </div>
            </div>
        }>
            <TournamentContent />
        </Suspense>
    );
}
