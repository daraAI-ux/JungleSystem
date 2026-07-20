import {
  KOLAM_CATALOG_DEFAULT_LOCALE,
  KOLAM_CATALOG_LOCALE_LABELS,
  KOLAM_CATALOG_LOCALES,
  type KolamCatalogLocale,
  type KolamCatalogTranslationsMap,
  type KolamCategoryLocaleFields,
  type KolamCustomFieldLocaleFields,
  type KolamTaxonomyLocaleFields,
} from './kolam-catalog-locale';
import type { KolamLabelFieldDetailSectionItem } from '../components/kolam-label-field-detail-overview';

export function createCategoryLocaleAuditItems({
  description,
  name,
  translations,
}: {
  description: string;
  name: string;
  translations?: KolamCatalogTranslationsMap<KolamCategoryLocaleFields>;
}): KolamLabelFieldDetailSectionItem[] {
  return KOLAM_CATALOG_LOCALES.map(locale => {
    const isPrimary = locale === KOLAM_CATALOG_DEFAULT_LOCALE;
    const block = isPrimary ? { description, name } : translations?.[locale];
    const active = hasLocaleValue(block);

    return {
      badge: active ? 'Aktif' : 'Fallback',
      meta: [
        `Nama: ${block?.name?.trim() || '-'}`,
        `Deskripsi: ${stripHtmlText(block?.description || '-')}`,
      ].join('\n'),
      title: getLocaleTitle(locale),
    };
  });
}

export function createCustomFieldLocaleAuditItems({
  description,
  fieldLabel,
  options,
  translations,
}: {
  description: string;
  fieldLabel: string;
  options: string[];
  translations?: KolamCatalogTranslationsMap<KolamCustomFieldLocaleFields>;
}): KolamLabelFieldDetailSectionItem[] {
  return KOLAM_CATALOG_LOCALES.map(locale => {
    const isPrimary = locale === KOLAM_CATALOG_DEFAULT_LOCALE;
    const block = isPrimary
      ? { description, fieldLabel, options }
      : translations?.[locale];
    const active = hasLocaleValue(block);
    const optionList = Array.isArray(block?.options)
      ? block.options.join(', ')
      : '';

    return {
      badge: active ? 'Aktif' : 'Fallback',
      meta: [
        `Label: ${block?.fieldLabel?.trim() || '-'}`,
        `Deskripsi: ${stripHtmlText(block?.description || '-')}`,
        ...(options.length || optionList
          ? [`Opsi: ${optionList || '-'}`]
          : []),
      ].join('\n'),
      title: getLocaleTitle(locale),
    };
  });
}

export function createTaxonomyLocaleAuditItems({
  description,
  name,
  translations,
}: {
  description: string;
  name: string;
  translations?: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>;
}): KolamLabelFieldDetailSectionItem[] {
  return KOLAM_CATALOG_LOCALES.map(locale => {
    const isPrimary = locale === KOLAM_CATALOG_DEFAULT_LOCALE;
    const block = isPrimary ? { description, name } : translations?.[locale];
    const active = hasLocaleValue(block);

    return {
      badge: active ? 'Aktif' : 'Fallback',
      meta: [
        `Nama: ${block?.name?.trim() || '-'}`,
        `Deskripsi: ${stripHtmlText(block?.description || '-')}`,
      ].join('\n'),
      title: getLocaleTitle(locale),
    };
  });
}
export function countActiveLocaleAuditItems(
  items: KolamLabelFieldDetailSectionItem[],
) {
  return items.filter(item => item.badge === 'Aktif').length;
}

function getLocaleTitle(locale: KolamCatalogLocale) {
  return `${KOLAM_CATALOG_LOCALE_LABELS[locale]} (${locale})`;
}

function hasLocaleValue(value: unknown) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value as Record<string, unknown>).some(entry => {
    if (Array.isArray(entry)) {
      return entry.some(item => String(item).trim());
    }

    return entry != null && String(entry).trim();
  });
}

function stripHtmlText(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}


