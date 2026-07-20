export const KOLAM_CATALOG_LOCALES = [
  'id',
  'en',
  'fr',
  'zh',
  'hi',
  'ar',
  'ja',
] as const;

export type KolamCatalogLocale = (typeof KOLAM_CATALOG_LOCALES)[number];

export const KOLAM_CATALOG_DEFAULT_LOCALE: KolamCatalogLocale = 'id';

export const KOLAM_CATALOG_TRANSLATION_LOCALES =
  KOLAM_CATALOG_LOCALES.filter(
    locale => locale !== KOLAM_CATALOG_DEFAULT_LOCALE,
  );

export const KOLAM_CATALOG_LOCALE_LABELS: Record<KolamCatalogLocale, string> = {
  id: 'Indonesia',
  en: 'English',
  fr: 'Francais',
  zh: 'Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
  ja: 'Japanese',
};

export type KolamCatalogTranslationsMap<T extends Record<string, unknown>> =
  Partial<Record<KolamCatalogLocale, T>>;

export type KolamCategoryLocaleFields = {
  name?: string;
  description?: string;
};

export type KolamTaxonomyLocaleFields = {
  name?: string;
  description?: string;
};

export type KolamSpeciesLocaleFields = {
  commonName?: string;
  localName?: string;
  shortDescription?: string;
  description?: string;
  morfologis?: string;
  habitat?: string;
  distribution?: string;
};

export type KolamCustomFieldLocaleFields = {
  fieldLabel?: string;
  description?: string;
  options?: string[];
};

export function normalizeKolamTranslationsForSave<
  T extends Record<string, unknown>,
>(
  translations?: KolamCatalogTranslationsMap<T>,
): KolamCatalogTranslationsMap<T> | undefined {
  if (!translations) {
    return undefined;
  }

  const output: KolamCatalogTranslationsMap<T> = {};

  KOLAM_CATALOG_TRANSLATION_LOCALES.forEach(locale => {
    const block = compactLocaleBlock(translations[locale]);

    if (block) {
      output[locale] = block as T;
    }
  });

  return Object.keys(output).length ? output : undefined;
}

export function normalizeKolamTranslationsFromRecord<
  T extends Record<string, unknown>,
>(
  value: unknown,
): KolamCatalogTranslationsMap<T> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const output: KolamCatalogTranslationsMap<T> = {};
  const record = value as Record<string, unknown>;

  KOLAM_CATALOG_TRANSLATION_LOCALES.forEach(locale => {
    const block = compactLocaleBlock(record[locale]);

    if (block) {
      output[locale] = block as T;
    }
  });

  return output;
}

export function patchKolamLocaleBlock<T extends Record<string, unknown>>(
  translations: KolamCatalogTranslationsMap<T> | undefined,
  locale: KolamCatalogLocale,
  patch: Partial<T>,
): KolamCatalogTranslationsMap<T> {
  const current = (translations?.[locale] ?? {}) as T;
  const next = {
    ...(translations ?? {}),
    [locale]: {
      ...current,
      ...patch,
    } as T,
  };
  const compacted = compactLocaleBlock(next[locale]);

  if (compacted) {
    next[locale] = compacted as T;
  } else {
    delete next[locale];
  }

  return next;
}

function compactLocaleBlock(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const output: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (Array.isArray(entry)) {
      const options = entry
        .map(option => String(option).trim())
        .filter(Boolean);

      if (options.length) {
        output[key] = options;
      }

      return;
    }

    if (entry == null) {
      return;
    }

    const text = String(entry).trim();
    if (text) {
      output[key] = text;
    }
  });

  return Object.keys(output).length ? output : null;
}



