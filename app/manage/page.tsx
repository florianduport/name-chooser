'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gender, Name } from '@/types';

type Notice = { tone: 'success' | 'error'; message: string } | null;

export default function ManagePage() {
  const router = useRouter();
  const [activeGender, setActiveGender] = useState<Gender>('girl');
  const [names, setNames] = useState<Record<Gender, Name[]>>({ girl: [], boy: [] });
  const [newName, setNewName] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch('/api/names?gender=girl', { signal: controller.signal }),
      fetch('/api/names?gender=boy', { signal: controller.signal }),
    ])
      .then(async ([girlsResponse, boysResponse]) => {
        if (!girlsResponse.ok || !boysResponse.ok) throw new Error();
        const [girlsData, boysData] = await Promise.all([girlsResponse.json(), boysResponse.json()]);
        setNames({ girl: girlsData.names ?? [], boy: boysData.names ?? [] });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setNotice({ tone: 'error', message: 'Impossible de charger les prénoms. Vérifiez la connexion puis réessayez.' });
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredNames = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return [...names[activeGender]]
      .filter((item) => item.name.toLocaleLowerCase('fr').includes(normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [activeGender, names, query]);

  const addName = async (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;
    setIsSaving(true);
    setNotice(null);
    try {
      const response = await fetch('/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, gender: activeGender }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Le prénom n’a pas pu être ajouté.');
      if (data.created) {
        setNames((current) => ({
          ...current,
          [activeGender]: [...current[activeGender], data.name],
        }));
        setNewName('');
        setNotice({ tone: 'success', message: `${data.name.name} a été ajouté à la sélection.` });
      } else {
        setNotice({ tone: 'error', message: `${data.name.name} figure déjà dans cette sélection.` });
      }
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'L’ajout a échoué.' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteName = async (name: Name) => {
    setDeletingId(name.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/names/${name.id}?gender=${activeGender}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'La suppression a échoué.');
      }
      setNames((current) => ({
        ...current,
        [activeGender]: current[activeGender].filter((item) => item.id !== name.id),
      }));
      setPendingDeleteId(null);
      setNotice({ tone: 'success', message: `${name.name} a été retiré de la sélection.` });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'La suppression a échoué.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-dvh bg-[#f7f1e8] px-3 py-3 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Button onClick={() => router.back()} variant="ghost" className="-ml-3 text-stone-600">
          <ArrowLeft aria-hidden="true" /> Retour
        </Button>

        <header className="mt-3 max-w-2xl sm:mt-8">
          <h1 className="font-serif text-4xl tracking-[-0.04em] sm:text-6xl">Votre sélection</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 sm:mt-4 sm:text-lg sm:leading-8">
            Ajoutez les prénoms qui comptent pour vous. Ils seront disponibles dans le prochain tournoi.
          </p>
        </header>

        <div className="mt-4 grid gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-[19rem_1fr]">
          <aside className="h-fit rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_20px_60px_-40px_rgba(77,48,38,0.6)] sm:p-5">
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Type de prénoms">
              {(['girl', 'boy'] as const).map((gender) => (
                <Button
                  key={gender}
                  type="button"
                  role="tab"
                  aria-selected={activeGender === gender}
                  variant={activeGender === gender ? 'default' : 'ghost'}
                  onClick={() => {
                    setActiveGender(gender);
                    setQuery('');
                    setNotice(null);
                  }}
                  className={activeGender === gender ? 'bg-stone-900 text-white hover:bg-stone-800' : ''}
                >
                  {gender === 'girl' ? 'Filles' : 'Garçons'}
                  <span className="tabular-nums opacity-70">{names[gender].length}</span>
                </Button>
              ))}
            </div>

            <form onSubmit={addName} className="mt-3 grid grid-cols-[1fr_auto] gap-2 sm:mt-6 sm:block sm:space-y-3">
              <label htmlFor="new-name" className="text-sm font-semibold">Ajouter un prénom</label>
              <Input
                id="new-name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex. Charlie"
                maxLength={60}
                disabled={isSaving}
                className="col-start-1 h-11 bg-white text-base"
              />
              <Button type="submit" disabled={isSaving || !newName.trim()} className="col-start-2 row-start-2 h-11 bg-rose-700 px-4 text-white hover:bg-rose-800 sm:w-full">
                {isSaving ? <RefreshCw aria-hidden="true" className="animate-spin" /> : <Plus aria-hidden="true" />}
                <span className="hidden sm:inline">{isSaving ? 'Ajout…' : 'Ajouter'}</span>
              </Button>
            </form>
          </aside>

          <section aria-label={`Prénoms de ${activeGender === 'girl' ? 'filles' : 'garçons'}`} className="min-w-0 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_20px_60px_-40px_rgba(77,48,38,0.6)] sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-3xl tracking-[-0.03em]">
                Prénoms de {activeGender === 'girl' ? 'filles' : 'garçons'}
              </h2>
              <label className="relative block">
                <span className="sr-only">Rechercher un prénom</span>
                <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher"
                  className="h-10 bg-white pl-9 text-base sm:w-56"
                />
              </label>
            </div>

            {notice && (
              <p
                role={notice.tone === 'error' ? 'alert' : 'status'}
                className={`mt-5 rounded-lg px-3 py-2 text-sm ${notice.tone === 'error' ? 'bg-red-50 text-red-900' : 'bg-emerald-50 text-emerald-900'}`}
              >
                {notice.message}
              </p>
            )}

            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center text-stone-600">
                <RefreshCw aria-hidden="true" className="mr-2 animate-spin" /> Chargement des prénoms…
              </div>
            ) : filteredNames.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <p className="font-semibold text-stone-800">{query ? 'Aucun prénom ne correspond.' : 'La sélection est vide.'}</p>
                <p className="mt-1 text-sm text-stone-600">{query ? 'Essayez une autre recherche.' : 'Ajoutez votre premier prénom depuis le formulaire.'}</p>
              </div>
            ) : (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNames.map((name) => (
                  <li key={name.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-stone-100 bg-white px-4 py-3">
                    <span className="min-w-0 truncate font-medium" title={name.name}>{name.name}</span>
                    {pendingDeleteId === name.id ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDeleteId(null)}>Annuler</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => deleteName(name)} disabled={deletingId === name.id}>
                          {deletingId === name.id ? <RefreshCw aria-hidden="true" className="animate-spin" /> : 'Confirmer'}
                        </Button>
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPendingDeleteId(name.id)}
                        aria-label={`Supprimer ${name.name}`}
                        className="text-stone-400 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
