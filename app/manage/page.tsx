'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gender, Name } from '@/types';

export default function ManagePage() {
  const router = useRouter();
  const [activeGender, setActiveGender] = useState<Gender>('girl');
  const [girlsNames, setGirlsNames] = useState<Name[]>([]);
  const [boysNames, setBoysNames] = useState<Name[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    setIsLoading(true);
    try {
      const [girlsResponse, boysResponse] = await Promise.all([
        fetch('/api/names?gender=girl'),
        fetch('/api/names?gender=boy'),
      ]);

      const girlsData = await girlsResponse.json();
      const boysData = await boysResponse.json();

      if (girlsData.names) setGirlsNames(girlsData.names);
      if (boysData.names) setBoysNames(boysData.names);
    } catch (error) {
      console.error('Error loading names:', error);
      alert('Erreur lors du chargement des noms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddName = async (gender: Gender) => {
    if (!newName.trim()) {
      alert('Veuillez entrer un nom');
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), gender }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.created) {
          // Recharger les noms pour ce genre
          const namesResponse = await fetch(`/api/names?gender=${gender}`);
          const namesData = await namesResponse.json();
          if (gender === 'girl') {
            setGirlsNames(namesData.names || []);
          } else {
            setBoysNames(namesData.names || []);
          }
          setNewName('');
          alert('Nom ajouté avec succès !');
        } else {
          alert('Ce nom existe déjà dans la base de données');
        }
      } else {
        alert(data.error || 'Erreur lors de l\'ajout du nom');
      }
    } catch (error) {
      console.error('Error adding name:', error);
      alert('Erreur lors de l\'ajout du nom');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteName = async (id: string, gender: Gender) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce nom ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/names/${id}?gender=${gender}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recharger les noms pour ce genre
        const namesResponse = await fetch(`/api/names?gender=${gender}`);
        const namesData = await namesResponse.json();
        if (gender === 'girl') {
          setGirlsNames(namesData.names || []);
        } else {
          setBoysNames(namesData.names || []);
        }
        alert('Nom supprimé avec succès !');
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression du nom');
      }
    } catch (error) {
      console.error('Error deleting name:', error);
      alert('Erreur lors de la suppression du nom');
    }
  };

  const currentNames = activeGender === 'girl' ? girlsNames : boysNames;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">Gestion de la base de données</CardTitle>
                <CardDescription className="text-base mt-2">
                  Ajoutez ou supprimez des prénoms dans la base de données
                </CardDescription>
              </div>
              <Button onClick={() => router.push('/')} variant="outline">
                Retour à l'accueil
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-2 border-b">
                <Button
                  variant={activeGender === 'girl' ? 'default' : 'ghost'}
                  onClick={() => setActiveGender('girl')}
                  className="rounded-b-none"
                >
                  👧 Filles
                </Button>
                <Button
                  variant={activeGender === 'boy' ? 'default' : 'ghost'}
                  onClick={() => setActiveGender('boy')}
                  className="rounded-b-none"
                >
                  👦 Garçons
                </Button>
              </div>

              {activeGender === 'girl' && (
                <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ajouter un prénom de fille</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Input
                      placeholder="Entrez un prénom"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddName('girl');
                        }
                      }}
                    />
                    <Button onClick={() => handleAddName('girl')} disabled={isAdding}>
                      Ajouter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Liste des prénoms de filles ({currentNames.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center text-muted-foreground">Chargement...</p>
                    ) : currentNames.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        Aucun prénom dans la base de données
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {currentNames.map((name) => (
                          <div
                            key={name.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <span className="font-medium">{name.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteName(name.id, 'girl')}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              )}

              {activeGender === 'boy' && (
                <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ajouter un prénom de garçon</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Input
                      placeholder="Entrez un prénom"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddName('boy');
                        }
                      }}
                    />
                    <Button onClick={() => handleAddName('boy')} disabled={isAdding}>
                      Ajouter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Liste des prénoms de garçons ({currentNames.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center text-muted-foreground">Chargement...</p>
                    ) : currentNames.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        Aucun prénom dans la base de données
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {currentNames.map((name) => (
                          <div
                            key={name.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <span className="font-medium">{name.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteName(name.id, 'boy')}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
