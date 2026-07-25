import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  getKolamTermsTemplatesForItem,
  type KolamSpeciesTermsTemplate,
} from '../services/kolam-species-api';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamPricingMetric, KolamPricingMetricsGrid } from './kolam-pricing-metric-grid';
import { KolamStatusBadge } from './kolam-status-badge';

export type KolamDetailMoreAttachedItem = {
  id: string;
  itemType: string;
  note: string;
  targetName: string;
  targetSku: string;
  type: string;
  typeLabel: string;
};

export type KolamDetailMoreSeo = {
  keywords: string[];
  lastSeoScore: number | null;
  metaDescription: string;
  metaTitle: string;
};

export function KolamDetailTermsTemplatesPanel({
  itemId,
  itemLabel,
  itemType,
  summary,
}: {
  itemId: string;
  itemLabel: string;
  itemType: 'product' | 'species';
  summary?: {
    label: string;
    meta: string;
    status: string;
    statusIntent?: 'muted' | 'success';
  };
}) {
  const [terms, setTerms] = React.useState<KolamSpeciesTermsTemplate[]>([]);
  const [loadingTerms, setLoadingTerms] = React.useState(false);
  const [termsError, setTermsError] = React.useState('');

  const loadTerms = React.useCallback(async () => {
    setLoadingTerms(true);
    setTermsError('');
    try {
      setTerms(await getKolamTermsTemplatesForItem(itemType, itemId));
    } catch (err) {
      setTermsError(err instanceof Error ? err.message : `Gagal memuat S&K ${itemLabel}.`);
    } finally {
      setLoadingTerms(false);
    }
  }, [itemId, itemLabel, itemType]);

  React.useEffect(() => {
    void loadTerms();
  }, [loadTerms]);

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Syarat & Ketentuan</Text>
          <Text style={styles.sectionDescription}>Template S&K yang berlaku untuk {itemLabel} ini.</Text>
        </View>
        <KolamButton disabled={loadingTerms} label={loadingTerms ? 'Memuat...' : 'Segarkan'} onPress={loadTerms} />
      </View>
      {termsError ? <Text style={styles.emptyText}>{termsError}</Text> : null}
      {summary ? (
        <View style={styles.panelStack}>
          <View style={styles.termsListItem}>
            <View style={styles.termsListCopy}>
              <Text style={styles.itemTitle}>{summary.label}</Text>
              {summary.meta ? <Text style={styles.itemMeta}>{summary.meta}</Text> : null}
            </View>
            <KolamStatusBadge intent={summary.statusIntent ?? 'muted'} label={summary.status} />
          </View>
        </View>
      ) : null}
      <View style={styles.panelStack}>
        {terms.length ? (
          terms.map(template => (
            <View key={template.id} style={styles.termsListItem}>
              <View style={styles.termsListCopy}>
                <Text style={styles.itemTitle}>{template.title}</Text>
                {template.slug ? <Text style={styles.itemMeta}>{template.slug}</Text> : null}
                <View style={styles.inlineMetricRow}>
                  <KolamStatusBadge
                    intent={template.sourceKind === 'direct' ? 'muted' : 'info'}
                    label={getTermsSourceBadgeLabel(template)}
                  />
                </View>
              </View>
              <KolamStatusBadge intent="muted" label={getTermsStatusLabel(template.status)} />
            </View>
          ))
        ) : loadingTerms ? (
          <Text style={styles.emptyText}>Memuat S&K aktif...</Text>
        ) : (
          <Text style={styles.emptyText}>Belum ada template S&K terhubung (langsung atau via kategori katalog).</Text>
        )}
      </View>
    </KolamContentFrame>
  );
}

export function KolamDetailAttachedItemsPanel({
  description,
  emptyText,
  items,
  title,
}: {
  description: string;
  emptyText?: string;
  items: KolamDetailMoreAttachedItem[];
  title: string;
}) {
  const attachedItems = Array.isArray(items) ? items : [];

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
        <KolamStatusBadge intent="muted" label={String(attachedItems.length)} />
      </View>
      <View style={styles.panelStack}>
        {attachedItems.length ? (
          attachedItems.map(item => (
            <View key={item.id} style={styles.locationListCard}>
              <View style={styles.attachedItemBody}>
                <View style={styles.itemTitleWrap}>
                  <Text style={styles.itemTitle}>{item.targetName}</Text>
                  {item.targetSku ? <Text style={styles.itemMeta}>SKU: {item.targetSku}</Text> : null}
                </View>
                <View style={styles.inlineMetricRow}>
                  <KolamStatusBadge intent="success" label={item.typeLabel} />
                  <KolamStatusBadge intent="muted" label={item.itemType === 'species' ? 'Spesies' : 'Produk'} />
                </View>
              </View>
              {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{emptyText ?? 'Belum ada item terlampir dari server.'}</Text>
        )}
      </View>
    </KolamContentFrame>
  );
}

export function KolamDetailSeoGooglePanel({
  description,
  entityName,
  pathPrefix,
  seo,
  shortDescription,
  slug,
}: {
  description: string;
  entityName: string;
  pathPrefix: 'products' | 'species';
  seo: KolamDetailMoreSeo;
  shortDescription: string;
  slug: string;
}) {
  const metaDescription = seo.metaDescription || shortDescription || description;
  const keywords = seo.keywords.length ? seo.keywords.join(', ') : '-';
  const title = seo.metaTitle || entityName;
  const url = `dunia-anura.com/${pathPrefix}/${slug || (pathPrefix === 'products' ? 'produk' : 'species')}`;

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>SEO & Google</Text>
          <Text style={styles.sectionDescription}>Skor audit: {seo.lastSeoScore !== null ? `${formatNumber(seo.lastSeoScore)}/100` : 'belum diaudit'}</Text>
        </View>
        <KolamStatusBadge intent="muted" label="Google" />
      </View>
      <View style={styles.seoGrid}>
        <View style={[styles.seoCard, styles.seoHalfCard]}>
          <KolamPricingMetricsGrid compact>
            <KolamPricingMetric label="Deskripsi singkat">
              <Text style={styles.pricingValue}>{stripHtml(metaDescription || '-')}</Text>
            </KolamPricingMetric>
            <KolamPricingMetric label="Judul meta">
              <Text style={styles.pricingValue}>{seo.metaTitle || '-'}</Text>
            </KolamPricingMetric>
            <KolamPricingMetric label="Deskripsi meta">
              <Text style={styles.pricingValue}>{seo.metaDescription || '-'}</Text>
            </KolamPricingMetric>
            <KolamPricingMetric label="Kata kunci">
              <Text style={styles.pricingValue}>{keywords}</Text>
            </KolamPricingMetric>
          </KolamPricingMetricsGrid>
        </View>
        <View style={[styles.seoCard, styles.seoHalfCard]}>
          <Text style={styles.pricingSubTitle}>Pratinjau Google</Text>
          <Text style={styles.seoPreviewTitle}>{title}</Text>
          <Text style={styles.seoPreviewUrl}>{url}</Text>
          <Text style={styles.seoPreviewDescription}>{stripHtml(metaDescription || '-')}</Text>
        </View>
      </View>
    </KolamContentFrame>
  );
}

function getTermsSourceBadgeLabel(template: KolamSpeciesTermsTemplate) {
  if (template.sourceKind === 'direct') {
    return 'Tautan langsung';
  }
  if (template.sourceCategoryNames.length) {
    return `Via kategori: ${template.sourceCategoryNames.join(', ')}`;
  }
  return 'Via kategori katalog';
}

function getTermsStatusLabel(status: string) {
  switch (status) {
    case 'published':
      return 'Terbit';
    case 'draft':
      return 'Draf';
    case 'archived':
      return 'Arsip';
    default:
      return status || '-';
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const styles = StyleSheet.create({
  attachedItemBody: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    padding: 18,
    textAlign: 'center',
  },
  inlineMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  itemNote: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  itemTitleWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  locationListCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 0,
    overflow: 'hidden',
  },
  panelStack: {
    gap: 10,
    padding: 12,
  },
  pricingSubTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  pricingValue: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  sectionCardFull: {
    gap: 0,
    minWidth: 320,
    overflow: 'hidden',
    padding: 0,
    width: '100%',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  seoCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  seoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 12,
  },
  seoHalfCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
  },
  seoPreviewDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  seoPreviewTitle: {
    color: '#1a0dab',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  seoPreviewUrl: {
    color: '#0b7d33',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  termsListCopy: {
    flex: 1,
    gap: 4,
    minWidth: 220,
  },
  termsListItem: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
