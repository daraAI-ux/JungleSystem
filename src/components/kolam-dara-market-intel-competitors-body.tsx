import React, {useMemo, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_AI_MODULE_ICON_SVG} from '../assets/icons/ai-module-icon-svg';
import {KOLAM_DOWNLOAD_TOPBAR_ICON_SVG} from '../assets/icons/download-topbar-icon-svg';
import {KOLAM_NEW_BUTTON_ICON_SVG} from '../assets/icons/new-button-icon-svg';
import {
  KOLAM_DARA_MARKET_INTEL_COMPETITOR_CHANNELS,
  formatKolamDaraMarketIntelCompetitorFetchStatus,
  formatKolamDaraMarketIntelCompetitorFetchTime,
  formatKolamDaraMarketIntelCompetitorPlatform,
  formatKolamDaraMarketIntelIdr,
  isKolamDaraMarketIntelMongoObjectId,
  resolveKolamDaraMarketIntelCompetitorPrice,
  type KolamDaraMarketIntelCompetitorChannelId,
  type KolamDaraMarketIntelCompetitorGroup,
  type KolamDaraMarketIntelCompetitorLink,
} from '../domain/kolam-dara-market-intel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraMarketIntelCompetitorsController} from '../hooks/use-kolam-dara-market-intel-competitors-controller';
import {KolamButton} from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamDaraMarketIntelCompetitorsProductSelect} from './kolam-dara-market-intel-competitors-product-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSearchField} from './kolam-search-field';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

const KOLAM_COMPETITOR_ADD_ICON_XML = KOLAM_NEW_BUTTON_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);
const KOLAM_COMPETITOR_LOAD_ICON_XML = KOLAM_DOWNLOAD_TOPBAR_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);
const KOLAM_COMPETITOR_DARA_ICON_XML = KOLAM_AI_MODULE_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);

/** FE `DaraMarketCompetitorsPage` — dual-view list/detail. */
export function KolamDaraMarketIntelCompetitorsBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraMarketIntelCompetitorsController;
}) {
  if (!canDraft) {
    return (
      <View style={styles.root}>
        <Text style={styles.meta}>Akses terbatas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CompetitorsToolbar controller={controller} />
      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      {controller.error && !controller.filteredGroups.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {controller.view === 'list' ? (
        <CompetitorsListView controller={controller} />
      ) : (
        <CompetitorsDetailView controller={controller} />
      )}
    </View>
  );
}

function CompetitorsToolbar({
  controller,
}: {
  controller: KolamDaraMarketIntelCompetitorsController;
}) {
  const toolbarRef = useRef<View>(null);
  const brandTriggerRef = useRef<View>(null);
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [panelAnchor, setPanelAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const brandOptions = useMemo(
    () => [
      {label: 'Semua merek', value: 'all'},
      ...controller.brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [controller.brands],
  );
  const brandLabel =
    brandOptions.find(option => option.value === controller.brandId)?.label ??
    'Merek';

  const openBrandPanel = () => {
    if (brandPanelOpen) {
      setBrandPanelOpen(false);
      return;
    }
    brandTriggerRef.current?.measureInWindow((x, y, _w, h) => {
      toolbarRef.current?.measureInWindow((tx, ty) => {
        setPanelAnchor({top: y - ty + h + 4, left: Math.max(0, x - tx)});
        setBrandPanelOpen(true);
      });
    });
  };

  return (
    <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {controller.view === 'list' ? (
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={controller.onSetSearch}
                placeholder="Cari nama kompetitor…"
                value={controller.search}
              />
            ) : null}
            {brandOptions.length > 1 ? (
              <View ref={brandTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={brandPanelOpen || controller.brandId !== 'all'}
                  label={brandLabel}
                  onPress={openBrandPanel}
                  open={brandPanelOpen}
                  variant="quiet"
                />
              </View>
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {controller.view === 'detail' ? (
              <KolamButton
                label="← Daftar kompetitor"
                onPress={controller.onBackToList}
                size="sm"
              />
            ) : (
              <KolamButton
                icon={
                  <SvgXml
                    height="100%"
                    width="100%"
                    xml={KOLAM_COMPETITOR_ADD_ICON_XML}
                  />
                }
                label="Add kompetitor"
                onPress={controller.onToggleAddCompetitor}
                size="sm"
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />
            )}
            <KolamButton
              disabled={controller.loading}
              icon={
                <SvgXml
                  height="100%"
                  width="100%"
                  xml={KOLAM_COMPETITOR_LOAD_ICON_XML}
                />
              }
              label={controller.loading ? 'Memuat…' : 'Muat'}
              onPress={() => {
                void controller.onRefresh();
              }}
              size="sm"
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
            />
            <KolamButton
              disabled={controller.busy}
              icon={
                <SvgXml
                  height="100%"
                  width="100%"
                  xml={KOLAM_COMPETITOR_DARA_ICON_XML}
                />
              }
              label="Laporkan DARA"
              onPress={() => {
                void controller.onSendReport();
              }}
              size="sm"
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
            />
          </View>
        </View>
        {controller.view === 'list' && controller.showAddCompetitor ? (
          <View style={styles.addRow}>
            <Text style={styles.fieldLabel}>Nama kompetitor</Text>
            <TextInput
              onChangeText={controller.onSetNewCompetitorName}
              placeholder="Contoh: Toko ABC"
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.newCompetitorName}
            />
            <KolamButton
              disabled={!controller.newCompetitorName.trim()}
              label="Buka & tambah barang"
              onPress={controller.onConfirmAddCompetitor}
              size="sm"
            />
          </View>
        ) : null}
      </View>
      {brandPanelOpen && panelAnchor ? (
        <View
          style={[
            styles.filterOverlayPanel,
            {top: panelAnchor.top, left: panelAnchor.left},
          ]}>
          <ScrollView
            contentContainerStyle={styles.filterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.filterPanelScroll}>
            {brandOptions.map(option => (
              <KolamButton
                intent={
                  controller.brandId === option.value ? 'primary' : 'plain'
                }
                key={option.value}
                label={option.label}
                onPress={() => {
                  controller.onSetBrandId(option.value);
                  setBrandPanelOpen(false);
                }}
                style={styles.filterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.filterPanelFooter}>
            <KolamButton
              label="Tutup"
              onPress={() => setBrandPanelOpen(false)}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CompetitorsListView({
  controller,
}: {
  controller: KolamDaraMarketIntelCompetitorsController;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <Text style={styles.sectionTitle}>
        {`Daftar kompetitor (${controller.filteredGroups.length})`}
      </Text>
      {controller.loading && !controller.filteredGroups.length ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : controller.filteredGroups.length ? (
        <View style={styles.list}>
          {controller.filteredGroups.map(group => (
            <CompetitorGroupRow
              group={group}
              key={group.name}
              onPress={() => controller.onOpenCompetitor(group.name)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.meta}>
          {controller.search.trim()
            ? 'Tidak ada kompetitor yang cocok.'
            : 'Belum ada kompetitor. Klik + Add kompetitor untuk mulai.'}
        </Text>
      )}
    </ScrollView>
  );
}

function CompetitorGroupRow({
  group,
  onPress,
}: {
  group: KolamDaraMarketIntelCompetitorGroup;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{group.name}</Text>
        <Text style={styles.meta}>{`${group.itemCount} barang`}</Text>
      </View>
      <Text style={styles.channelFlags}>
        {`TP ${group.tokopedia ? 'Yes' : '—'} · SP ${
          group.shopee ? 'Yes' : '—'
        } · Web ${group.website ? 'Yes' : '—'}`}
      </Text>
    </Pressable>
  );
}

function CompetitorsDetailView({
  controller,
}: {
  controller: KolamDaraMarketIntelCompetitorsController;
}) {
  const selectedChannels = KOLAM_DARA_MARKET_INTEL_COMPETITOR_CHANNELS.filter(
    channel => controller.channels[channel.id],
  );
  const hasProduct = isKolamDaraMarketIntelMongoObjectId(
    controller.productId.trim(),
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {`Tambah barang — ${controller.selectedCompetitor || ''}`}
        </Text>
        {controller.brandId === 'all' ? (
          <Text style={styles.meta}>
            Pilih merek di toolbar terlebih dahulu agar daftar produk muncul.
          </Text>
        ) : null}
        <Text style={styles.fieldLabel}>Produk kita (per merek)</Text>
        <KolamDaraMarketIntelCompetitorsProductSelect
          brandId={controller.brandId}
          onClear={controller.onClearProduct}
          onSelect={controller.onSetProduct}
          productId={controller.productId}
          productLabel={controller.productLabel}
        />
        {hasProduct && controller.productBaseline ? (
          <View style={styles.baselineBox}>
            <Text style={styles.baselineTitle}>
              Harga kita (dari master produk)
            </Text>
            <Text style={styles.meta}>
              {`Web ${formatKolamDaraMarketIntelIdr(
                controller.productBaseline.webPrice,
              )} · Olshop ${formatKolamDaraMarketIntelIdr(
                controller.productBaseline.onlinePrice,
              )} · HPP ${formatKolamDaraMarketIntelIdr(
                controller.productBaseline.hpp,
              )}`}
            </Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Kanal & URL barang kompetitor</Text>
        <View style={styles.channelRow}>
          {KOLAM_DARA_MARKET_INTEL_COMPETITOR_CHANNELS.map(channel => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: controller.channels[channel.id],
              }}
              key={channel.id}
              onPress={() =>
                controller.onToggleChannel(
                  channel.id,
                  !controller.channels[channel.id],
                )
              }
              style={[
                styles.channelBox,
                controller.channels[channel.id] ? styles.channelBoxOn : null,
              ]}>
              <Text style={styles.channelBoxText}>{channel.label}</Text>
            </Pressable>
          ))}
        </View>

        {selectedChannels.map(channel => (
          <View key={channel.id} style={styles.addRow}>
            <Text style={styles.fieldLabel}>
              {`URL barang kompetitor (${channel.label})`}
            </Text>
            <TextInput
              onChangeText={value =>
                controller.onSetChannelUrl(
                  channel.id as KolamDaraMarketIntelCompetitorChannelId,
                  value,
                )
              }
              placeholder="https://..."
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.channelUrls[channel.id]}
            />
          </View>
        ))}

        <KolamButton
          disabled={
            controller.busy || !hasProduct || !controller.selectedCompetitor
          }
          label="Simpan barang"
          onPress={() => {
            void controller.onSaveProductChannels();
          }}
        />
      </View>

      <View style={styles.detailHead}>
        <Text style={styles.sectionTitle}>
          {`Barang dimonitor (${controller.detailLinks.length})`}
        </Text>
        <KolamButton
          disabled={controller.bulkFetching || !controller.detailLinks.length}
          label={controller.bulkFetching ? 'Bulk fetch…' : 'Bulk fetch'}
          onPress={() => {
            void controller.onBulkFetch();
          }}
        />
      </View>

      {controller.detailLinks.length ? (
        <View style={styles.list}>
          {controller.detailLinks.map(link => (
            <CompetitorLinkRow
              bulkFetching={controller.bulkFetching}
              fetchingId={controller.fetchingId}
              key={link.id}
              link={link}
              onDelete={() => {
                void controller.onDeleteLink(link.id);
              }}
              onFetch={() => {
                void controller.onFetchLink(link.id);
              }}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.meta}>
          Belum ada barang untuk kompetitor ini. Tambahkan produk di atas.
        </Text>
      )}
    </ScrollView>
  );
}

function CompetitorLinkRow({
  bulkFetching,
  fetchingId,
  link,
  onDelete,
  onFetch,
}: {
  bulkFetching: boolean;
  fetchingId: string | null;
  link: KolamDaraMarketIntelCompetitorLink;
  onDelete: () => void;
  onFetch: () => void;
}) {
  const price = resolveKolamDaraMarketIntelCompetitorPrice(link);
  const delta = link.monitor?.priceDeltaPct;
  const rowBusy = fetchingId === link.id || bulkFetching;

  return (
    <View style={styles.linkCard}>
      <Text style={styles.rowTitle}>
        {link.product?.name || link.product?.sku || '—'}
      </Text>
      <Text style={styles.meta}>
        {`${formatKolamDaraMarketIntelCompetitorPlatform(link.platform)} · ${formatKolamDaraMarketIntelIdr(
          price,
        )} · kita ${formatKolamDaraMarketIntelIdr(link.monitor?.ourPrice)}`}
      </Text>
      <Text style={styles.meta}>
        {`Selisih ${
          delta == null ? '—' : `${delta > 0 ? '▲+' : '▼'}${delta}%`
        } · Floor ${formatKolamDaraMarketIntelIdr(
          link.monitor?.minSafePrice,
        )} · ${formatKolamDaraMarketIntelCompetitorFetchStatus(
          link.lastFetchStatus,
        )} · ${formatKolamDaraMarketIntelCompetitorFetchTime(
          link.lastIngestedAt,
        )}`}
      </Text>
      <View style={styles.linkActions}>
        <KolamButton
          disabled={rowBusy}
          label={fetchingId === link.id ? '…' : 'Ambil'}
          onPress={onFetch}
        />
        <KolamDeleteButton disabled={rowBusy} label="Hapus" onPress={onDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 12,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  actionButton: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  actionButtonText: {
    color: V.colors.primaryFg,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    maxWidth: 280,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: 240,
    zIndex: 120000,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  notice: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  addRow: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    gap: 8,
  },
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  channelFlags: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  baselineBox: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  baselineTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelBox: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  channelBoxOn: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.primary,
  },
  channelBoxText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  detailHead: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  linkCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  linkActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
});
