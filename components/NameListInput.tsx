'use client';

import { useState } from 'react';
import { ListChecks, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NameListInputProps {
  onConfirm: (names: string[], saveNames: boolean) => Promise<void>;
  gender: 'boy' | 'girl';
}

export default function NameListInput({ onConfirm, gender }: NameListInputProps) {
  const [inputValue, setInputValue] = useState('');
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
      setError('Ajoutez au moins deux prénoms différents pour lancer un tournoi.');
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
    <Card className="w-full max-w-2xl border-white/70 bg-white/90 shadow-[0_24px_80px_-36px_rgba(77,48,38,0.45)]">
      <CardHeader>
        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <ListChecks aria-hidden="true" className="size-5" />
        </div>
        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">Votre liste de prénoms</CardTitle>
        <CardDescription>
          Un prénom par ligne, ou séparés par des virgules. Les doublons seront retirés automatiquement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label htmlFor="custom-names" className="text-sm font-semibold text-stone-700">
          Prénoms à comparer
        </label>
        <Textarea
          id="custom-names"
          placeholder="Exemple: Emma, Alice, Rose, Chloé, Lina..."
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setError(null);
          }}
          className="min-h-[200px] resize-y bg-white text-base"
          disabled={isLoading}
          maxLength={4096}
          aria-describedby="name-count name-error"
          aria-invalid={Boolean(error)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id="name-count" className="text-sm text-stone-600" aria-live="polite">
            {uniqueNames.length} prénom{uniqueNames.length !== 1 ? 's' : ''} différent{uniqueNames.length !== 1 ? 's' : ''}
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={saveNames}
              onChange={(event) => setSaveNames(event.target.checked)}
              className="size-4 accent-rose-700"
            />
            Ajouter les nouveaux prénoms à la liste {gender === 'girl' ? 'fille' : 'garçon'}
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
          {isLoading ? 'Préparation du tournoi…' : 'Commencer le tournoi'}
        </Button>
      </CardContent>
    </Card>
  );
}
