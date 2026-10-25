import datasetsJson from '../data/name-datasets.json';
import meaningsJson from '../data/name-meanings.json';
import {
  DEFAULT_COUNTRY,
  SUPPORTED_LOCALES,
  type CountryCode,
  type Locale,
} from './i18n';

type Gender = 'boy' | 'girl';
type Dataset = {
  countryCode: CountryCode;
  countryName: string;
  sourceName: string;
  sourceUrl: string;
  coverageYear: number;
  boys: string[];
  girls: string[];
};

type Meaning = {
  names: string[];
  origin: string;
  meanings: Record<Locale, string>;
  sourceUrl: string;
};

export type Ranking = {
  countryCode: CountryCode;
  countryName: string;
  sourceName: string;
  sourceUrl: string;
  year: number;
  gender: Gender;
  rank: number;
};

export type PublicName = {
  slug: string;
  name: string;
  genders: Gender[];
  rankings: Ranking[];
  origin: string | null;
  meaning: string | null;
  meaningSourceUrl: string | null;
};

export type ListKind = 'top' | 'short' | 'unisex' | 'boy' | 'girl' | 'letter';

export type NameList = {
  kind: ListKind;
  slug: string;
  title: string;
  description: string;
  names: PublicName[];
  letter?: string;
  dataset: Dataset;
};

export const SITE_URL = (process.env.AUTH_URL ?? 'https://lebabyname.com').replace(/\/$/, '');

export const SEO_ROUTES: Record<Locale, {
  nameSegment: string;
  top: string;
  short: string;
  unisex: string;
  boy: string;
  girl: string;
  letter: string;
}> = {
  fr: {
    nameSegment: 'prenom',
    top: 'top-prenoms-2025-france',
    short: 'prenoms-courts',
    unisex: 'prenoms-mixtes',
    boy: 'prenoms-garcon',
    girl: 'prenoms-fille',
    letter: 'prenoms-en',
  },
  'en-GB': {
    nameSegment: 'name',
    top: 'top-baby-names-2025-uk',
    short: 'short-baby-names',
    unisex: 'unisex-baby-names',
    boy: 'boy-names',
    girl: 'girl-names',
    letter: 'names-starting-with',
  },
  'en-US': {
    nameSegment: 'name',
    top: 'top-baby-names-2025-usa',
    short: 'short-baby-names',
    unisex: 'unisex-baby-names',
    boy: 'boy-names',
    girl: 'girl-names',
    letter: 'names-starting-with',
  },
  es: {
    nameSegment: 'nombre',
    top: 'nombres-bebe-mas-populares-espana',
    short: 'nombres-cortos',
    unisex: 'nombres-unisex',
    boy: 'nombres-nino',
    girl: 'nombres-nina',
    letter: 'nombres-con',
  },
  pt: {
    nameSegment: 'nome',
    top: 'nomes-bebe-populares-portugal-2025',
    short: 'nomes-curtos',
    unisex: 'nomes-unissexo',
    boy: 'nomes-menino',
    girl: 'nomes-menina',
    letter: 'nomes-com',
  },
  it: {
    nameSegment: 'nome',
    top: 'nomi-bambini-piu-popolari-italia-2025',
    short: 'nomi-corti',
    unisex: 'nomi-unisex',
    boy: 'nomi-maschili',
    girl: 'nomi-femminili',
    letter: 'nomi-con',
  },
};

const COPY: Record<Locale, {
  nameTitle: (name: string) => string;
  nameDescription: (name: string) => string;
  meaning: string;
  origin: string;
  gender: string;
  popularity: string;
  related: string;
  source: string;
  boy: string;
  girl: string;
  unisex: string;
  cta: (name: string) => string;
  lists: string;
  topTitle: (country: string, year: number) => string;
  topDescription: (country: string, year: number) => string;
  shortTitle: string;
  shortDescription: string;
  unisexTitle: string;
  unisexDescription: string;
  boysTitle: string;
  girlsTitle: string;
  genderDescription: (gender: string, country: string) => string;
  letterTitle: (letter: string) => string;
  letterDescription: (letter: string, country: string) => string;
  rank: (rank: number, country: string, year: number) => string;
  breadcrumbHome: string;
  affiliate: string;
}> = {
  fr: {
    nameTitle: (name) => `${name} : origine, signification et popularité`,
    nameDescription: (name) => `Découvrez le prénom ${name}, son genre, ses classements officiels et des prénoms proches.`,
    meaning: 'Signification',
    origin: 'Origine',
    gender: 'Genre',
    popularity: 'Popularité',
    related: 'Prénoms similaires',
    source: 'Source',
    boy: 'Garçon',
    girl: 'Fille',
    unisex: 'Mixte',
    cta: (name) => `Lance un duel avec ${name}`,
    lists: 'Explorer les listes',
    topTitle: (country, year) => `Top 100 des prénoms en ${country} — ${year}`,
    topDescription: (country, year) => `Les 50 prénoms de fille et 50 prénoms de garçon les mieux classés en ${country}, selon les données officielles ${year}.`,
    shortTitle: 'Prénoms courts',
    shortDescription: 'Des prénoms de quatre lettres ou moins, tirés des classements officiels.',
    unisexTitle: 'Prénoms mixtes',
    unisexDescription: 'Des prénoms présents dans les classements féminins et masculins.',
    boysTitle: 'Prénoms de garçon',
    girlsTitle: 'Prénoms de fille',
    genderDescription: (gender, country) => `Les prénoms ${gender.toLowerCase()} du classement officiel en ${country}.`,
    letterTitle: (letter) => `Prénoms qui commencent par ${letter}`,
    letterDescription: (letter, country) => `Les prénoms en ${letter} présents dans les classements officiels de ${country}.`,
    rank: (rank, country, year) => `n° ${rank} en ${country} (${year})`,
    breadcrumbHome: 'Accueil',
    affiliate: 'Personnalise ce prénom',
  },
  'en-GB': {
    nameTitle: (name) => `${name}: meaning, origin and popularity`,
    nameDescription: (name) => `Discover ${name}, its gender, official popularity rankings and similar names.`,
    meaning: 'Meaning', origin: 'Origin', gender: 'Gender', popularity: 'Popularity', related: 'Similar names', source: 'Source',
    boy: 'Boy', girl: 'Girl', unisex: 'Unisex', cta: (name) => `Start a duel with ${name}`, lists: 'Explore name lists',
    topTitle: (country, year) => `Top 100 baby names in ${country} — ${year}`,
    topDescription: (country, year) => `The 50 highest-ranked girl names and 50 highest-ranked boy names in ${country}, from official ${year} data.`,
    shortTitle: 'Short baby names', shortDescription: 'Names with four letters or fewer from the official rankings.',
    unisexTitle: 'Unisex baby names', unisexDescription: 'Names that appear in both girl and boy rankings.',
    boysTitle: 'Boy names', girlsTitle: 'Girl names',
    genderDescription: (gender, country) => `${gender} names from the official ${country} ranking.`,
    letterTitle: (letter) => `Names starting with ${letter}`,
    letterDescription: (letter, country) => `Names beginning with ${letter} in the official ${country} rankings.`,
    rank: (rank, country, year) => `No. ${rank} in ${country} (${year})`, breadcrumbHome: 'Home', affiliate: 'Personalise this name',
  },
  'en-US': {} as never,
  es: {
    nameTitle: (name) => `${name}: significado, origen y popularidad`,
    nameDescription: (name) => `Descubre el nombre ${name}, su género, posiciones oficiales y nombres parecidos.`,
    meaning: 'Significado', origin: 'Origen', gender: 'Género', popularity: 'Popularidad', related: 'Nombres similares', source: 'Fuente',
    boy: 'Niño', girl: 'Niña', unisex: 'Unisex', cta: (name) => `Inicia un duelo con ${name}`, lists: 'Explorar listas',
    topTitle: (country, year) => `Los 100 nombres de bebé más populares en ${country} — ${year}`,
    topDescription: (country, year) => `Los 50 nombres de niña y 50 de niño mejor clasificados en ${country}, según los datos oficiales de ${year}.`,
    shortTitle: 'Nombres cortos', shortDescription: 'Nombres de cuatro letras o menos de las clasificaciones oficiales.',
    unisexTitle: 'Nombres unisex', unisexDescription: 'Nombres presentes en clasificaciones femeninas y masculinas.',
    boysTitle: 'Nombres de niño', girlsTitle: 'Nombres de niña',
    genderDescription: (gender, country) => `Nombres de ${gender.toLowerCase()} de la clasificación oficial de ${country}.`,
    letterTitle: (letter) => `Nombres que empiezan por ${letter}`,
    letterDescription: (letter, country) => `Nombres con ${letter} en las clasificaciones oficiales de ${country}.`,
    rank: (rank, country, year) => `n.º ${rank} en ${country} (${year})`, breadcrumbHome: 'Inicio', affiliate: 'Personaliza este nombre',
  },
  pt: {
    nameTitle: (name) => `${name}: significado, origem e popularidade`,
    nameDescription: (name) => `Descubra o nome ${name}, o género, as classificações oficiais e nomes semelhantes.`,
    meaning: 'Significado', origin: 'Origem', gender: 'Género', popularity: 'Popularidade', related: 'Nomes semelhantes', source: 'Fonte',
    boy: 'Menino', girl: 'Menina', unisex: 'Unissexo', cta: (name) => `Comece um duelo com ${name}`, lists: 'Explorar listas',
    topTitle: (country, year) => `Top 100 nomes de bebé em ${country} — ${year}`,
    topDescription: (country, year) => `Os 50 nomes femininos e 50 masculinos mais bem classificados em ${country}, segundo dados oficiais de ${year}.`,
    shortTitle: 'Nomes curtos', shortDescription: 'Nomes com quatro letras ou menos das classificações oficiais.',
    unisexTitle: 'Nomes unissexo', unisexDescription: 'Nomes presentes nas classificações femininas e masculinas.',
    boysTitle: 'Nomes de menino', girlsTitle: 'Nomes de menina',
    genderDescription: (gender, country) => `Nomes de ${gender.toLowerCase()} da classificação oficial de ${country}.`,
    letterTitle: (letter) => `Nomes que começam por ${letter}`,
    letterDescription: (letter, country) => `Nomes com ${letter} nas classificações oficiais de ${country}.`,
    rank: (rank, country, year) => `n.º ${rank} em ${country} (${year})`, breadcrumbHome: 'Início', affiliate: 'Personalize este nome',
  },
  it: {
    nameTitle: (name) => `${name}: significato, origine e popolarità`,
    nameDescription: (name) => `Scopri il nome ${name}, il genere, le classifiche ufficiali e nomi simili.`,
    meaning: 'Significato', origin: 'Origine', gender: 'Genere', popularity: 'Popolarità', related: 'Nomi simili', source: 'Fonte',
    boy: 'Bambino', girl: 'Bambina', unisex: 'Unisex', cta: (name) => `Inizia un duello con ${name}`, lists: 'Esplora le liste',
    topTitle: (country, year) => `Top 100 nomi per bambini in ${country} — ${year}`,
    topDescription: (country, year) => `I 50 nomi femminili e 50 maschili più in alto in classifica in ${country}, secondo i dati ufficiali ${year}.`,
    shortTitle: 'Nomi corti', shortDescription: 'Nomi di quattro lettere o meno dalle classifiche ufficiali.',
    unisexTitle: 'Nomi unisex', unisexDescription: 'Nomi presenti nelle classifiche femminili e maschili.',
    boysTitle: 'Nomi maschili', girlsTitle: 'Nomi femminili',
    genderDescription: (gender, country) => `Nomi ${gender.toLowerCase()} dalla classifica ufficiale di ${country}.`,
    letterTitle: (letter) => `Nomi che iniziano con ${letter}`,
    letterDescription: (letter, country) => `Nomi con la ${letter} nelle classifiche ufficiali di ${country}.`,
    rank: (rank, country, year) => `n. ${rank} in ${country} (${year})`, breadcrumbHome: 'Home', affiliate: 'Personalizza questo nome',
  },
};

COPY['en-US'] = {
  ...COPY['en-GB'],
  nameTitle: (name) => `${name}: meaning, origin and popularity`,
  nameDescription: (name) => `Discover ${name}, its gender, official popularity rankings and similar names.`,
  topTitle: (country, year) => `Top 100 baby names in ${country} — ${year}`,
  topDescription: (country, year) => `The 50 highest-ranked girl names and 50 highest-ranked boy names in ${country}, from official ${year} data.`,
  cta: (name) => `Start a matchup with ${name}`,
  affiliate: 'Personalize this name',
};

const datasets = datasetsJson as Dataset[];
const meanings = meaningsJson as Meaning[];
const meaningBySlug = new Map(
  meanings.flatMap((entry) => entry.names.map((name) => [slugify(name), entry] as const)),
);

const namesBySlug = new Map<string, PublicName>();
for (const dataset of datasets) {
  for (const [gender, names] of [['boy', dataset.boys], ['girl', dataset.girls]] as const) {
    names.forEach((name, index) => {
      const slug = slugify(name);
      const current = namesBySlug.get(slug) ?? {
        slug,
        name,
        genders: [],
        rankings: [],
        origin: null,
        meaning: null,
        meaningSourceUrl: null,
      };
      if (!current.genders.includes(gender)) current.genders.push(gender);
      current.rankings.push({
        countryCode: dataset.countryCode,
        countryName: dataset.countryName,
        sourceName: dataset.sourceName,
        sourceUrl: dataset.sourceUrl,
        year: dataset.coverageYear,
        gender,
        rank: index + 1,
      });
      namesBySlug.set(slug, current);
    });
  }
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getAllNames(locale: Locale): PublicName[] {
  return [...namesBySlug.values()].map((name) => localizeName(name, locale));
}

export function getPublicName(locale: Locale, slug: string): PublicName | null {
  const name = namesBySlug.get(slug);
  return name ? localizeName(name, locale) : null;
}

function localizeName(name: PublicName, locale: Locale): PublicName {
  const preferredCountry = DEFAULT_COUNTRY[locale];
  const preferredSpelling = name.rankings.find((ranking) => ranking.countryCode === preferredCountry);
  const entry = meaningBySlug.get(name.slug);
  return {
    ...name,
    name: preferredSpelling
      ? datasetNames(preferredCountry).find((candidate) => slugify(candidate) === name.slug) ?? name.name
      : name.name,
    origin: entry?.origin ?? null,
    meaning: entry?.meanings[locale] ?? null,
    meaningSourceUrl: entry?.sourceUrl ?? null,
  };
}

function datasetNames(country: CountryCode) {
  const dataset = datasets.find((item) => item.countryCode === country);
  return dataset ? [...dataset.boys, ...dataset.girls] : [];
}

export function namePath(locale: Locale, name: Pick<PublicName, 'slug'>) {
  return `/${locale}/${SEO_ROUTES[locale].nameSegment}/${name.slug}`;
}

export function nameAlternates(name: Pick<PublicName, 'slug'>) {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, `${SITE_URL}${namePath(locale, name)}`]),
  );
}

export function listAlternates(kind: ListKind, letter?: string) {
  return Object.fromEntries(SUPPORTED_LOCALES.map((locale) => {
    const routes = SEO_ROUTES[locale];
    const slug = kind === 'letter' ? `${routes.letter}-${letter?.toLowerCase()}` : routes[kind];
    return [locale, `${SITE_URL}/${locale}/${slug}`];
  }));
}

export function getRelatedNames(locale: Locale, name: PublicName, limit = 8) {
  const initials = new Set([name.name[0]?.toLocaleLowerCase(locale)]);
  const genders = new Set(name.genders);
  return getAllNames(locale)
    .filter((candidate) => candidate.slug !== name.slug && candidate.genders.some((gender) => genders.has(gender)))
    .map((candidate) => ({
      candidate,
      score:
        (initials.has(candidate.name[0]?.toLocaleLowerCase(locale)) ? 0 : 4) +
        levenshtein(name.slug, candidate.slug) +
        Math.min(...candidate.rankings.map((ranking) => ranking.rank)) / 100,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function parseList(locale: Locale, slug: string): NameList | null {
  const routes = SEO_ROUTES[locale];
  let kind: ListKind | null = null;
  let letter: string | undefined;
  if (slug === routes.top) kind = 'top';
  else if (slug === routes.short) kind = 'short';
  else if (slug === routes.unisex) kind = 'unisex';
  else if (slug === routes.boy) kind = 'boy';
  else if (slug === routes.girl) kind = 'girl';
  else if (slug.startsWith(`${routes.letter}-`)) {
    letter = slug.slice(routes.letter.length + 1).toUpperCase();
    if (/^[A-Z]$/.test(letter)) kind = 'letter';
  }
  if (!kind) return null;

  const country = DEFAULT_COUNTRY[locale];
  const dataset = datasets.find((item) => item.countryCode === country);
  if (!dataset) return null;
  const all = unique(dataset.boys.concat(dataset.girls))
    .map((name) => getPublicName(locale, slugify(name)))
    .filter((name): name is PublicName => Boolean(name));
  let selected = all;
  if (kind === 'short') selected = all.filter((name) => [...name.name].length <= 4);
  if (kind === 'unisex') selected = all.filter((name) => name.genders.length > 1);
  if (kind === 'boy') selected = unique(dataset.boys).map((name) => getPublicName(locale, slugify(name))).filter(Boolean) as PublicName[];
  if (kind === 'girl') selected = unique(dataset.girls).map((name) => getPublicName(locale, slugify(name))).filter(Boolean) as PublicName[];
  if (kind === 'letter') selected = all.filter((name) => slugify(name.name).startsWith(letter!.toLowerCase()));

  const copy = COPY[locale];
  const countryName = dataset.countryName;
  const genderLabel = kind === 'boy' ? copy.boy : copy.girl;
  const title = kind === 'top'
    ? copy.topTitle(countryName, dataset.coverageYear)
    : kind === 'short'
      ? copy.shortTitle
      : kind === 'unisex'
        ? copy.unisexTitle
        : kind === 'boy'
          ? copy.boysTitle
          : kind === 'girl'
            ? copy.girlsTitle
            : copy.letterTitle(letter!);
  const description = kind === 'top'
    ? copy.topDescription(countryName, dataset.coverageYear)
    : kind === 'short'
      ? copy.shortDescription
      : kind === 'unisex'
        ? copy.unisexDescription
        : kind === 'boy' || kind === 'girl'
          ? copy.genderDescription(genderLabel, countryName)
          : copy.letterDescription(letter!, countryName);
  return { kind, slug, title, description, names: selected, letter, dataset };
}

export function listSlugs(locale: Locale) {
  const routes = SEO_ROUTES[locale];
  const letters = new Set(datasetNames(DEFAULT_COUNTRY[locale]).map((name) => slugify(name)[0]).filter(Boolean));
  return [
    routes.top,
    routes.short,
    routes.unisex,
    routes.boy,
    routes.girl,
    ...[...letters].sort().map((letter) => `${routes.letter}-${letter}`),
  ];
}

export function seoCopy(locale: Locale) {
  return COPY[locale];
}

function unique(values: string[]) {
  return [...new Map(values.map((value) => [slugify(value), value])).values()];
}

function levenshtein(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}
