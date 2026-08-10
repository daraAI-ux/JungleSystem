import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { copyTextToClipboard } from '../lib/native-clipboard';
import {
  fetchKolamActivePricingSources,
  fetchKolamChannelPricingAnalysis,
  fetchKolamPricingPaymentMethods,
  fetchKolamTaxEstimate,
  type KolamChannelPricingAnalysis,
  type KolamPricingPaymentMethod,
  type KolamPricingSource,
  type KolamTaxEstimate,
} from '../services/kolam-pricing-analysis-api';
import {
  getKolamSpeciesEnclosureAllocation,
  getKolamSpeciesPendingLivestockAllocations,
  getKolamSpeciesStatistics,
  type KolamSpeciesEnclosureAllocation,
  type KolamSpeciesPendingLivestockAllocation,
  type KolamSpeciesStatistics,
  type KolamSpeciesStatisticsPeriod,
} from '../services/kolam-species-api';
import type {
  KolamSpecies,
  KolamSpeciesCommissionType,
} from '../domain/kolam-species';
import { formatRupiah } from '../lib/money';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  type KolamLabelFieldDetailSection,
  type KolamLabelFieldDetailSectionItem,
  type KolamLabelFieldMeta,
  type KolamLabelFieldMetric,
} from './kolam-label-field-detail-overview';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamBarcodePanel } from './kolam-barcode-panel';
import { KolamCategoryLabel } from './kolam-category-label';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamControlTabList } from './kolam-control-tab-list';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import { KolamDetailLocaleTabs } from './kolam-detail-locale-tabs';
import {
  KolamDetailAttachedItemsPanel,
  KolamDetailSeoGooglePanel,
  KolamDetailTermsTemplatesPanel,
} from './kolam-detail-more-panels';
import { KolamEntityStatisticsPanel } from './kolam-entity-statistics-panel';
import { KolamSpeciesDetailAssetsPanel } from './kolam-species-detail-assets-panel';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamMediaPlayer } from './kolam-media-player';
import { KolamMarketplacePriceSyncDialog } from './kolam-marketplace-price-sync-dialog';
import {
  KolamPricingMetric,
  KolamPricingMetricsGrid,
} from './kolam-pricing-metric-grid';
import {
  KolamGrocerPricingCard,
  KolamGrocerTierPills,
  KolamInternalProfitCard,
  KolamMarketplaceProfitAnalyzerCard,
  KolamPricingMarketplaceSyncFooter,
  KolamVendorPriceCard,
} from './kolam-pricing-detail-widgets';
import { KolamRemoteImage } from './kolam-remote-image';
import {
  KolamStatusBadge,
  type KolamStatusBadgeProps,
} from './kolam-status-badge';

type ExternalLink = {
  label: string;
  name: string;
  onPress?: () => void;
  value: string;
};

export type SpeciesDetailMediaItem = KolamDetailMediaItem;

export type SpeciesSidebarChip = {
  id: string;
  imageUri?: string | null;
  label: string;
  onPress?: () => void;
  tone?: 'default' | 'category';
};

export type SpeciesSidebarGroup = {
  chips: SpeciesSidebarChip[];
  emptyText?: string;
  label: string;
};

export type DetailTabId =
  | 'overview'
  | 'pricing'
  | 'specifications'
  | 'logistics'
  | 'location'
  | 'materials'
  | 'more'
  | 'assets'
  | 'statistics';

type SpeciesDetailOverviewProps = {
  commonName?: string;
  createdAt?: string;
  externalLinks?: ExternalLink[];
  hero: React.ReactNode;
  localName?: string;
  lowStockThreshold?: number;
  mediaItems?: SpeciesDetailMediaItem[];
  meta: Array<KolamLabelFieldMeta & { valueNode?: React.ReactNode }>;
  metrics: KolamLabelFieldMetric[];
  onPrintBarcode?: () => void;
  priceLabel?: string;
  sections: KolamLabelFieldDetailSection[];
  sellable: boolean;
  species: KolamSpecies;
  sidebarGroups?: SpeciesSidebarGroup[];
  sku: string;
  stock: number;
  unitLabel?: string;
  voiceUri?: string | null;
  activeTab?: DetailTabId;
  onActiveTabChange?: (tab: DetailTabId) => void;
  status: Pick<KolamStatusBadgeProps, 'intent' | 'label'>;
  title: string;
  updatedAt?: string;
};

const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');

const TAB_LABELS: Record<DetailTabId, string> = {
  overview: 'Ringkasan',
  pricing: 'Harga',
  specifications: 'Spesifikasi',
  logistics: 'Logistik',
  location: 'Posisi & Lokasi',
  materials: 'Bahan Penyusun',
  more: 'Lainnya',
  assets: 'Aset',
  statistics: 'Statistik',
};

export function KolamSpeciesDetailOverview({
  commonName,
  externalLinks = [],
  hero,
  localName,
  lowStockThreshold = 10,
  mediaItems = [],
  meta,
  metrics,
  onPrintBarcode,
  priceLabel,
  sections,
  sellable,
  species,
  sidebarGroups = [],
  sku,
  stock,
  unitLabel,
  voiceUri,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  status,
  title,
}: SpeciesDetailOverviewProps) {
  const hasVariants = (getSection(sections, 'Varian')?.total ?? 0) > 0;
  const tabs = React.useMemo(
    () =>
      [
        'overview',
        'pricing',
        'specifications',
        'logistics',
        'location',
        'materials',
        'more',
        'assets',
        'statistics',
      ] satisfies DetailTabId[],
    [hasVariants],
  );
  const [internalActiveTab, setInternalActiveTab] =
    React.useState<DetailTabId>('overview');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = React.useCallback(
    (tab: DetailTabId) => {
      setInternalActiveTab(tab);
      onActiveTabChange?.(tab);
    },
    [onActiveTabChange],
  );
  const safeActiveTab = tabs.includes(activeTab) ? activeTab : 'overview';
  const tabItems = tabs.map(tab => ({
    id: tab,
    label: TAB_LABELS[tab],
  }));
  const translationSection = getSection(sections, 'Konten per bahasa');
  const visibleSections = getVisibleSections(safeActiveTab, sections);
  return (
    <View style={styles.stack}>
      <KolamControlTabList
        accessibilityLabel="Tab detail spesies"
        items={tabItems}
        onSelect={tab => setActiveTab(tab as DetailTabId)}
        selectedId={safeActiveTab}
      />

      {safeActiveTab === 'overview' ? (
        <KolamContentFrame
          style={styles.summaryCard}
          variant="settingsWebConfig"
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>i</Text>
            </View>
            <Text style={styles.cardTitle}>Ringkasan</Text>
          </View>
          <View style={styles.summaryBody}>
            <View style={styles.sidebarColumn}>
              {mediaItems.length ? (
                <KolamDetailMediaPreview
                  items={mediaItems}
                  title={commonName || title}
                />
              ) : (
                <View style={styles.mediaPanel}>{hero}</View>
              )}
              {voiceUri ? <VoicePanel voiceUri={voiceUri} /> : null}
              <KolamBarcodePanel
                name={commonName || title}
                onPrint={onPrintBarcode}
                priceLabel={priceLabel}
                sku={sku || title}
              />
              <View style={styles.miniGrid}>
                <MiniTile label="Status">
                  <KolamStatusBadge
                    intent={sellable ? 'success' : 'muted'}
                    label={sellable ? 'Dijual' : 'Tidak dijual'}
                  />
                </MiniTile>
                <MiniTile label="Daftar Keinginan">
                  <Text style={styles.mutedDash}>-</Text>
                </MiniTile>
                <MiniTile label="Merek">
                  <Text style={styles.mutedDash}>-</Text>
                </MiniTile>
              </View>
              <View style={styles.miniGrid}>
                <MiniTile label="Stok">
                  {stock <= 0 ? (
                    <KolamStatusBadge intent="danger" label="Habis" />
                  ) : (
                    <Text style={styles.miniValue}>{String(stock)}</Text>
                  )}
                </MiniTile>
                <MiniTile label="(-)Stok">
                  {stock > 0 && stock <= lowStockThreshold ? (
                    <KolamStatusBadge intent="warning" label="Rendah" />
                  ) : (
                    <Text style={styles.miniMutedValue}>
                      {String(lowStockThreshold)}
                    </Text>
                  )}
                </MiniTile>
                <MiniTile label="Satuan">
                  <Text style={styles.miniValue}>{unitLabel || '-'}</Text>
                </MiniTile>
              </View>
              {hasVariants ? (
                <Text style={styles.variantStockNote}>
                  Stok = total semua varian
                </Text>
              ) : null}
              <ExternalLinkTiles
                externalLinks={externalLinks}
              />
              {sidebarGroups.length ? (
                <View style={styles.sidebarGroupStack}>
                  {sidebarGroups.map(group => (
                    <SidebarChipGroup group={group} key={group.label} />
                  ))}
                </View>
              ) : null}
              <View style={styles.metaPanel}>
                {meta.map(item => (
                  <MetaRow item={item} key={`${item.label}-${item.value}`} />
                ))}
              </View>
            </View>
            <View style={styles.mainColumn}>
              {sku ? (
                <View style={styles.titleBlock}>
                  <CopyableSkuChip sku={sku} />
                </View>
              ) : null}
              {translationSection ? (
                <DetailSectionPanel compact section={translationSection} />
              ) : null}
            </View>
          </View>
        </KolamContentFrame>
      ) : safeActiveTab === 'pricing' ? (
        <PricingPanel
          sections={visibleSections}
          species={species}
        />
      ) : safeActiveTab === 'statistics' ? (
        <KolamEntityStatisticsPanel
          description="Penjualan, pembelian, dan performa lifestock."
          entityId={species.id}
          entityType="species"
        />
      ) : safeActiveTab === 'location' ? (
        <LocationPanel species={species} />
      ) : safeActiveTab === 'logistics' ? (
        <LogisticsPanel sections={visibleSections} species={species} />
      ) : safeActiveTab === 'materials' ? (
        <MaterialsPanel sections={visibleSections} species={species} />
      ) : safeActiveTab === 'more' ? (
        <MorePanel sections={visibleSections} species={species} />
      ) : safeActiveTab === 'assets' ? (
        <KolamSpeciesDetailAssetsPanel species={species} />
      ) : (
        <View style={styles.sectionGrid}>
          {visibleSections.length ? (
            visibleSections.map(section => (
              <DetailSectionPanel key={section.title} section={section} />
            ))
          ) : (
            <PlaceholderPanel
              description="Belum ada data pada tab ini dari server/cache lokal."
              title={TAB_LABELS[safeActiveTab]}
            />
          )}
        </View>
      )}
    </View>
  );
}

function CopyableSkuChip({ compact = false, sku }: { compact?: boolean; sku: string }) {
  const [copied, setCopied] = React.useState(false);
  const safeSku = sku.trim();
  const copySku = () => {
    if (!safeSku) {
      return;
    }
    void copyTextToClipboard(safeSku).then(ok => {
      if (!ok) {
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  if (!safeSku) {
    return <Text style={styles.codeValue}>-</Text>;
  }

  return (
    <View style={[styles.copySkuWrap, compact ? styles.copySkuWrapCompact : null]}>
      <KolamInteractionFrame
        accessibilityLabel={`Salin SKU ${safeSku}`}
        onPress={copySku}
        style={[styles.titleSkuChip, compact ? styles.titleSkuChipCompact : null]}
      >
        <Text style={styles.titleSkuText}>SKU: {safeSku}</Text>
      </KolamInteractionFrame>
      <KolamButton
        accessibilityLabel={`Salin SKU ${safeSku}`}
        intent={copied ? 'primary' : 'outline'}
        label={copied ? 'Disalin' : 'Salin'}
        onPress={copySku}
        style={styles.copySkuButton}
      />
    </View>
  );
}
function VoicePanel({ voiceUri }: { voiceUri: string }) {
  return (
    <View style={styles.voicePanel}>
      <View style={styles.voiceHeader}>
        <Text style={styles.voiceLabel}>Suara</Text>
        <KolamStatusBadge intent="muted" label="Audio" />
      </View>
      <KolamMediaPlayer
        kind="audio"
        title="Suara spesies"
        uri={voiceUri}
        style={styles.voicePlayer}
      />
    </View>
  );
}
function SidebarChipGroup({ group }: { group: SpeciesSidebarGroup }) {
  return (
    <View style={styles.sidebarGroup}>
      <Text style={styles.sidebarGroupLabel}>{group.label}</Text>
      {group.chips.length ? (
        <View style={styles.sidebarChipWrap}>
          {group.chips.map(chip => (
            <SidebarChip chip={chip} key={chip.id} />
          ))}
        </View>
      ) : (
        <Text style={styles.sidebarGroupEmpty}>{group.emptyText ?? '-'}</Text>
      )}
    </View>
  );
}

function SidebarChip({ chip }: { chip: SpeciesSidebarChip }) {
  if (chip.tone === 'category') {
    return <KolamCategoryLabel label={chip.label} onPress={chip.onPress} />;
  }

  const content = (
    <View style={styles.sidebarChipContent}>
      {chip.imageUri ? (
        <KolamRemoteImage
          accessibilityLabel={`Logo ${chip.label}`}
          resizeMode="contain"
          revision={chip.imageUri}
          scope="iucn-status"
          sourceUri={chip.imageUri}
          style={styles.sidebarChipImage}
        />
      ) : null}
      <Text
        numberOfLines={2}
        style={[
          styles.sidebarChipText,
          chip.onPress ? styles.sidebarChipLink : null,
        ]}
      >
        {chip.label}
      </Text>
    </View>
  );

  if (!chip.onPress) {
    return <View style={styles.sidebarChip}>{content}</View>;
  }

  return (
    <KolamInteractionFrame
      accessibilityLabel={`Buka ${chip.label}`}
      onPress={chip.onPress}
      style={styles.sidebarChip}
    >
      {content}
    </KolamInteractionFrame>
  );
}
function ExternalLinkTiles({
  externalLinks,
}: {
  externalLinks: ExternalLink[];
}) {
  const visibleLinks = externalLinks.filter(link => link.value).slice(0, 3);

  return (
    <View style={styles.linkTileGrid}>
      {visibleLinks.length ? (
        visibleLinks.map(link => (
          <ExternalLinkTile
            key={`${link.name}-${link.value}`}
            label={getExternalLinkDisplayLabel(link)}
            link={link}
            mark={getExternalLinkMark(link)}
          />
        ))
      ) : (
        <MiniTile label="Tautan Eksternal">
          <Text style={styles.mutedDash}>-</Text>
        </MiniTile>
      )}
    </View>
  );
}
function getExternalLinkDisplayLabel(link: ExternalLink) {
  switch (normalizeLinkName(link.name)) {
    case 'shopee':
      return 'Shopee';
    case 'tokopedia':
      return 'Tokopedia';
    case 'website':
      return 'Situs Web';
    case 'link_pos':
      return 'Tautan POS';
    case 'other_link':
      return 'Tautan Lain';
    default:
      return link.label || 'Tautan Eksternal';
  }
}

function getExternalLinkMark(link: ExternalLink) {
  switch (normalizeLinkName(link.name)) {
    case 'shopee':
      return 'S';
    case 'tokopedia':
      return 'T';
    case 'website':
      return 'W';
    case 'link_pos':
      return 'P';
    default:
      return 'L';
  }
}
function ExternalLinkTile({
  label,
  link,
  mark,
}: {
  label: string;
  link?: ExternalLink;
  mark: string;
}) {
  const content = (
    <MiniTile label={label}>
      {link?.value ? (
        <View style={styles.marketIcon}>
          {getMarketplaceLogo(label) ? (
            <Image
              resizeMode="cover"
              source={getMarketplaceLogo(label)}
              style={styles.marketLogo}
            />
          ) : (
            <Text style={styles.marketIconText}>{mark}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.mutedDash}>-</Text>
      )}
    </MiniTile>
  );

  if (!link?.value) {
    return content;
  }

  return (
    <KolamInteractionFrame
      accessibilityLabel={`Buka ${label}`}
      onPress={
        link.onPress ??
        (() => {
          void Linking.openURL(normalizeUrl(link.value));
        })
      }
      style={styles.linkTilePressable}
    >
      {content}
    </KolamInteractionFrame>
  );
}

function MiniTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.miniTile}>
      <Text style={styles.miniLabel}>{label}</Text>
      <View style={styles.miniContent}>{children}</View>
    </View>
  );
}

function MetaRow({ item }: { item: KolamLabelFieldMeta & { valueNode?: React.ReactNode } }) {
  const content = (
    <View style={styles.metaRowContent}>
      <Text style={styles.metaLabel}>{item.label}</Text>
      {item.valueNode ? (
        item.valueNode
      ) : (
        <Text
          style={[styles.metaValue, item.onPress ? styles.metaLink : null]}
          numberOfLines={3}
        >
          {item.value || '-'}
        </Text>
      )}
    </View>
  );

  if (!item.onPress) {
    return <View style={styles.metaRow}>{content}</View>;
  }

  return (
    <KolamInteractionFrame
      accessibilityLabel={`Buka ${item.label}`}
      onPress={item.onPress}
      style={styles.metaRow}
    >
      {content}
    </KolamInteractionFrame>
  );
}

function DetailSectionPanel({
  compact = false,
  section,
}: {
  compact?: boolean;
  section: KolamLabelFieldDetailSection;
}) {
  const [openKey, setOpenKey] = React.useState<string | null>(
    section.accordion && section.items?.length
      ? getItemKey(section.items[0], 0)
      : null,
  );

  React.useEffect(() => {
    if (!section.accordion || !section.items?.length) {
      setOpenKey(null);
      return;
    }

    const keys = section.items.map(getItemKey);
    if (!openKey || !keys.includes(openKey)) {
      setOpenKey(keys[0]);
    }
  }, [openKey, section.accordion, section.items]);

  return (
    <KolamContentFrame
      style={[styles.sectionCard, compact ? styles.sectionCardCompact : null]}
      variant="settingsWebConfig"
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.description ? (
            <Text style={styles.sectionDescription}>{section.description}</Text>
          ) : null}
        </View>
        <KolamStatusBadge intent="muted" label={String(section.total)} />
      </View>
      <View style={styles.sectionBody}>
        <SectionItems
          openKey={openKey}
          section={section}
          setOpenKey={setOpenKey}
        />
      </View>
    </KolamContentFrame>
  );
}

function SectionItems({
  openKey,
  section,
  setOpenKey,
}: {
  openKey: string | null;
  section: KolamLabelFieldDetailSection;
  setOpenKey: (key: string | null) => void;
}) {
  if (!section.items?.length) {
    return <Text style={styles.emptyText}>{section.emptyText}</Text>;
  }

  if (section.title === 'Konten per bahasa') {
    return (
      <KolamDetailLocaleTabs
        emptyText={section.emptyText}
        items={section.items}
      />
    );
  }

  if (!section.accordion) {
    return (
      <View style={styles.itemList}>
        {section.items.map((item, index) => (
          <DetailItem item={item} key={getItemKey(item, index)} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.itemList}>
      {section.items.map((item, index) => {
        const key = getItemKey(item, index);
        const isOpen = openKey === key;

        return (
          <View key={key} style={styles.accordionItem}>
            <KolamInteractionFrame
              accessibilityLabel={`${isOpen ? 'Tutup' : 'Buka'} ${item.title}`}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpenKey(isOpen ? null : key)}
              style={styles.accordionHeader}
            >
              <View style={styles.accordionCopy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.value ? (
                  <Text style={styles.itemSummary}>{item.value}</Text>
                ) : null}
              </View>
              {item.badge ? (
                <KolamStatusBadge intent="success" label={item.badge} />
              ) : null}
              <Text style={styles.chevron}>{isOpen ? '^' : 'v'}</Text>
            </KolamInteractionFrame>
            {isOpen ? <DetailItem expanded item={item} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function DetailItem({
  expanded = false,
  item,
}: {
  expanded?: boolean;
  item: KolamLabelFieldDetailSectionItem;
}) {
  return (
    <View
      style={[styles.detailItem, expanded ? styles.detailItemExpanded : null]}
    >
      {item.thumbnail ? (
        <View style={styles.itemThumb}>{item.thumbnail}</View>
      ) : null}
      <View style={styles.itemCopy}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.value ? (
          containsHtmlMarkup(item.value) ? (
            <KolamHtmlContent html={item.value} style={styles.itemHtmlValue} />
          ) : (
            <Text style={styles.itemValue}>{item.value}</Text>
          )
        ) : null}
        {item.meta ? (
          containsHtmlMarkup(item.meta) ? (
            <KolamHtmlContent html={item.meta} style={styles.itemHtmlMeta} />
          ) : (
            <Text style={styles.itemMeta}>{item.meta}</Text>
          )
        ) : null}
      </View>
      {item.badge && !expanded ? (
        <KolamStatusBadge intent="success" label={item.badge} />
      ) : null}
    </View>
  );
}

type PricingSupportState = {
  analyses: Record<string, KolamChannelPricingAnalysis | null>;
  error: string;
  loading: boolean;
  paymentMethods: KolamPricingPaymentMethod[];
  sources: KolamPricingSource[];
  taxEstimate: KolamTaxEstimate;
};

const defaultTaxEstimate: KolamTaxEstimate = {
  ppnRate: 11,
  pricesIncludeTax: true,
};

function PricingPanel({
  species,
}: {
  sections: KolamLabelFieldDetailSection[];
  species: KolamSpecies;
}) {
  const variants = Array.isArray(species.variants) ? species.variants : [];
  const hasVariants = variants.length > 0;
  const [syncPriceDialogOpen, setSyncPriceDialogOpen] = React.useState(false);
  const [syncPricePlatforms, setSyncPricePlatforms] = React.useState<Array<'tokopedia' | 'shopee'>>(['tokopedia', 'shopee']);
  const openSyncPrice = React.useCallback((platforms: Array<'tokopedia' | 'shopee'>) => {
    setSyncPricePlatforms(platforms);
    setSyncPriceDialogOpen(true);
  }, []);
  const [support, setSupport] = React.useState<PricingSupportState>({
    analyses: {},
    error: '',
    loading: false,
    paymentMethods: [],
    sources: [],
    taxEstimate: defaultTaxEstimate,
  });

  React.useEffect(() => {
    let active = true;
    setSupport(current => ({ ...current, loading: true, error: '' }));
    Promise.all([
      fetchKolamActivePricingSources(),
      fetchKolamPricingPaymentMethods(),
      fetchKolamTaxEstimate(),
      fetchKolamChannelPricingAnalysis({ entityId: species.id, entityType: 'species' }),
    ])
      .then(([sources, paymentMethods, taxEstimate, rootAnalysis]) => {
        if (!active) {
          return;
        }
        const analyses: Record<string, KolamChannelPricingAnalysis | null> = {
          root: rootAnalysis as KolamChannelPricingAnalysis | null,
        };
        setSupport({
          analyses,
          error: '',
          loading: false,
          paymentMethods: paymentMethods as KolamPricingPaymentMethod[],
          sources: sources as KolamPricingSource[],
          taxEstimate: taxEstimate as KolamTaxEstimate,
        });
      })
      .catch(error => {
        if (!active) {
          return;
        }
        setSupport(current => ({
          ...current,
          error: error instanceof Error ? error.message : 'Gagal memuat analisa harga.',
          loading: false,
        }));
      });

    return () => {
      active = false;
    };
  }, [species.id]);

  return (
    <View style={styles.pricingStack}>
      {support.loading ? <Text style={styles.pricingMuted}>Memuat analisa harga...</Text> : null}
      {support.error ? <KolamStatusBadge intent="warning" label={support.error} /> : null}
      {hasVariants ? (
        <VariantPricingSection onOpenSyncPrice={openSyncPrice} pricingSupport={support} species={species} variants={variants} />
      ) : (
        <RootPricingSection onOpenSyncPrice={openSyncPrice} pricingSupport={support} species={species} />
      )}
      <KolamMarketplacePriceSyncDialog
        initialPlatforms={syncPricePlatforms}
        itemCount={Math.max(1, variants.length || 1)}
        onOpenChange={setSyncPriceDialogOpen}
        source="species"
        speciesIds={[species.id]}
        syncKind="price"
        visible={syncPriceDialogOpen}
      />
    </View>
  );
}

function RootPricingSection({
  onOpenSyncPrice,
  pricingSupport,
  species,
}: {
  onOpenSyncPrice: (platforms: Array<'tokopedia' | 'shopee'>) => void;
  pricingSupport: PricingSupportState;
  species: KolamSpecies;
}) {
  const rootRaw = React.useMemo(() => getRawRecord(species.raw), [species.raw]);
  const rootCost = getRootStoredPrice(species);
  const onlinePrice = getRootOnlinePrice(species);
  const marketPrice = getRootMarketPrice(species);
  const minimumPriceToSales = getRootMinimumPriceToSales(species);
  const minimumOrderQty = getRootMinimumOrderQty(species);
  const marketplacePricePlatforms = React.useMemo(() => getMarketplacePricePlatforms(species), [species]);
  const activeVendorPrices = React.useMemo(() => getRootVendorPrices(species), [species]);
  const grocerPricingTiers = React.useMemo(() => getGrocerPricingTiers(species), [species]);
  const rootComponents = React.useMemo(
    () => (Array.isArray(species.rootComponents) ? species.rootComponents : []),
    [species.rootComponents],
  );
  const rootPackings = React.useMemo(
    () => (Array.isArray(species.packings) ? species.packings : []),
    [species.packings],
  );
  const hppBasis = React.useMemo(
    () =>
      getSpeciesHppBasis({
        components: rootComponents,
        minimumOrderQty,
        packings: rootPackings,
        storedPrice: rootCost,
        vendorPrices: activeVendorPrices,
      }),
    [activeVendorPrices, minimumOrderQty, rootComponents, rootCost, rootPackings],
  );

  return (
    <>
      <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
        <View style={styles.pricingCardHeader}>
          <Text style={styles.sectionTitle}>Harga & Penjualan</Text>
        </View>
        <KolamPricingMetricsGrid>
          <KolamPricingMetric label="Harga Produk">
            {species.priceToSell > 0 ? (
              <>
                <Text style={styles.pricingValue}>{formatCurrency(species.priceToSell)}</Text>
                {species.unitLabel ? <Text style={styles.pricingMuted}>/ {species.unitLabel}</Text> : null}
              </>
            ) : (
              <Text style={styles.pricingMuted}>Belum ada harga jual</Text>
            )}
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Tokopedia/Shopee" fullWidth>
            {onlinePrice > 0 ? (
              <Text style={styles.pricingValue}>{formatCurrency(onlinePrice)}</Text>
            ) : (
              <Text style={styles.pricingMuted}>Belum ada harga olshop</Text>
            )}
            <KolamPricingMarketplaceSyncFooter onOpenSyncPrice={onOpenSyncPrice} platforms={marketplacePricePlatforms} />
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Pasar">
            <Text style={styles.pricingValue}>{marketPrice > 0 ? formatCurrency(marketPrice) : 'Belum ada harga pasar'}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga jual minimum">
            <Text style={styles.pricingValue}>{formatCurrency(minimumPriceToSales)}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Min. pembelian">
            <Text style={styles.pricingValue}>{minimumOrderQty || '-'}</Text>
          </KolamPricingMetric>
          <SpeciesHppBasisMetric basis={hppBasis} />
          <KolamPricingMetric label="Pajak">
            <View style={styles.inlineMetricRow}>
              <Text style={styles.pricingDanger}>{formatNumber(pricingSupport.taxEstimate.ppnRate)}%</Text>
              <KolamStatusBadge intent="muted" label="PPN" />
            </View>
          </KolamPricingMetric>
          <KolamPricingMetric label="Poin member">
            <MemberPointsValue points={species.memberPoints} />
          </KolamPricingMetric>
          <KolamPricingMetric label="Komisi">
            <Text style={styles.pricingDanger}>{formatCommission(species)}</Text>
          </KolamPricingMetric>

        </KolamPricingMetricsGrid>
      </KolamContentFrame>

      <KolamInternalProfitCard
        commission={getSpeciesCommissionModel(species)}
        components={rootComponents}
        cost={rootCost}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        minimumOrderQty={minimumOrderQty}
        minimumPriceToSales={minimumPriceToSales}
        packings={rootPackings}
        paymentMethods={pricingSupport.paymentMethods}
        priceToSell={species.priceToSell}
        taxEstimate={pricingSupport.taxEstimate}
        vendorPrices={activeVendorPrices}
      />

      {grocerPricingTiers.length ? (
        <KolamGrocerPricingCard
          description="Harga bertingkat untuk pembelian dalam jumlah besar (POS & webstore)."
          formatCurrency={formatCurrency}
          tiers={grocerPricingTiers}
          title="Harga grosir"
        />
      ) : null}

      <KolamMarketplaceProfitAnalyzerCard
        analysis={pricingSupport.analyses.root}
        commission={getSpeciesCommissionModel(species)}
        cost={rootCost}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        minimumOrderQty={minimumOrderQty}
        onlinePrice={onlinePrice}
        platforms={marketplacePricePlatforms}
        priceToSell={species.priceToSell}
        sources={pricingSupport.sources}
        vendorPrices={activeVendorPrices}
      />
    </>
  );
}

function VariantPricingSection({
  onOpenSyncPrice,
  pricingSupport,
  species,
  variants,
}: {
  onOpenSyncPrice: (platforms: Array<'tokopedia' | 'shopee'>) => void;
  pricingSupport: PricingSupportState;
  species: KolamSpecies;
  variants: KolamSpecies['variants'];
}) {
  const tabs = variants.map((variant, index) => ({
    id: variant.id || String(index),
    index,
    label: getVariantTabLabel(variant, index),
    variant,
  }));
  const tabsKey = tabs.map(tab => tab.id).join('|');
  const [activeVariantId, setActiveVariantId] = React.useState(tabs[0]?.id ?? '0');
  const [variantAnalyses, setVariantAnalyses] = React.useState<Record<string, KolamChannelPricingAnalysis | null>>({});
  const [variantAnalysisLoading, setVariantAnalysisLoading] = React.useState(false);

  React.useEffect(() => {
    if (!tabs.some(tab => tab.id === activeVariantId)) {
      setActiveVariantId(tabs[0]?.id ?? '0');
    }
  }, [activeVariantId, tabsKey]);

  const activeTab = tabs.find(tab => tab.id === activeVariantId) ?? tabs[0];

  React.useEffect(() => {
    if (!activeTab?.variant.id || Object.prototype.hasOwnProperty.call(variantAnalyses, activeTab.variant.id)) {
      return;
    }

    let active = true;
    setVariantAnalysisLoading(true);
    fetchKolamChannelPricingAnalysis({
      entityId: species.id,
      entityType: 'species',
      variantId: activeTab.variant.id,
    })
      .then(analysis => {
        if (active) {
          setVariantAnalyses(current => ({
            ...current,
            [activeTab.variant.id]: analysis,
          }));
        }
      })
      .catch(() => {
        if (active) {
          setVariantAnalyses(current => ({
            ...current,
            [activeTab.variant.id]: null,
          }));
        }
      })
      .finally(() => {
        if (active) {
          setVariantAnalysisLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab?.variant.id, species.id, variantAnalyses]);

  const variant = activeTab?.variant;
  const marketplacePricePlatforms = React.useMemo(() => getMarketplacePricePlatforms(species), [species]);
  const rootComponents = React.useMemo(
    () => (Array.isArray(species.rootComponents) ? species.rootComponents : []),
    [species.rootComponents],
  );
  const rootPackings = React.useMemo(
    () => (Array.isArray(species.packings) ? species.packings : []),
    [species.packings],
  );
  const variantVendorPrices = React.useMemo(
    () => (Array.isArray(variant?.vendorPrices) ? variant.vendorPrices : []),
    [variant?.vendorPrices],
  );
  const variantGrocerPricingTiers = React.useMemo(() => getGrocerPricingTiers(variant), [variant]);
  const variantComponents = React.useMemo(
    () => (Array.isArray(variant?.componentOverrides) && variant.componentOverrides.length ? variant.componentOverrides : rootComponents),
    [rootComponents, variant],
  );
  const variantHppBasis = React.useMemo(
    () =>
      getSpeciesHppBasis({
        components: variantComponents,
        minimumOrderQty: variant?.minimumOrderQty || 1,
        packings: rootPackings,
        storedPrice: variant?.price || 0,
        vendorPrices: variantVendorPrices,
      }),
    [rootPackings, variant, variantComponents, variantVendorPrices],
  );

  if (!activeTab || !variant) {
    return null;
  }

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.pricingCardHeader}>
        <Text style={styles.sectionTitle}>Harga Varian</Text>
        <Text style={styles.sectionDescription}>
          Sub-tab per varian mengikuti susunan FE: harga, analisa internal, marketplace, lalu vendor.
        </Text>
      </View>
      <View style={styles.variantTabHeader}>
        <Text style={styles.variantTabLabel}>Varian :</Text>
        <View style={styles.variantTabList}>
          {tabs.map(tab => (
            <KolamButton
              accessibilityLabel={`Buka harga ${tab.label}`}
              intent={activeTab.id === tab.id ? 'primary' : 'outline'}
              key={tab.id}
              label={tab.label}
              onPress={() => setActiveVariantId(tab.id)}
              style={styles.variantTabButton}
            />
          ))}
        </View>
      </View>
      <View style={styles.variantPricingPanel}>
        <Text style={styles.variantPricingTitle}>{activeTab.label}</Text>
        {variantAnalysisLoading ? <Text style={styles.pricingMuted}>Memuat analisa varian...</Text> : null}
        <KolamPricingMetricsGrid compact>
          <KolamPricingMetric label="SKU">
            <CopyableSkuChip compact sku={variant.sku || variant.productCode || ''} />
          </KolamPricingMetric>
          <KolamPricingMetric label="Stok">
            <View style={styles.inlineMetricRow}>
              <KolamStatusBadge
                intent={variant.stock <= 0 ? 'danger' : 'success'}
                label={variant.stock <= 0 ? '0' : formatNumber(variant.stock)}
              />

            </View>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Produk">
            <Text style={styles.pricingValue}>{formatCurrency(variant.priceToSell)}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Tokopedia/Shopee" fullWidth>
            <Text style={styles.pricingValue}>{formatCurrency(variant.onlinePrice)}</Text>
            <KolamPricingMarketplaceSyncFooter onOpenSyncPrice={onOpenSyncPrice} platforms={marketplacePricePlatforms} />
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga Pasar">
            <Text style={styles.pricingValue}>{formatCurrency(variant.marketPrice)}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Harga jual minimum">
            <Text style={styles.pricingValue}>{formatCurrency(variant.minimumPriceToSales)}</Text>
          </KolamPricingMetric>
          <KolamPricingMetric label="Min. pembelian">
            <Text style={styles.pricingValue}>{variant.minimumOrderQty || '-'}</Text>
          </KolamPricingMetric>
          <SpeciesHppBasisMetric basis={variantHppBasis} />
          <KolamPricingMetric label="Pajak">
            <View style={styles.inlineMetricRow}>
              <Text style={styles.pricingDanger}>{formatNumber(pricingSupport.taxEstimate.ppnRate)}%</Text>
              <KolamStatusBadge intent="muted" label="PPN" />
            </View>
          </KolamPricingMetric>
          <KolamPricingMetric label="Poin Member">
            <MemberPointsValue points={variant.memberPoints} />
          </KolamPricingMetric>
          <KolamPricingMetric label="Komisi">
            <Text style={styles.pricingDanger}>{formatVariantCommission(variant, species)}</Text>
          </KolamPricingMetric>
        </KolamPricingMetricsGrid>
        {variantGrocerPricingTiers.length ? (
          <View style={styles.variantGrocerBlock}>
            <Text style={styles.pricingSubTitle}>Harga Grocer</Text>
            <KolamGrocerTierPills formatCurrency={formatCurrency} tiers={variantGrocerPricingTiers} />
          </View>
        ) : null}
        <KolamInternalProfitCard
          commission={getVariantCommissionModel(variant, species)}
          components={variantComponents}
          cost={variant.price}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          minimumOrderQty={variant.minimumOrderQty || 1}
          minimumPriceToSales={variant.minimumPriceToSales}
          packings={rootPackings}
          paymentMethods={pricingSupport.paymentMethods}
          priceToSell={variant.priceToSell}
          taxEstimate={pricingSupport.taxEstimate}
          vendorPrices={variantVendorPrices}
        />
        <KolamMarketplaceProfitAnalyzerCard
          analysis={variantAnalyses[variant.id]}
          commission={getVariantCommissionModel(variant, species)}
          cost={variant.price}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          minimumOrderQty={variant.minimumOrderQty || 1}
          onlinePrice={variant.onlinePrice}
          platforms={marketplacePricePlatforms}
          priceToSell={variant.priceToSell}
          sources={pricingSupport.sources}
          vendorPrices={variantVendorPrices}
        />
        {variantHppBasis.kind === 'vendor' && variantVendorPrices.length ? (
          <KolamVendorPriceCard
            badge={activeTab.label}
            description="Harga vendor untuk varian aktif. Baris termurah ditandai Terbaik."
            formatCurrency={formatCurrency}
            prices={variantVendorPrices}
            title="Harga Vendor"
          />
        ) : null}
      </View>
    </KolamContentFrame>
  );
}
function getVariantTabLabel(variant: KolamSpecies['variants'][number], index: number) {
  return variant.label || [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') || `Varian ${index + 1}`;
}
function MemberPointsValue({ points }: { points?: KolamSpecies['memberPoints'] }) {
  if (points?.enabled && points.points > 0) {
    return <Text style={styles.pricingValue}>{formatNumber(points.points)} pts</Text>;
  }

  return <KolamStatusBadge intent="muted" label="Nonaktif" />;
}

type PricingCommissionModel = {
  enabled: boolean;
  type: KolamSpeciesCommissionType;
  value: number;
};

type PricingHppParts = {
  vendorBatch: number;
  bomBatch: number;
  storedBatch: number;
  productBatch: number;
};

type SpeciesHppBasis =
  | { bomCost: number; kind: 'bom'; packingCost: number; total: number }
  | { kind: 'vendor'; total: number }
  | { kind: 'stored'; total: number };

function SpeciesHppBasisMetric({ basis }: { basis: SpeciesHppBasis }) {
  if (basis.kind === 'bom') {
    return (
      <KolamPricingMetric label="Harga BOM" fullWidth>
        <View style={styles.hppBasisStack}>
          {basis.bomCost > 0 ? (
            <View style={styles.hppBasisRow}>
              <Text style={styles.pricingMuted}>Harga bahan baku</Text>
              <Text style={styles.pricingDanger}>{formatCurrency(basis.bomCost)}</Text>
            </View>
          ) : null}
          {basis.packingCost > 0 ? (
            <View style={styles.hppBasisRow}>
              <Text style={styles.pricingMuted}>Harga kemasan</Text>
              <Text style={styles.pricingDanger}>{formatCurrency(basis.packingCost)}</Text>
            </View>
          ) : null}
          <View style={styles.hppBasisRow}>
            <Text style={styles.pricingMuted}>Total BOM</Text>
            <Text style={styles.pricingValue}>{formatCurrency(basis.total)}</Text>
          </View>
        </View>
      </KolamPricingMetric>
    );
  }

  if (basis.kind === 'vendor') {
    return (
      <KolamPricingMetric label="Harga vendor" fullWidth>
        <Text style={styles.pricingDanger}>{formatCurrency(basis.total)}</Text>
      </KolamPricingMetric>
    );
  }

  return (
    <KolamPricingMetric label="HPP tersimpan" fullWidth>
      <Text style={styles.pricingValue}>{formatCurrency(basis.total)}</Text>
    </KolamPricingMetric>
  );
}

function DeductionLine({ amount, label }: { amount: number; label: string }) {
  if (amount <= 0) {
    return null;
  }

  return (
    <View style={styles.profitLine}>
      <Text style={styles.pricingMuted}>{label}</Text>
      <Text style={styles.pricingDanger}>-{formatCurrency(amount)}</Text>
    </View>
  );
}

function getRootStoredPrice(species: KolamSpecies) {
  return firstPositiveNumber(species.price, getRawRecord(species.raw).price);
}

function getRootOnlinePrice(species: KolamSpecies) {
  return firstPositiveNumber(species.onlinePrice, getRawRecord(species.raw).onlinePrice);
}

function getRootMarketPrice(species: KolamSpecies) {
  return firstPositiveNumber(species.marketPrice, getRawRecord(species.raw).marketPrice);
}

function getRootMinimumPriceToSales(species: KolamSpecies) {
  return firstPositiveNumber(
    species.minimumPriceToSales,
    getRawRecord(species.raw).minimum_price_to_sales,
    getRawRecord(species.raw).minimumPriceToSales,
  );
}

function getRootMinimumOrderQty(species: KolamSpecies) {
  return Math.max(
    1,
    firstPositiveNumber(
      species.minimumOrderQty,
      getRawRecord(species.raw).minimumOrderQty,
    ) || 1,
  );
}

function getSpeciesCommissionModel(species: KolamSpecies): PricingCommissionModel {
  return {
    enabled: species.commissionEnabled,
    type: species.commissionType,
    value: species.commissionValue,
  };
}

function getVariantCommissionModel(
  variant: KolamSpecies['variants'][number],
  species: KolamSpecies,
): PricingCommissionModel {
  if (variant.commissionEnabled) {
    return {
      enabled: true,
      type: variant.commissionType,
      value: variant.commissionValue,
    };
  }

  return getSpeciesCommissionModel(species);
}

function getInternalHppParts({
  components,
  minimumOrderQty,
  storedPrice,
  vendorPrices,
}: {
  components?: unknown;
  minimumOrderQty: number;
  storedPrice: number;
  vendorPrices: KolamSpecies['variants'][number]['vendorPrices'];
}): PricingHppParts {
  const minQty = Math.max(1, Number(minimumOrderQty) || 1);
  const bomUnit = getBomSubtotal(components);
  const vendorUnit = getLowestVendorCost(vendorPrices);
  const storedUnit = Math.max(0, Number(storedPrice) || 0);

  if (bomUnit > 0) {
    return {
      bomBatch: Math.round(bomUnit * minQty),
      productBatch: Math.round(bomUnit * minQty),
      storedBatch: 0,
      vendorBatch: 0,
    };
  }

  if (vendorUnit > 0) {
    return {
      bomBatch: 0,
      productBatch: Math.round(vendorUnit * minQty),
      storedBatch: 0,
      vendorBatch: Math.round(vendorUnit * minQty),
    };
  }

  return {
    bomBatch: 0,
    productBatch: Math.round(storedUnit * minQty),
    storedBatch: Math.round(storedUnit * minQty),
    vendorBatch: 0,
  };
}

function getSpeciesHppBasis({
  components,
  minimumOrderQty,
  packings,
  storedPrice,
  vendorPrices,
}: {
  components?: unknown;
  minimumOrderQty: number;
  packings?: unknown;
  storedPrice: number;
  vendorPrices: KolamSpecies['variants'][number]['vendorPrices'];
}): SpeciesHppBasis {
  const minQty = Math.max(1, Number(minimumOrderQty) || 1);
  const bomCost = Math.round(getBomSubtotal(components) * minQty);
  const packingCost = getPackingHppBatch(packings, minQty);
  if (bomCost > 0 || packingCost > 0) {
    return {
      bomCost,
      kind: 'bom',
      packingCost,
      total: bomCost + packingCost,
    };
  }

  const vendorCost = getLowestVendorCost(vendorPrices);
  if (vendorCost > 0) {
    return {
      kind: 'vendor',
      total: Math.round(vendorCost * minQty),
    };
  }

  return {
    kind: 'stored',
    total: Math.round(Math.max(0, Number(storedPrice) || 0) * minQty),
  };
}

function getBomSubtotal(components: unknown) {
  if (!Array.isArray(components)) {
    return 0;
  }

  return components.reduce((total, item) => {
    const record = getRawRecord(item);
    const product = getRawRecord(record.product);
    const unitPrice = firstPositiveNumber(product.price, record.price, record.unitPrice);
    const quantity = Math.max(0, Number(record.quantity) || 0);
    return total + unitPrice * quantity;
  }, 0);
}

function getLowestVendorCost(prices: KolamSpecies['variants'][number]['vendorPrices']) {
  const values = (Array.isArray(prices) ? prices : [])
    .map(price => firstPositiveNumber(price.totalCost, price.price + price.shippingCost, price.price))
    .filter(value => value > 0);
  return values.length ? Math.min(...values) : 0;
}

function getPackingHppBatch(packings: unknown, minimumOrderQty: number) {
  if (!Array.isArray(packings)) {
    return 0;
  }

  return packings.reduce((total, item) => {
    const record = getRawRecord(item);
    const packing = getRawRecord(record.packing);
    const unitCost = firstPositiveNumber(
      packing.cost,
      getLowestRawVendorCost(packing.vendorPrices),
      record.cost,
    );
    const quantity = Math.max(1, Number(record.quantity) || 1);
    const batchQuantity = Math.max(1, Math.ceil(quantity / Math.max(1, minimumOrderQty)));
    return total + unitCost * batchQuantity;
  }, 0);
}

function getLowestRawVendorCost(value: unknown) {
  if (!Array.isArray(value)) {
    return 0;
  }

  const values = value
    .map(item => {
      const record = getRawRecord(item);
      const price = Number(record.price) || 0;
      const shipping = Number(record.shippingCost) || 0;
      return firstPositiveNumber(record.totalCost, price + shipping, price);
    })
    .filter(amount => amount > 0);
  return values.length ? Math.min(...values) : 0;
}

function getCommissionAmount(
  netBaseBeforeCommission: number,
  commission: PricingCommissionModel,
  minimumOrderQty: number,
) {
  if (!commission.enabled || commission.value <= 0) {
    return 0;
  }

  if (commission.type === 'percentage') {
    return Math.round((netBaseBeforeCommission * commission.value) / 100);
  }

  return Math.round(commission.value * Math.max(1, minimumOrderQty));
}

function getCommissionLabel(commission: PricingCommissionModel) {
  return commission.type === 'percentage'
    ? `Komisi (${formatNumber(commission.value)}%)`
    : 'Komisi (tetap)';
}

function formatBatchLine(unitAmount: number, minimumOrderQty: number, totalAmount: number) {
  if (minimumOrderQty <= 1) {
    return formatCurrency(totalAmount);
  }

  return `${formatCurrency(unitAmount)} x ${formatNumber(minimumOrderQty)} = ${formatCurrency(totalAmount)}`;
}

function firstPositiveNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}
function splitPpnFromTotal(
  totalIdr: number,
  taxEstimate: KolamTaxEstimate,
): { dpp: number; ppn: number; total: number } {
  const total = Math.max(0, Number(totalIdr) || 0);
  const rate = (Number(taxEstimate.ppnRate) || 0) / 100;
  if (rate <= 0) {
    return { dpp: total, ppn: 0, total };
  }

  if (taxEstimate.pricesIncludeTax) {
    const dpp = Math.round(total / (1 + rate));
    const ppn = total - dpp;
    return { dpp, ppn, total };
  }

  const dpp = total;
  const ppn = Math.round(dpp * rate);
  return { dpp, ppn, total: dpp + ppn };
}

function resolveInternalCommissionNetBase(args: {
  sellPriceBatch: number;
  productHppBatch: number;
  packingHppBatch: number;
  paymentMethodCostBatch?: number;
  taxEstimate?: KolamTaxEstimate;
}): { ppnAmount: number; revenueBase: number; netBaseBeforeCommission: number } {
  const sell = Math.max(0, Number(args.sellPriceBatch) || 0);
  const productHpp = Math.max(0, Number(args.productHppBatch) || 0);
  const packingHpp = Math.max(0, Number(args.packingHppBatch) || 0);
  const pmCost = Math.max(0, Number(args.paymentMethodCostBatch) || 0);
  const ppnSplit = args.taxEstimate
    ? splitPpnFromTotal(sell, args.taxEstimate)
    : { dpp: sell, ppn: 0, total: sell };
  const usesDpp = Boolean(args.taxEstimate?.pricesIncludeTax && ppnSplit.ppn > 0);
  const revenueBase = usesDpp ? ppnSplit.dpp : sell;
  const ppnDeduction = usesDpp ? 0 : ppnSplit.ppn;
  const netBase = revenueBase - pmCost - productHpp - packingHpp - ppnDeduction;
  return {
    netBaseBeforeCommission: Math.max(0, Math.round(netBase)),
    ppnAmount: ppnSplit.ppn,
    revenueBase,
  };
}

function estimateRepresentativePaymentMethodCost(
  paymentMethods: KolamPricingPaymentMethod[] | undefined | null,
  baseAmount: number,
): { name: string; amount: number } | null {
  const base = Math.max(0, Number(baseAmount) || 0);
  if (base <= 0 || !paymentMethods?.length) {
    return null;
  }

  const candidates = paymentMethods.filter(
    paymentMethod => paymentMethod.isActive !== false && paymentMethod.costs.length > 0,
  );
  if (!candidates.length) {
    return null;
  }

  const paymentMethod = candidates[0];
  let total = 0;
  const names: string[] = [];
  for (const cost of paymentMethod.costs) {
    const amount = cost.type === 'percentage'
      ? Math.round((base * Number(cost.amount || 0)) / 100)
      : Math.round(Number(cost.amount) || 0);
    if (amount > 0) {
      total += amount;
      if (cost.name) {
        names.push(cost.name);
      }
    }
  }

  if (total <= 0) {
    return null;
  }

  return {
    amount: total,
    name: names.length
      ? `Biaya ${paymentMethod.name || 'pembayaran'} (${names.join(', ')})`
      : `Biaya ${paymentMethod.name || 'pembayaran'}`,
  };
}

function getRootWeightLabel(species: KolamSpecies) {
  if (!species.weight || species.weight.value <= 0) {
    return '-';
  }
  return `${formatNumber(species.weight.value)} ${species.weight.unitLabel || 'g'}`;
}

function getRootDimensionLabel(species: KolamSpecies) {
  if (!species.dimension) {
    return '-';
  }
  const dimension = species.dimension;
  return `${formatNumber(dimension.length)} x ${formatNumber(dimension.width)} x ${formatNumber(dimension.height)} ${dimension.unitLabel || 'cm'}`;
}
function getVariantWeightLabel(variant: KolamSpecies['variants'][number]) {
  if (variant.weightValue <= 0) {
    return '-';
  }
  return `${formatNumber(variant.weightValue)}${getVariantRawUnitLabel(getRawRecord(variant.raw).weight, variant.weightUnitId)}`;
}

function getVariantDimensionLabel(variant: KolamSpecies['variants'][number]) {
  if (!variant.dimensionLength && !variant.dimensionWidth && !variant.dimensionHeight) {
    return '-';
  }
  const unit = getVariantRawUnitLabel(getRawRecord(variant.raw).dimension, variant.dimensionUnitId);
  return `${formatNumber(variant.dimensionLength)} x ${formatNumber(variant.dimensionWidth)} x ${formatNumber(variant.dimensionHeight)}${unit}`;
}

function getVariantRawUnitLabel(rawContainer: unknown, fallbackId: string) {
  const record = getRawRecord(rawContainer);
  const unit = getRawRecord(record.unit);
  const label = String(unit.initial ?? unit.name ?? '').trim();
  if (label) {
    return ` ${label}`;
  }
  return fallbackId ? ` ${fallbackId}` : '';
}
function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
}

function getMarketplacePricePlatforms(species: KolamSpecies) {
  const platforms = species.marketplaceSync?.pricePlatforms;
  return Array.isArray(platforms) ? platforms : [];
}

function getGrocerPricingTiers(
  source: Pick<KolamSpecies, 'grocerPricingTiers'> | KolamSpecies['variants'][number],
) {
  return Array.isArray(source.grocerPricingTiers)
    ? source.grocerPricingTiers
    : [];
}
function getRawRecord(raw: unknown) {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

function getRawNumber(raw: unknown, key: string) {
  const record = getRawRecord(raw);
  const parsed = Number(record[key]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRootVendorPrices(species: KolamSpecies) {
  const rawVendorPrices = getRawRecord(species.raw).vendorPrices;
  if (!Array.isArray(rawVendorPrices)) {
    return [] as KolamSpecies['variants'][number]['vendorPrices'];
  }

  return rawVendorPrices.map((price, index) => {
    const record = getRawRecord(price);
    const priceValue = Number(record.price) || 0;
    const shippingCost = Number(record.shippingCost) || 0;
    const totalCost = Number(record.totalCost) || priceValue + shippingCost;
    const vendor = getRawRecord(record.vendor);
    return {
      id: String(record._id ?? record.id ?? index),
      link: String(record.link ?? ''),
      price: priceValue,
      priceHistory: Array.isArray(record.priceHistory)
        ? (record.priceHistory as KolamSpecies['variants'][number]['vendorPrices'][number]['priceHistory'])
        : [],
      shippingCost,
      totalCost,
      vendorId: String(record.vendorId ?? vendor._id ?? vendor.id ?? ''),
      vendorName: String(record.vendorName ?? vendor.name ?? '-'),
    };
  });
}

function getVendorRangeLabel(
  prices: KolamSpecies['variants'][number]['vendorPrices'],
) {
  const values = prices
    .map(price => price.totalCost || price.price || 0)
    .filter(value => value > 0);
  if (!values.length) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function getMarginLabel(sellPrice: number, costPrice: number) {
  if (sellPrice <= 0 || costPrice <= 0) {
    return '-';
  }

  return `${(((sellPrice - costPrice) / costPrice) * 100).toFixed(1)}%`;
}

function formatCommission(species: KolamSpecies) {
  if (!species.commissionEnabled) {
    return 'Nonaktif';
  }

  return species.commissionType === 'percentage'
    ? `${formatNumber(species.commissionValue)}%`
    : formatCurrency(species.commissionValue);
}

function formatVariantCommission(
  variant: KolamSpecies['variants'][number],
  species: KolamSpecies,
) {
  if (variant.commissionEnabled) {
    return variant.commissionType === 'percentage'
      ? `${formatNumber(variant.commissionValue)}%`
      : formatCurrency(variant.commissionValue);
  }

  return formatCommission(species);
}

function formatCurrency(value: number) {
  return formatRupiah(Number(value) || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
function formatDisplayDate(value: string) {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function StatisticsPanel({ species }: { species: KolamSpecies }) {
  const [period, setPeriod] = React.useState<KolamSpeciesStatisticsPeriod>('90d');
  const [statistics, setStatistics] = React.useState<KolamSpeciesStatistics | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadStatistics = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStatistics(await getKolamSpeciesStatistics(species.id, period));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Statistik tidak tersedia.');
    } finally {
      setLoading(false);
    }
  }, [period, species.id]);

  React.useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const summary = statistics?.summary;
  const hasSales = !!summary && summary.sales.orderCount > 0;
  const hasPurchases = !!summary && summary.purchases.orderCount > 0;

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Statistik</Text>
          <Text style={styles.sectionDescription}>Penjualan, pembelian, dan performa lifestock.</Text>
        </View>
        <KolamRefreshButton accessibilityLabel="Segarkan" disabled={loading} onPress={loadStatistics} />
      </View>
      <View style={styles.periodFilterRow}>
        {STATISTICS_PERIOD_OPTIONS.map(option => (
          <KolamButton
            intent={period === option.id ? 'primary' : 'outline'}
            key={option.id}
            label={option.label}
            onPress={() => setPeriod(option.id)}
            style={styles.periodFilterButton}
          />
        ))}
      </View>
      {error ? <Text style={styles.emptyText}>{error}</Text> : null}
      {summary ? (
        <View style={styles.statisticsStack}>
          <View style={styles.statisticsGrid}>
            <StatTile label="Penjualan" value={formatNumber(summary.sales.totalQuantity)} hint={`${formatCurrency(summary.sales.totalAmount)} | ${formatNumber(summary.sales.orderCount)} order`} />
            <StatTile label="Pembelian" value={formatNumber(summary.purchases.totalQuantity)} hint={`${formatCurrency(summary.purchases.totalValue)} | ${formatNumber(summary.purchases.orderCount)} PO`} />
            <StatTile label="Views" value={formatNumber(summary.viewCount)} />
            <StatTile label="Wishlist" value={formatNumber(summary.wishlistCount)} />
            <StatTile label="Rating" value={`${summary.averageRating.toFixed(1)} *`} hint={`${formatNumber(summary.totalReviews)} review`} />
            <StatTile label="Stok" value={formatNumber(summary.stock)} />
          </View>
          {(hasSales && statistics.monthlySales.length > 0) || (hasPurchases && statistics.monthlyPurchases.length > 0) ? (
            <View style={styles.statisticsListGrid}>
              {hasSales && statistics.monthlySales.length > 0 ? (
                <StatisticsTrendCard
                  rows={statistics.monthlySales.map(row => ({ label: `${row.monthName} ${row.year}`, quantity: row.totalQuantity, value: row.totalAmount }))}
                  title="Tren penjualan"
                />
              ) : null}
              {hasPurchases && statistics.monthlyPurchases.length > 0 ? (
                <StatisticsTrendCard
                  rows={statistics.monthlyPurchases.map(row => ({ label: `${row.monthName} ${row.year}`, quantity: row.totalQuantity, value: row.totalValue }))}
                  title="Tren pembelian"
                />
              ) : null}
            </View>
          ) : null}
          {statistics.variantSales.length ? (
            <View style={styles.locationListCard}>
              <Text style={styles.statisticsBlockTitle}>Penjualan per varian</Text>
              {statistics.variantSales.slice(0, 12).map((row, index) => (
                <View key={`${row.variantId || index}`} style={styles.locationListRow}>
                  <Text style={styles.logisticsMethodTitle}>{row.variantLabel || 'Default'}</Text>
                  <Text style={styles.logisticsMethodMeta}>{formatNumber(row.totalQuantity)} unit | {formatCurrency(row.totalAmount)}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.statisticsListGrid}>
            <StatisticsCompactCard emptyLabel="Belum ada penjualan." rows={statistics.recentSales} title="Invoice terkait" />
            <StatisticsCompactCard emptyLabel="Belum ada PO." rows={statistics.recentPurchaseOrders} title="Purchase order" />
          </View>
          {statistics.recentSales[0]?.createdAt ? (
            <Text style={styles.pricingMuted}>Terakhir transaksi: {formatDisplayDate(statistics.recentSales[0].createdAt)}</Text>
          ) : null}
        </View>
      ) : loading ? (
        <Text style={styles.emptyText}>Memuat statistik...</Text>
      ) : (
        <Text style={styles.emptyText}>Statistik tidak tersedia.</Text>
      )}
    </KolamContentFrame>
  );
}

const STATISTICS_PERIOD_OPTIONS: Array<{ id: KolamSpeciesStatisticsPeriod; label: string }> = [
  { id: '30d', label: '30 hari' },
  { id: '90d', label: '90 hari' },
  { id: '1y', label: '1 tahun' },
  { id: 'all', label: 'Semua' },
];

function StatTile({ hint, label, value }: { hint?: string; label: string; value: string }) {
  return (
    <View style={styles.statisticsTile}>
      <Text style={styles.pricingMetricLabel}>{label}</Text>
      <Text style={styles.pricingValue}>{value}</Text>
      {hint ? <Text style={styles.pricingMuted}>{hint}</Text> : null}
    </View>
  );
}

function StatisticsTrendCard({ rows, title }: { rows: Array<{ label: string; quantity: number; value: number }>; title: string }) {
  const max = Math.max(1, ...rows.map(row => row.quantity));
  return (
    <View style={[styles.locationListCard, styles.statisticsListCard]}>
      <Text style={styles.statisticsBlockTitle}>{title}</Text>
      <View style={styles.trendRows}>
        {rows.slice(-8).map(row => (
          <View key={`${title}-${row.label}`} style={styles.trendRow}>
            <Text style={styles.trendLabel}>{row.label}</Text>
            <View style={styles.trendTrack}>
              <View style={[styles.trendFill, { width: `${Math.max(4, Math.round((row.quantity / max) * 100))}%` }]} />
            </View>
            <Text style={styles.trendValue}>{formatNumber(row.quantity)} | {formatCurrency(row.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatisticsCompactCard({ emptyLabel, rows, title }: { emptyLabel: string; rows: KolamSpeciesStatistics['recentSales']; title: string }) {
  return (
    <View style={[styles.locationListCard, styles.statisticsListCard]}>
      <View style={styles.statisticsListHeader}>
        <Text style={styles.statisticsBlockTitle}>{title}</Text>
        <Text style={styles.pricingMuted}>{rows.length} item</Text>
      </View>
      {rows.length ? rows.slice(0, 8).map(row => (
        <View key={row.id} style={styles.locationListRow}>
          <View style={styles.logisticsMethodTitleWrap}>
            <Text style={styles.logisticsMethodTitle}>{row.primary}</Text>
            {row.secondary ? <Text style={styles.logisticsMethodMeta}>{row.secondary}</Text> : null}
          </View>
          <Text style={styles.logisticsMethodMeta}>{row.meta} | {formatCurrency(row.amount)}</Text>
        </View>
      )) : <Text style={styles.emptyText}>{emptyLabel}</Text>}
    </View>
  );
}

function formatShippingPrice(method: KolamSpecies['availableShippingMethods'][number]) {
  if (method.pricingPrice <= 0) {
    return 'Harga pengiriman belum disetel';
  }

  switch (method.pricingType) {
    case 'per_kg':
      return `${formatCurrency(method.pricingPrice)}/kg`;
    case 'per_km':
      return `${formatCurrency(method.pricingPrice)}/km`;
    case 'per_cubic_meter':
      return `${formatCurrency(method.pricingPrice)}/m3`;
    case 'fixed':
      return `${formatCurrency(method.pricingPrice)} tetap`;
    default:
      return formatCurrency(method.pricingPrice);
  }
}

function formatShippingEta(method: KolamSpecies['availableShippingMethods'][number]) {
  const min = method.estimatedMinDays;
  const max = method.estimatedMaxDays;
  if (!min && !max) {
    return 'Estimasi belum disetel';
  }
  if (min === max || !max) {
    return `${min || max} hari`;
  }
  return `${min}-${max} hari`;
}

function formatShippingCoverage(method: KolamSpecies['availableShippingMethods'][number]) {
  if (!method.restrictedRegions.length) {
    return 'Cakupan: semua wilayah tersedia';
  }
  const visibleRegions = method.restrictedRegions.slice(0, 3).join(', ');
  const rest = method.restrictedRegions.length - 3;
  return `Terbatas: ${visibleRegions}${rest > 0 ? ` +${rest} lagi` : ''}`;
}
function formatShippingLimits(method: KolamSpecies['availableShippingMethods'][number]) {
  const parts = [
    method.maximumWeight > 0 ? `Maks berat ${formatNumber(method.maximumWeight)}` : '',
    method.maximumDimensionLength || method.maximumDimensionWidth || method.maximumDimensionHeight
      ? `Maks dimensi ${formatNumber(method.maximumDimensionLength)} x ${formatNumber(method.maximumDimensionWidth)} x ${formatNumber(method.maximumDimensionHeight)}`
      : '',
  ].filter(Boolean);
  return parts.join(' | ');
}

function getRootVolumeLabel(species: KolamSpecies) {
  if (!species.dimension) {
    return '-';
  }
  return formatDimensionVolume(
    species.dimension.length,
    species.dimension.width,
    species.dimension.height,
    species.dimension.unitLabel,
  );
}

function getVariantVolumeLabel(variant: KolamSpecies['variants'][number]) {
  const unit = getVariantRawUnitLabel(getRawRecord(variant.raw).dimension, variant.dimensionUnitId).trim();
  return formatDimensionVolume(
    variant.dimensionLength,
    variant.dimensionWidth,
    variant.dimensionHeight,
    unit,
  );
}

function formatDimensionVolume(length: number, width: number, height: number, unit: string) {
  if (!length || !width || !height) {
    return '-';
  }
  return `${formatNumber(length * width * height)}${unit ? ` ${unit}3` : ''}`;
}

function LogisticsPanel({
  sections,
  species,
}: {
  sections: KolamLabelFieldDetailSection[];
  species: KolamSpecies;
}) {
  const variants = Array.isArray(species.variants) ? species.variants : [];
  const shippingMethods = Array.isArray(species.availableShippingMethods)
    ? species.availableShippingMethods
    : [];
  const rootWeight = getRootWeightLabel(species);
  const rootDimension = getRootDimensionLabel(species);
  const rootVolume = getRootVolumeLabel(species);
  const hasRootLogistics = rootWeight !== '-' || rootDimension !== '-' || rootVolume !== '-';
  const hasContent = shippingMethods.length > 0 || hasRootLogistics || variants.length > 0;

  return (
    <View style={styles.sectionGrid}>

      <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Logistik</Text>
            <Text style={styles.sectionDescription}>Metode pengiriman, berat, dimensi, volume, dan batas pengiriman.</Text>
          </View>
        </View>
        <View style={styles.logisticsVariantStack}>
          {shippingMethods.length ? (
            <View style={styles.logisticsPanelBlock}>
              <Text style={styles.variantPricingTitle}>Metode Pengiriman</Text>
              <View style={styles.logisticsShippingGrid}>
                {shippingMethods.map(method => {
                  const limits = formatShippingLimits(method);
                  return (
                    <View key={method.id} style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
                      <View style={styles.logisticsMethodHeader}>
                        {method.logoUri ? (
                          <KolamRemoteImage
                            accessibilityLabel={`Logo ${method.displayName}`}
                            resizeMode="contain"
                            revision={method.id}
                            scope="shipping-method-logo"
                            sourceUri={method.logoUri}
                            style={styles.logisticsMethodLogo}
                          />
                        ) : (
                          <View style={styles.logisticsMethodLogoFallback}>
                            <Text style={styles.logisticsMethodLogoFallbackText}>{method.displayName.slice(0, 1).toUpperCase()}</Text>
                          </View>
                        )}
                        <View style={styles.logisticsMethodTitleWrap}>
                          <Text style={styles.logisticsMethodTitle}>{method.displayName}</Text>
                          <Text style={styles.logisticsMethodMeta}>{formatShippingPrice(method)}</Text>
                        </View>
                        {method.category ? (
                          <KolamStatusBadge intent="muted" label={method.category} />
                        ) : null}
                      </View>
                      <Text style={styles.logisticsMethodMeta}>{formatShippingEta(method)}</Text>
                      <Text style={styles.logisticsMethodMeta}>{formatShippingCoverage(method)}</Text>
                      {limits ? <Text style={styles.logisticsMethodMeta}>{limits}</Text> : null}
                      {method.minimumOrderAmount > 0 ? (
                        <Text style={styles.logisticsMethodMeta}>
                          Min. order: {formatCurrency(method.minimumOrderAmount)}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {hasRootLogistics || variants.length ? (
            <View style={styles.logisticsPanelBlock}>
              <Text style={styles.variantPricingTitle}>Ukuran & Berat</Text>
              <View style={styles.logisticsShippingGrid}>
                {hasRootLogistics ? (
                  <View style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
                    <Text style={styles.logisticsMethodTitle}>Spesies</Text>
                    <KolamPricingMetricsGrid compact>
                      <KolamPricingMetric label="Berat">
                        <Text style={styles.pricingValue}>{rootWeight}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Dimensi">
                        <Text style={styles.pricingValue}>{rootDimension}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Volume">
                        <Text style={styles.pricingValue}>{rootVolume}</Text>
                      </KolamPricingMetric>
                    </KolamPricingMetricsGrid>
                  </View>
                ) : null}
                {variants.map((variant, index) => (
                  <View key={variant.id || String(index)} style={[styles.logisticsVariantCard, styles.logisticsHalfCard]}>
                    <Text style={styles.logisticsMethodTitle}>{getVariantTabLabel(variant, index)}</Text>
                    <KolamPricingMetricsGrid compact>
                      <KolamPricingMetric label="Berat">
                        <Text style={styles.pricingValue}>{getVariantWeightLabel(variant)}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Dimensi">
                        <Text style={styles.pricingValue}>{getVariantDimensionLabel(variant)}</Text>
                      </KolamPricingMetric>
                      <KolamPricingMetric label="Volume">
                        <Text style={styles.pricingValue}>{getVariantVolumeLabel(variant)}</Text>
                      </KolamPricingMetric>
                    </KolamPricingMetricsGrid>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {!hasContent ? (
            <Text style={styles.emptyText}>Belum ada data logistik dari server/cache lokal.</Text>
          ) : null}
        </View>
      </KolamContentFrame>

    </View>
  );
}

function LocationPanel({ species }: { species: KolamSpecies }) {
  const [allocation, setAllocation] = React.useState<KolamSpeciesEnclosureAllocation | null>(null);
  const [pendingRows, setPendingRows] = React.useState<KolamSpeciesPendingLivestockAllocation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadLocation = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextAllocation, nextPendingRows] = await Promise.all([
        getKolamSpeciesEnclosureAllocation(species.id),
        getKolamSpeciesPendingLivestockAllocations(species.id),
      ]);
      setAllocation(nextAllocation);
      setPendingRows(nextPendingRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat posisi dan lokasi.');
    } finally {
      setLoading(false);
    }
  }, [species.id]);

  React.useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  const placements = allocation?.placements ?? [];
  const variants = allocation?.variants ?? [];
  const unit = allocation?.unit || species.unitLabel || 'ekor';
  const pendingCount = allocation?.pendingAllocations ?? pendingRows.length;

  return (
    <View style={styles.sectionGrid}>

      <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Posisi & Lokasi</Text>
            <Text style={styles.sectionDescription}>Ringkasan alokasi posisi vs stok total livestock.</Text>
          </View>
          <KolamRefreshButton accessibilityLabel="Segarkan" disabled={loading} onPress={loadLocation} />
        </View>
        {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        {allocation ? (
          <View style={styles.logisticsVariantStack}>
            <View style={styles.locationMetricsGrid}>
              <KolamPricingMetric label="Stok total">
                <Text style={styles.pricingValue}>{formatNumber(allocation.totalStock)} {unit}</Text>
              </KolamPricingMetric>
              <KolamPricingMetric label="Sudah teralokasi">
                <Text style={styles.pricingValue}>{formatNumber(allocation.allocated)} {unit}</Text>
              </KolamPricingMetric>
              <KolamPricingMetric label="Belum teralokasi">
                <Text style={allocation.unallocated > 0 ? styles.pricingDanger : styles.pricingValue}>
                  {formatNumber(allocation.unallocated)} {unit}
                </Text>
              </KolamPricingMetric>
            </View>
            {pendingCount > 0 ? (
              <KolamStatusBadge intent="warning" label={`${pendingCount} perlu alokasi`} />
            ) : null}

            {variants.length ? (
              <View style={styles.locationListCard}>
                <Text style={styles.variantPricingTitle}>Varian</Text>
                {variants.map(variant => (
                  <View key={variant.variantId} style={styles.locationListRow}>
                    <Text style={styles.logisticsMethodTitle}>{variant.variantLabel || variant.variantId}</Text>
                    <Text style={styles.logisticsMethodMeta}>
                      {formatNumber(variant.allocated)}/{formatNumber(variant.totalStock)} {variant.unit || unit}
                      {variant.unallocated > 0 ? ` | +${formatNumber(variant.unallocated)} belum` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {pendingRows.length ? (
              <View style={styles.locationListCard}>
                <Text style={styles.variantPricingTitle}>Penjualan - perlu alokasi kandang</Text>
                {pendingRows.map(row => (
                  <View key={row.id} style={styles.locationListRow}>
                    <Text style={styles.logisticsMethodTitle}>{row.invoiceCode || row.saleId}</Text>
                    <Text style={styles.logisticsMethodMeta}>
                      {formatNumber(row.qtyRemaining)} {row.unitLabel || unit} menunggu alokasi{row.variantLabel ? ` | ${row.variantLabel}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.locationListCard}>
              <Text style={styles.variantPricingTitle}>Posisi per kandang</Text>
              {placements.length ? (
                placements.map((row, index) => (
                  <View key={`${row.enclosure.id}-${row.variantId ?? 'root'}-${index}`} style={styles.locationListRow}>
                    <Text style={styles.logisticsMethodTitle}>{row.enclosure.code || row.enclosure.name}</Text>
                    <Text style={styles.logisticsMethodMeta}>{row.displayLine || `${formatNumber(row.quantity)} ${row.unit || unit}`}</Text>
                    <KolamStatusBadge intent={row.enclosure.status === 'active' ? 'success' : 'muted'} label={row.enclosure.status || '-'} />
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Belum ditempatkan di kandang manapun.</Text>
              )}
            </View>
          </View>
        ) : loading ? (
          <Text style={styles.emptyText}>Memuat posisi dan lokasi...</Text>
        ) : (
          <Text style={styles.emptyText}>Data posisi dan lokasi tidak tersedia.</Text>
        )}
      </KolamContentFrame>
    </View>
  );
}

function MaterialsPanel({
  sections,
  species,
}: {
  sections: KolamLabelFieldDetailSection[];
  species: KolamSpecies;
}) {
  const rootComponents = Array.isArray(species.rootComponents) ? species.rootComponents : [];
  const variants = Array.isArray(species.variants) ? species.variants : [];
  const variantsWithComponents = variants
    .map((variant, index) => ({
      id: variant.id || String(index),
      label: getVariantTabLabel(variant, index),
      components: Array.isArray(variant.componentOverrides) ? variant.componentOverrides : [],
    }))
    .filter(item => item.components.length > 0);
  const packings = Array.isArray(species.packings) ? species.packings : [];
  const variantPackingGroups = variants
    .map((variant, index) => ({
      id: variant.id || String(index),
      label: getVariantTabLabel(variant, index),
      packings: getPackingsForVariant(packings, variant.id),
    }))
    .filter(group => group.packings.length > 0);
  const rootPackings = getPackingsForVariant(packings, null);
  const hasMaterials = rootComponents.length > 0 || variantsWithComponents.length > 0;
  const hasPackings = rootPackings.length > 0 || variantPackingGroups.length > 0;

  return (
    <View style={styles.sectionGrid}>
      {hasMaterials ? (
        <>
          {rootComponents.length ? (
            <ComponentsTableCard components={rootComponents} />
          ) : null}
          {variantsWithComponents.map(item => (
            <ComponentsTableCard components={item.components} key={item.id} variantLabel={item.label} />
          ))}
        </>
      ) : (
        <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitle}>Bahan Penyusun</Text>
              <Text style={styles.sectionDescription}>Bahan baku dan komponen.</Text>
            </View>
          </View>
          <Text style={styles.emptyText}>Belum ada bahan penyusun dari server.</Text>
        </KolamContentFrame>
      )}

      {hasPackings ? (
        <>
          {rootPackings.length ? <PackingsTableCard packings={rootPackings} /> : null}
          {variantPackingGroups.map(group => (
            <PackingsTableCard key={group.id} packings={group.packings} variantLabel={group.label} />
          ))}
        </>
      ) : (
        <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitle}>Bahan Kemasan</Text>
              <Text style={styles.sectionDescription}>Kemasan terhubung - HPP per unit terjual.</Text>
            </View>
          </View>
          <Text style={styles.emptyText}>Belum ada bahan kemasan dari server.</Text>
        </KolamContentFrame>
      )}
    </View>
  );
}

function ComponentsTableCard({
  components,
  variantLabel,
}: {
  components: KolamSpecies['rootComponents'];
  variantLabel?: string;
}) {
  const grandTotal = components.reduce(
    (total, component) => total + getComponentLineTotal(component),
    0,
  );

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={styles.materialHeaderTitleRow}>
            <Text style={styles.sectionTitle}>Bahan Penyusun</Text>
            {variantLabel ? <KolamStatusBadge intent="muted" label={variantLabel} /> : null}
          </View>
          <Text style={styles.sectionDescription}>Bahan baku dan komponen.</Text>
        </View>
      </View>
      <View style={styles.materialTable}>
        <View style={[styles.materialTableRow, styles.materialTableHeader]}>
          <Text style={[styles.materialTableHeadText, styles.materialNameCell]}>Nama produk</Text>
          <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Jumlah</Text>
          <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Berat</Text>
          <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Stok</Text>
          <Text style={[styles.materialTableHeadText, styles.materialMoneyCell]}>Harga</Text>
          <Text style={[styles.materialTableHeadText, styles.materialMoneyCell]}>Total harga</Text>
        </View>
        {components.map((component, index) => (
          <View key={`${component.productId}-${index}`} style={styles.materialTableRow}>
            <View style={styles.materialNameCell}>
              <View style={styles.materialProductRow}>
                <View style={styles.materialThumb}>
                  {component.productPhotoUri ? (
                    <KolamRemoteImage
                      accessibilityLabel={`Foto ${component.productName}`}
                      resizeMode="cover"
                      revision={component.productPhotoUri}
                      sourceUri={component.productPhotoUri}
                      style={styles.materialThumbImage}
                    />
                  ) : (
                    <Text style={styles.materialThumbFallback}>â–¡</Text>
                  )}
                </View>
                <View style={styles.materialProductCopy}>
                  <Text style={styles.logisticsMethodTitle}>{component.productName}</Text>
                  <View style={styles.materialMetaRow}>
                    {component.productSku ? <Text style={styles.materialCode}>{component.productSku}</Text> : null}
                    {component.productType ? <Text style={styles.logisticsMethodMeta}>{getProductTypeLabel(component.productType)}</Text> : null}
                  </View>
                  {component.productDescription ? (
                    <Text numberOfLines={1} style={styles.logisticsMethodMeta}>{stripHtml(component.productDescription)}</Text>
                  ) : null}
                </View>
              </View>
            </View>
            <Text style={[styles.materialTableText, styles.materialSmallCell]}>{formatComponentQuantity(component)}</Text>
            <Text style={[styles.materialTableText, styles.materialSmallCell]}>{formatComponentWeight(component)}</Text>
            <View style={styles.materialSmallCell}>{renderComponentStock(component)}</View>
            <Text style={[styles.materialTableText, styles.materialMoneyCell]}>{component.unitPrice !== null ? formatCurrency(component.unitPrice) : '-'}</Text>
            <Text style={[styles.materialTableTextStrong, styles.materialMoneyCell]}>{getComponentLineTotal(component) > 0 ? formatCurrency(getComponentLineTotal(component)) : '-'}</Text>
          </View>
        ))}
        <View style={[styles.materialTableRow, styles.materialTableFooter]}>
          <Text style={[styles.materialTableTextStrong, styles.materialFooterLabel]}>Total harga keseluruhan</Text>
          <Text style={[styles.materialTableTextStrong, styles.materialMoneyCell]}>{grandTotal > 0 ? formatCurrency(grandTotal) : '-'}</Text>
        </View>
      </View>
    </KolamContentFrame>
  );
}

function PackingsTableCard({
  packings,
  variantLabel,
}: {
  packings: KolamSpecies['packings'];
  variantLabel?: string;
}) {
  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={styles.materialHeaderTitleRow}>
            <Text style={styles.sectionTitle}>Bahan Kemasan</Text>
            {variantLabel ? <KolamStatusBadge intent="muted" label={variantLabel} /> : null}
          </View>
          <Text style={styles.sectionDescription}>Kemasan terhubung - HPP per unit terjual.</Text>
        </View>
      </View>
      <View style={styles.materialTable}>
        <View style={[styles.materialTableRow, styles.materialTableHeader]}>
          <Text style={[styles.materialTableHeadText, styles.materialNameCell]}>Kemasan</Text>
          <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Jumlah</Text>
          <Text style={[styles.materialTableHeadText, styles.materialMoneyCell]}>HPP / unit</Text>
          <Text style={[styles.materialTableHeadText, styles.materialMoneyCell]}>Total HPP</Text>
        </View>
        {packings.map((packing, index) => {
          const quantity = Math.max(1, Number(packing.quantity) || 1);
          const unitHpp = Math.max(0, Number(packing.unitHpp) || 0);
          return (
            <View key={`${packing.packingId}-${packing.variantId ?? 'root'}-${index}`} style={styles.materialTableRow}>
              <View style={styles.materialNameCell}>
                <Text style={styles.logisticsMethodTitle}>{packing.packingName}</Text>
                {packing.packingCategory ? <Text style={styles.logisticsMethodMeta}>{packing.packingCategory}</Text> : null}
              </View>
              <Text style={[styles.materialTableText, styles.materialSmallCell]}>x{formatNumber(quantity)}</Text>
              <Text style={[styles.materialTableText, styles.materialMoneyCell]}>{unitHpp > 0 ? formatCurrency(unitHpp) : '-'}</Text>
              <Text style={[styles.materialTableTextStrong, styles.materialMoneyCell]}>{unitHpp > 0 ? formatCurrency(unitHpp * quantity) : '-'}</Text>
            </View>
          );
        })}
      </View>
    </KolamContentFrame>
  );
}

function getPackingsForVariant(
  packings: KolamSpecies['packings'],
  variantId?: string | null,
) {
  return packings.filter(packing => {
    if (!variantId) {
      return !packing.variantId;
    }
    return packing.variantId === variantId;
  });
}

function getComponentLineTotal(component: KolamSpecies['rootComponents'][number]) {
  return component.unitPrice !== null ? Math.max(0, component.unitPrice * component.quantity) : 0;
}

function formatComponentQuantity(component: KolamSpecies['rootComponents'][number]) {
  return `${formatNumber(component.quantity)}${component.unitLabel ? ` ${component.unitLabel}` : ''}`;
}

function formatComponentWeight(component: KolamSpecies['rootComponents'][number]) {
  if (component.totalWeightValue <= 0) {
    return '-';
  }
  const percentage = component.percentage > 0 ? ` (${component.percentage.toFixed(2)}%)` : '';
  return `${formatNumber(component.totalWeightValue)}${component.totalWeightUnitLabel ? ` ${component.totalWeightUnitLabel}` : ''}${percentage}`;
}

function renderComponentStock(component: KolamSpecies['rootComponents'][number]) {
  if (component.stock === null) {
    return <Text style={styles.materialTableText}>-</Text>;
  }
  if (component.stock <= 0) {
    return <KolamStatusBadge intent="danger" label="Stok habis" />;
  }
  return (
    <View style={styles.materialStockWrap}>
      <Text style={styles.materialTableTextStrong}>{formatNumber(component.stock)}</Text>
      {component.lowStockThreshold > 0 && component.stock <= component.lowStockThreshold ? (
        <KolamStatusBadge intent="danger" label="Stok rendah" />
      ) : null}
    </View>
  );
}

function getProductTypeLabel(type: string) {
  return type === 'raw' ? 'Bahan baku' : 'Produk';
}
function MorePanel({
  sections,
  species,
}: {
  sections: KolamLabelFieldDetailSection[];
  species: KolamSpecies;
}) {
  return (
    <View style={styles.sectionGrid}>
      {sections.filter(section => section.title !== 'Link').map(section => (
        <DetailSectionPanel key={section.title} section={section} />
      ))}
      <KolamDetailTermsTemplatesPanel
        itemId={species.id}
        itemLabel="spesies"
        itemType="species"
      />
      <KolamDetailAttachedItemsPanel
        description="Produk dan spesies terkait untuk pakan, suplemen, dan obat."
        items={species.attachedItems}
        title="Item Terlampir"
      />
      <KolamDetailSeoGooglePanel
        description={species.description}
        entityName={species.displayName || species.scientificName}
        pathPrefix="species"
        seo={{
          keywords: species.seo.keywords,
          lastSeoScore: species.seo.lastSeoScore,
          metaDescription: species.seo.metaDescription,
          metaTitle: species.seo.metaTitle,
        }}
        shortDescription={species.shortDescription}
        slug={species.slug}
      />
    </View>
  );
}
function PlaceholderPanel({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <KolamContentFrame
      style={styles.sectionCardFull}
      variant="settingsWebConfig"
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      <Text style={styles.emptyText}>Belum ada data.</Text>
    </KolamContentFrame>
  );
}

function getVisibleSections(
  tab: DetailTabId,
  sections: KolamLabelFieldDetailSection[],
) {
  const titles = getTabSectionTitles(tab);
  return sections.filter(section => titles.includes(section.title));
}

function getTabSectionTitles(tab: DetailTabId) {
  switch (tab) {
    case 'pricing':
      return [
        'Harga Grosir',
        'Vendor Price / HPP Varian',
        'Komisi dan Member Points',
        'Marketplace',
      ];
    case 'specifications':
      return ['Spesifikasi'];
    case 'logistics':
      return [];
    case 'materials':
      return [];
    case 'more':
      return ['Tautan'];
    case 'assets':
      return ['Media'];
    default:
      return [];
  }
}

function getSection(sections: KolamLabelFieldDetailSection[], title: string) {
  return sections.find(section => section.title === title);
}

function getMarketplaceLogo(label: string) {
  if (label === 'Shopee') {
    return SHOPEE_LOGO;
  }
  if (label === 'Tokopedia') {
    return TOKOPEDIA_LOGO;
  }
  return null;
}

function normalizeLinkName(name: string) {
  return name.trim().toLowerCase();
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : 'https://' + value;
}

function getItemKey(item: KolamLabelFieldDetailSectionItem, index: number) {
  return `${item.title}-${item.value ?? ''}-${index}`;
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  pricingStack: {
    gap: 14,
  },
  pricingCardHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 4,
    marginBottom: 12,
    paddingBottom: 12,
  },
  pricingMetricLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  pricingValue: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  pricingMuted: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 15,
  },
  pricingDanger: {
    color: V.colors.danger,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },  pricingSuccess: {
    color: V.colors.success,
  },
  inlineMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  variantTabHeader: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
  },
  variantTabLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  variantTabList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  variantTabButton: {
    minHeight: 32,
    paddingHorizontal: 10,
  },
  variantPricingPanel: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },  variantPricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  variantPricingCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 420,
    flexGrow: 1,
    gap: 12,
    padding: 12,
  },
  variantPricingTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  variantGrocerBlock: {
    gap: 8,
  },
  hppBasisStack: {
    gap: 6,
  },
  hppBasisRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  codeValue: {
    backgroundColor: V.colors.secondary,
    borderRadius: 4,
    color: V.colors.fg,
    fontFamily: 'Consolas',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  marketplaceFooterWrap: {
    gap: 4,
    marginTop: 4,
  },
  marketplaceFooterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  marketplaceFooterCode: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    width: 22,
  },
  marketplaceFooterBadgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  marketplaceFooterTime: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  profitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profitTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 4,
    padding: 10,
  },  profitTileGain: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
  },
  profitTileLoss: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
  },
  profitHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  profitLine: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  profitLineValue: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
  },
  profitStrongLabel: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  profitStrongValue: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'right',
  },
  profitNetValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'right',
  },
  profitDivider: {
    backgroundColor: V.colors.border,
    height: 1,
    marginVertical: 4,
  },
  profitSectionLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  marketplaceAnalysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketplaceAnalysisCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 320,
    flexGrow: 1,
    gap: 8,
    padding: 10,
  },
  pricingTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pricingTwoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  pricingSubCard: {
    flexBasis: 320,
    flexGrow: 1,
    gap: 10,
  },
  pricingSubTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  pricingChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pricingChip: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minWidth: 130,
    padding: 10,
  },
  pricingChipTitle: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  pricingChipMeta: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  pricingTierWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pricingTierPill: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pricingTierQty: {
    alignSelf: 'flex-start',
    backgroundColor: V.colors.secondary,
    borderRadius: 4,
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pricingTierValue: {
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  pricingTierOnline: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  pricingTierOwner: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  vendorPriceList: {
    gap: 8,
  },
  vendorPriceRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  vendorPriceCopy: {
    flexBasis: 220,
    flexGrow: 1,
    gap: 2,
  },
  vendorPriceAmounts: {
    alignItems: 'flex-end',
    flexBasis: 220,
    flexGrow: 1,
    gap: 2,
  },
  vendorTable: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  vendorTableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  vendorNameCell: {
    flexBasis: 220,
    flexGrow: 1,
    gap: 4,
  },
  vendorAmountCell: {
    color: V.colors.fg,
    flexBasis: 110,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
  },
  summaryCard: {
    gap: 0,
    overflow: 'hidden',
    padding: 0,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: 99,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  headerIconText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '900',
  },
  cardTitle: {
    color: V.colors.fg,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 24,
  },
  summaryBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    padding: 18,
  },
  sidebarColumn: {
    flexBasis: 300,
    flexGrow: 0,
    gap: 12,
  },
  mainColumn: {
    flexBasis: 520,
    flexGrow: 1,
    gap: 14,
    minWidth: 0,
  },
  mediaPanel: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 178,
    overflow: 'hidden',
  },
  voicePlayer: {
    height: 48,
    width: '100%',
  },
  voicePanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  voiceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voiceLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniTile: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 94,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 70,
    padding: 8,
  },
  miniLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  miniContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 22,
  },
  miniValue: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'center',
  },
  miniMutedValue: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  variantStockNote: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  sidebarGroupStack: {
    gap: 8,
  },
  sidebarGroup: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  sidebarGroupLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  sidebarChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sidebarChip: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  sidebarChipContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    maxWidth: '100%',
  },
  sidebarChipImage: {
    borderRadius: 99,
    height: 18,
    width: 18,
  },
  sidebarChipText: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  sidebarChipLink: {
    color: '#047857',
  },
  sidebarGroupEmpty: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  linkTileGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  linkTilePressable: {
    flex: 1,
  },
  marketIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  marketLogo: {
    height: '100%',
    width: '100%',
  },
  marketIconText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '900',
  },
  mutedDash: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '800',
  },
  metaPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  metaRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metaRowContent: {
    gap: 4,
  },
  metaLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  metaValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaLink: {
    color: '#047857',
  },
  titleBlock: {
    gap: 5,
  },
  scientificName: {
    color: V.colors.fg,
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: '900',
    lineHeight: 34,
  },
  copySkuWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  copySkuWrapCompact: {
    alignItems: 'flex-start',
  },  titleHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  titleSkuChip: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleSkuChipCompact: {
    alignSelf: 'flex-start',
  },
  titleSkuText: {
    color: V.colors.mutedFg,
    fontFamily: 'Consolas',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  copySkuButton: {
    minHeight: 26,
    paddingHorizontal: 8,
  },  nameLine: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commonName: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  localName: {
    color: V.colors.mutedFg,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  dot: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
  dateText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionCard: {
    flexBasis: 420,
    flexGrow: 1,
    gap: 0,
    minWidth: 320,
    overflow: 'hidden',
    padding: 0,
  },
  sectionCardFull: {
    gap: 0,
    minWidth: 320,
    overflow: 'hidden',
    padding: 0,
    width: '100%',
  },
  sectionCardCompact: {
    flexBasis: 'auto',
    minWidth: 0,
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
  sectionTitleWrap: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionBody: {
    padding: 12,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    padding: 18,
    textAlign: 'center',
  },
  itemList: {
    gap: 8,
  },
  detailItem: {
    alignItems: 'flex-start',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  detailItemExpanded: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  itemThumb: {
    flexShrink: 0,
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  itemHtmlValue: {
    width: '100%',
  },
  itemHtmlMeta: {
    width: '100%',
  },
  itemValue: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  itemMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  accordionItem: {
    overflow: 'hidden',
  },
  accordionHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  accordionCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemSummary: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  chevron: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'center',
    width: 18,
  },
  logisticsVariantStack: {
    gap: 10,
    padding: 12,
  },
  logisticsVariantCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  logisticsHalfCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
  },
  logisticsPanelBlock: {
    gap: 10,
  },
  logisticsShippingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  logisticsMethodHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logisticsMethodLogo: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 42,
    width: 56,
  },
  logisticsMethodLogoFallback: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderRadius: 6,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 56,
  },
  logisticsMethodLogoFallbackText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  logisticsMethodTitleWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  logisticsMethodTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  logisticsMethodMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  locationMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  locationListCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 0,
    overflow: 'hidden',
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
  seoPreviewDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  materialProductRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  materialThumb: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderRadius: 6,
    height: 42,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 42,
  },
  materialThumbImage: {
    height: 42,
    width: 42,
  },
  materialThumbFallback: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  materialProductCopy: {
    flex: 1,
    minWidth: 0,
  },
  periodFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 4,
  },
  periodFilterButton: {
    minHeight: 30,
    paddingHorizontal: 10,
  },
  trendRows: {
    gap: 8,
    padding: 12,
  },
  trendRow: {
    gap: 5,
  },
  trendLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  trendTrack: {
    backgroundColor: V.colors.mutedSoft,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  trendFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: 8,
  },
  trendValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
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
  termsListCopy: {
    flex: 1,
    gap: 4,
    minWidth: 220,
  },
  statisticsStack: {
    gap: 12,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statisticsTile: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 150,
    padding: 10,
  },
  statisticsBlockTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  statisticsListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statisticsListCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
  },
  statisticsListHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  marketplaceFooterActions: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
  },
  marketplaceFooterButton: {
    minHeight: 26,
    paddingHorizontal: 8,
  },
  marketplaceFooterButtonWide: {
    minHeight: 26,
    paddingHorizontal: 8,
  },
  materialHeaderTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materialTable: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  materialTableRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  materialTableHeader: {
    backgroundColor: V.colors.mutedSoft,
    borderTopWidth: 0,
  },
  materialTableFooter: {
    backgroundColor: V.colors.mutedSoft,
    justifyContent: 'flex-end',
  },
  materialNameCell: {
    flex: 2,
    minWidth: 220,
  },
  materialSmallCell: {
    flex: 1,
    minWidth: 86,
  },
  materialMoneyCell: {
    flex: 1,
    minWidth: 112,
    textAlign: 'right',
  },
  materialFooterLabel: {
    flex: 1,
    minWidth: 180,
    textAlign: 'right',
  },
  materialTableHeadText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  materialTableText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  materialTableTextStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
  },
  materialMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 3,
  },
  materialCode: {
    backgroundColor: V.colors.mutedSoft,
    borderRadius: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  materialStockWrap: {
    alignItems: 'flex-start',
  },
  locationListRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
});
