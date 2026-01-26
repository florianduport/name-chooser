'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NameListInputProps {
  onConfirm: (names: string[]) => void;
  gender: 'boy' | 'girl';
}

export default function NameListInput({ onConfirm, gender }: NameListInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    // Parser les noms (séparés par des virgules ou des sauts de ligne)
    const names = inputValue
      .split(/[,\n]/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length < 2) {
      alert('Veuillez entrer au moins 2 prénoms');
      return;
    }

    setIsLoading(true);
    onConfirm(names);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Liste personnalisée</CardTitle>
        <CardDescription>
          Entrez les prénoms que vous souhaitez comparer (séparés par des virgules ou des sauts de ligne)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Exemple: Emma, Alice, Rose, Chloé, Lina..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="min-h-[200px] text-lg"
          disabled={isLoading}
        />
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isLoading || inputValue.trim().length === 0}
        >
          {isLoading ? 'Traitement...' : 'Commencer le tournoi'}
        </Button>
      </CardContent>
    </Card>
  );
}
