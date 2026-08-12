export type KolamBantuanModuleKind =
  | 'core'
  | 'plugin'
  | 'app'
  | 'security'
  | 'support';

export interface KolamBantuanModule {
  slug: string;
  title: string;
  description: string;
  docPath: string;
  version: string;
  updatedAt: string;
  kind?: KolamBantuanModuleKind;
  pluginId?: string;
  permissionResource?: string;
  permissionResources?: string[];
  seriesId?: string;
  seriesTitle?: string;
  pageOrder?: number;
  navLabel?: string;
  prevSlug?: string;
  nextSlug?: string;
  seriesPageIndex?: number;
  seriesPageCount?: number;
}

export interface KolamBantuanManifest {
  version: string;
  generatedAt: string;
  aliases: Record<string, string>;
  modules: KolamBantuanModule[];
}

export interface KolamBantuanSearchEntry {
  slug: string | null;
  href: string;
  title: string;
  description: string;
  bodyPlain: string;
}

export interface KolamBantuanSearchHit {
  slug: string | null;
  href: string;
  title: string;
  description: string;
  snippet: string;
  score: number;
  matchCount: number;
}

export function isKolamBantuanRoute(route: string) {
  const path = route.split('?')[0].replace(/\/+$/, '') || '/';
  return path === '/bantuan' || path.startsWith('/bantuan/');
}

export function getKolamBantuanSlugFromRoute(route: string) {
  const path = route.split('?')[0].replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  return parts[0] === 'bantuan' && parts[1]
    ? decodeURIComponent(parts[1])
    : null;
}

export function resolveKolamBantuanSlug(
  slug: string | null | undefined,
  aliases: Record<string, string> | undefined,
) {
  if (!slug) {
    return null;
  }

  return aliases?.[slug] ?? slug;
}

export function getKolamBantuanModuleFromManifest(
  manifest: KolamBantuanManifest | null,
  slug: string | null | undefined,
) {
  const resolved = resolveKolamBantuanSlug(slug, manifest?.aliases);

  if (!manifest || !resolved) {
    return undefined;
  }

  return manifest.modules.find(module => module.slug === resolved);
}

export function getKolamBantuanKindLabel(kind: KolamBantuanModuleKind | undefined) {
  switch (kind) {
    case 'plugin':
      return 'Plugin';
    case 'app':
      return 'Aplikasi';
    case 'security':
      return 'Keamanan';
    case 'support':
      return 'Dukungan';
    case 'core':
    default:
      return 'Modul';
  }
}

export function groupKolamBantuanModules(modules: KolamBantuanModule[]) {
  const groups: Array<{
    id: KolamBantuanModuleKind | 'core';
    title: string;
    modules: KolamBantuanModule[];
  }> = [
    {id: 'core', title: 'Modul', modules: []},
    {id: 'plugin', title: 'Plugin', modules: []},
    {id: 'app', title: 'Aplikasi', modules: []},
    {id: 'security', title: 'Keamanan', modules: []},
    {id: 'support', title: 'Dukungan', modules: []},
  ];

  modules.forEach(module => {
    const kind = module.kind ?? 'core';
    const group = groups.find(item => item.id === kind) ?? groups[0];
    group.modules.push(module);
  });

  return groups.filter(group => group.modules.length > 0);
}

export function searchKolamBantuanDocumentsClient(
  query: string,
  entries: KolamBantuanSearchEntry[],
  visibleModules: KolamBantuanModule[],
): KolamBantuanSearchHit[] {
  const needle = query.trim().toLowerCase();
  const visibleSlugs = new Set(visibleModules.map(module => module.slug));

  if (!needle) {
    return [];
  }

  return entries
    .filter(entry => !entry.slug || visibleSlugs.has(entry.slug))
    .map(entry => {
      const text = [
        entry.title,
        entry.description,
        entry.bodyPlain,
      ]
        .join(' ')
        .toLowerCase();
      const titleMatches = countMatches(entry.title, needle);
      const descriptionMatches = countMatches(entry.description, needle);
      const bodyMatches = countMatches(entry.bodyPlain, needle);
      const matchCount = titleMatches + descriptionMatches + bodyMatches;

      return {
        slug: entry.slug,
        href: entry.href,
        title: entry.title,
        description: entry.description,
        snippet: getSearchSnippet(entry.bodyPlain || entry.description, needle),
        score: titleMatches * 5 + descriptionMatches * 3 + bodyMatches,
        matchCount,
      };
    })
    .filter(hit => hit.matchCount > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 12);
}

function countMatches(value: string, needle: string) {
  const lower = value.toLowerCase();
  let count = 0;
  let index = lower.indexOf(needle);

  while (index !== -1) {
    count += 1;
    index = lower.indexOf(needle, index + needle.length);
  }

  return count;
}

function getSearchSnippet(value: string, needle: string) {
  const clean = value.replace(/\s+/g, ' ').trim();
  const index = clean.toLowerCase().indexOf(needle);

  if (index === -1) {
    return clean.slice(0, 160);
  }

  const start = Math.max(0, index - 56);
  return clean.slice(start, start + 180);
}
