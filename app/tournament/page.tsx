'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ModeSelection from '@/components/ModeSelection';
import NameListInput from '@/components/NameListInput';
import TournamentBracket from '@/components/TournamentBracket';
import { Button } from '@/components/ui/button';
import { Gender, TournamentMode } from '@/types';

type TournamentPhase = 'mode-selection' | 'name-input' | 'tournament' | 'loading';

function TournamentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const gender = (searchParams.get('gender') as Gender) || 'boy';
    const [phase, setPhase] = useState<TournamentPhase>('mode-selection');
    const [mode, setMode] = useState<TournamentMode | null>(null);
    const [names, setNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (gender !== 'boy' && gender !== 'girl') {
            router.push('/');
        }
    }, [gender, router]);

    const handleModeSelect = (selectedMode: TournamentMode | 'manage') => {
        if (selectedMode === 'manage') {
            router.push('/manage');
            return;
        }
        setMode(selectedMode);
        if (selectedMode === 'database') {
            loadNamesFromDatabase();
        } else {
            setPhase('name-input');
        }
    };

    const loadNamesFromDatabase = async () => {
        setIsLoading(true);
        setPhase('loading');
        try {
            // Vérifier si la base est initialisée
            const initCheck = await fetch('/api/names/init');
            const initData = await initCheck.json();

            if (!initData.initialized) {
                // Initialiser la base de données
                const seedResponse = await fetch('/api/names/seed', { method: 'POST' });
                if (!seedResponse.ok) {
                    throw new Error('Erreur lors de l\'initialisation');
                }
            }

            const response = await fetch(`/api/names?gender=${gender}`);
            const data = await response.json();
            if (data.names && data.names.length > 0) {
                const nameList = data.names.map((n: { name: string }) => n.name);
                setNames(nameList);
                setPhase('tournament');
            } else {
                alert('Aucun prénom trouvé dans la base de données');
                setPhase('mode-selection');
            }
        } catch (error) {
            console.error('Error loading names:', error);
            alert('Erreur lors du chargement des noms');
            setPhase('mode-selection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomNamesConfirm = async (customNames: string[]) => {
        setIsLoading(true);
        try {
            // Vérifier quels noms existent déjà dans la base
            const response = await fetch('/api/names/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ names: customNames, gender }),
            });

            const data = await response.json();

            // Si certains noms n'existent pas, proposer de les ajouter
            if (data.newNames && data.newNames.length > 0) {
                const shouldAdd = confirm(
                    `${data.newNames.length} prénom(s) n'existent pas dans la base de données. Souhaitez-vous les ajouter ?`
                );

                if (shouldAdd) {
                    // Ajouter les nouveaux noms
                    for (const name of data.newNames) {
                        await fetch('/api/names', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, gender }),
                        });
                    }
                }
            }

            setNames(customNames);
            setPhase('tournament');
        } catch (error) {
            console.error('Error processing names:', error);
            alert('Erreur lors du traitement des noms');
        } finally {
            setIsLoading(false);
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
                <div className="text-center space-y-4">
                    <div className="text-4xl animate-bounce">⏳</div>
                    <p className="text-xl">Chargement des prénoms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
            <div className="max-w-4xl mx-auto">
                {phase === 'mode-selection' && (
                    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                        <Button onClick={handleBack} variant="ghost" className="self-start">
                            ← Retour
                        </Button>
                        <ModeSelection onModeSelect={handleModeSelect} gender={gender} />
                    </div>
                )}

                {phase === 'name-input' && (
                    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                        <Button onClick={handleBack} variant="ghost" className="self-start">
                            ← Retour
                        </Button>
                        <NameListInput onConfirm={handleCustomNamesConfirm} gender={gender} />
                    </div>
                )}

                {phase === 'tournament' && names.length > 0 && (
                    <TournamentBracket initialNames={names} gender={gender} />
                )}
            </div>
        </div>
    );
}

export default function TournamentPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
                <div className="text-center space-y-4">
                    <div className="text-4xl animate-bounce">⏳</div>
                    <p className="text-xl">Chargement...</p>
                </div>
            </div>
        }>
            <TournamentContent />
        </Suspense>
    );
}
