'use client';

import { useState } from 'react';
import { ListChecks, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/components/LocaleProvider';

interface NameListInputProps {
  onConfirm: (names: string[], saveNames: boolean) => Promise<void>;
  gender: 'boy' | 'girl';
  initialName?: string;
}

export default function NameListInput({ onConfirm, gender, initialName = '' }: NameListInputProps) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [saveNames, setSaveNames] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const names = inputValue
      .split(/[,\n]/)
      .map((name) => name.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
  const uniqueNames = Array.from(
    new Map(names.map((name) => [name.toLocaleLowerCase('fr'), name])).values(),
  );

  const handleSubmit = async () => {
    if (uniqueNames.length < 2) {
      setError(t('names.minimum'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await onConfirm(uniqueNames, saveNames);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl gap-4 border-white/70 bg-white/90 py-4 shadow-[0_24px_80px_-36px_rgba(77,48,38,0.45)] sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <ListChecks aria-hidden="true" className="size-5" />
        </div>
        <CardTitle className="font-serif text-2xl tracking-[-0.03em] sm:text-3xl">{t('names.title')}</CardTitle>
        <CardDescription>
          {t('names.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:space-y-4 sm:px-6">
        <label htmlFor="custom-names" className="text-sm font-semibold text-stone-700">
          {t('names.label')}
        </label>
        <Textarea
          id="custom-names"
          placeholder={t('names.placeholder')}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setError(null);
          }}
          className="min-h-[112px] resize-y bg-white text-base sm:min-h-[200px]"
          disabled={isLoading}
          maxLength={4096}
          aria-describedby="name-count name-error"
          aria-invalid={Boolean(error)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id="name-count" className="text-sm text-stone-600" aria-live="polite">
            {t('names.count', { count: uniqueNames.length })}
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={saveNames}
              onChange={(event) => setSaveNames(event.target.checked)}
              className="size-4 accent-rose-700"
            />
            {t('names.save')} ({gender === 'girl' ? t('common.girls') : t('common.boys')})
          </label>
        </div>
        {error && (
          <p id="name-error" role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        <Button
          onClick={handleSubmit}
          className="h-12 w-full bg-stone-900 text-base text-white hover:bg-stone-800"
          disabled={isLoading || inputValue.trim().length === 0}
        >
          <Sparkles aria-hidden="true" />
          {isLoading ? t('names.processing') : t('names.start')}
        </Button>
      </CardContent>
    </Card>
  );
}
