'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentMode } from '@/types';

interface ModeSelectionProps {
    onModeSelect: (mode: TournamentMode | 'manage') => void;
    gender: 'boy' | 'girl';
}

export default function ModeSelection({ onModeSelect, gender }: ModeSelectionProps) {
    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center space-y-4">
                <CardTitle className="text-3xl font-bold">Choisissez votre mode</CardTitle>
                <CardDescription className="text-base">
                    Comment souhaitez-vous sélectionner les prénoms pour le tournoi ?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={() => onModeSelect('custom')}
                        variant="outline"
                        className="h-32 flex flex-col items-center justify-center space-y-2 hover:bg-accent transition-all duration-300"
                    >
                        <span className="text-4xl">✏️</span>
                        <span className="text-lg font-semibold">Liste personnalisée</span>
                        <span className="text-sm text-muted-foreground">
                            Entrez vos propres prénoms
                        </span>
                    </Button>
                    <Button
                        onClick={() => onModeSelect('database')}
                        variant="outline"
                        className="h-32 flex flex-col items-center justify-center space-y-2 hover:bg-accent transition-all duration-300"
                    >
                        <span className="text-4xl">📚</span>
                        <span className="text-lg font-semibold">Base de données</span>
                        <span className="text-sm text-muted-foreground">
                            Utilisez les prénoms de la base
                        </span>
                    </Button>
                </div>
                <Button
                    onClick={() => onModeSelect('manage')}
                    variant="outline"
                    className="w-full h-32 flex flex-col items-center justify-center space-y-2 hover:bg-accent transition-all duration-300"
                >
                    <span className="text-4xl">⚙️</span>
                    <span className="text-lg font-semibold">Gérer la base de données</span>
                    <span className="text-sm text-muted-foreground">
                        Ajouter ou supprimer des prénoms
                    </span>
                </Button>
            </CardContent>
        </Card>
    );
}
