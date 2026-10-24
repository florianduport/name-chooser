'use client';

import { ArrowRight, Database, ListPlus, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentMode } from '@/types';

interface ModeSelectionProps {
    onModeSelect: (mode: TournamentMode | 'manage') => void;
    gender: 'boy' | 'girl';
}

export default function ModeSelection({ onModeSelect, gender }: ModeSelectionProps) {
    return (
        <Card className="w-full max-w-3xl border-white/70 bg-white/90 shadow-[0_24px_80px_-36px_rgba(77,48,38,0.45)]">
            <CardHeader className="text-center space-y-4">
                <CardTitle className="font-serif text-4xl tracking-[-0.03em]">Composez votre tournoi</CardTitle>
                <CardDescription className="text-base">
                    Utilisez notre sélection de prénoms de {gender === 'girl' ? 'fille' : 'garçon'} ou partez de votre propre liste.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Button
                        onClick={() => onModeSelect('custom')}
                        variant="outline"
                        className="group h-auto min-h-44 flex-col items-start justify-between whitespace-normal rounded-2xl border-stone-200 bg-[#fbf8f3] p-5 text-left hover:bg-amber-50"
                    >
                        <ListPlus aria-hidden="true" className="size-7 text-rose-700" />
                        <span className="w-full">
                            <span className="block text-lg font-semibold">Ma liste personnalisée</span>
                            <span className="mt-1 block text-sm font-normal text-stone-600">Collez les prénoms que vous avez déjà repérés.</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="self-end transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        onClick={() => onModeSelect('database')}
                        variant="outline"
                        className="group h-auto min-h-44 flex-col items-start justify-between whitespace-normal rounded-2xl border-stone-200 bg-[#fbf8f3] p-5 text-left hover:bg-sky-50"
                    >
                        <Database aria-hidden="true" className="size-7 text-sky-700" />
                        <span className="w-full">
                            <span className="block text-lg font-semibold">La sélection complète</span>
                            <span className="mt-1 block text-sm font-normal text-stone-600">Lancez le tournoi avec tous les prénoms enregistrés.</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="self-end transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
                <Button
                    onClick={() => onModeSelect('manage')}
                    variant="ghost"
                    className="h-auto w-full justify-start whitespace-normal rounded-xl px-4 py-3 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                >
                    <Settings2 aria-hidden="true" />
                    Gérer les prénoms enregistrés
                </Button>
            </CardContent>
        </Card>
    );
}
