'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Database, ListPlus, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentMode } from '@/types';
import { useI18n } from '@/components/LocaleProvider';

interface ModeSelectionProps {
    onModeSelect: (mode: TournamentMode | 'manage') => void;
}

export default function ModeSelection({ onModeSelect }: ModeSelectionProps) {
    const { locale, t } = useI18n();
    const [country, setCountry] = useState('…');

    useEffect(() => {
        fetch('/api/countries')
            .then((response) => response.json())
            .then((data) => {
                const code = data.selected?.countryCode;
                if (code) setCountry(new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code);
            });
    }, [locale]);

    return (
        <Card className="w-full max-w-3xl gap-4 border-white/70 bg-white/90 py-4 shadow-[0_24px_80px_-36px_rgba(77,48,38,0.45)] sm:gap-6 sm:py-6">
            <CardHeader className="space-y-2 px-4 text-center sm:space-y-4 sm:px-6">
                <CardTitle className="font-serif text-3xl tracking-[-0.03em] sm:text-4xl">{t('mode.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    {t('mode.subtitle', { country })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 sm:space-y-4 sm:px-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Button
                        onClick={() => onModeSelect('database')}
                        className="group h-auto min-h-36 flex-col items-start justify-between whitespace-normal rounded-2xl bg-sky-100 p-4 text-left text-sky-950 shadow-none hover:bg-sky-200 sm:min-h-44 sm:p-5"
                    >
                        <Database aria-hidden="true" className="size-7 text-sky-700" />
                        <span className="w-full">
                            <span className="block text-base font-semibold sm:text-lg">{t('mode.official')}</span>
                            <span className="mt-1 block text-xs font-normal text-sky-900/70 sm:text-sm">{t('mode.officialDescription', { country })}</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="self-end transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        onClick={() => onModeSelect('custom')}
                        variant="outline"
                        className="group h-auto min-h-36 flex-col items-start justify-between whitespace-normal rounded-2xl border-stone-200 bg-[#fbf8f3] p-4 text-left hover:bg-amber-50 sm:min-h-44 sm:p-5"
                    >
                        <ListPlus aria-hidden="true" className="size-7 text-rose-700" />
                        <span className="w-full">
                            <span className="block text-base font-semibold sm:text-lg">{t('mode.custom')}</span>
                            <span className="mt-1 block text-xs font-normal text-stone-600 sm:text-sm">{t('mode.customDescription')}</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="self-end transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
                <Button
                    onClick={() => onModeSelect('manage')}
                    variant="ghost"
                    className="h-11 w-full justify-start whitespace-normal rounded-xl px-3 text-stone-600 hover:bg-stone-100 hover:text-stone-900 sm:px-4"
                >
                    <Settings2 aria-hidden="true" />
                    {t('mode.manage')}
                </Button>
            </CardContent>
        </Card>
    );
}
