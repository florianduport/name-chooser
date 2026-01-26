'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gender } from '@/types';

export default function GenderSelection() {
  const router = useRouter();

  const handleGenderSelect = (gender: Gender) => {
    router.push(`/tournament?gender=${gender}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Choix du prénom
          </CardTitle>
          <CardDescription className="text-lg">
            Sélectionnez le genre pour commencer le tournoi des prénoms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleGenderSelect('girl')}
              className="h-32 text-xl font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              👧 Prénom Fille
            </Button>
            <Button
              onClick={() => handleGenderSelect('boy')}
              className="h-32 text-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              👦 Prénom Garçon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
