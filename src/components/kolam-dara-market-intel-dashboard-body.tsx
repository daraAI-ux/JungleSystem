import React, {useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraMarketIntelIdr,
  formatKolamDaraMarketIntelTaxSource,
} from '../domain/kolam-dara-market-intel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraMarketIntelDashboardController} from '../hooks/use-kolam-dara-market-intel-dashboard-controller';
import type {KolamDaraMarketIntelJobsProgressController} from '../hooks/use-kolam-dara-market-intel-jobs-progress';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE `DaraMarketIntelDashboardPage` body — KPI cards (not SEO donuts). */
export function KolamDaraMarketIntelDashboardBody({
  canDraft,
  canViewMargin,
  controller,
  jobsProgress,
  onRouteChange,
}: {
  canDraft: boolean;
  canViewMargin: boolean;
  controller: KolamDaraMarketIntelDashboardController;
  jobsProgress: KolamDaraMarketIntelJobsProgressController;
  onRouteChange?: (route: string) => void;
}) {
  const {dashboard, loading, error, brandId, brands, marketEnabled} =
    controller;
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
      ...brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [brands],
  );

  const brandLabel =
    brandOptions.find(option => option.value === brandId)?.label ?? 'Merek';
  const brandQueryParam = brandId === 'all' ? undefined : brandId;

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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View
        ref={toolbarRef}
        collapsable={false}
        style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {brandOptions.length > 1 ? (
                <View ref={brandTriggerRef} collapsable={false}>
                  <KolamTableFilterTrigger
                    active={brandPanelOpen || brandId !== 'all'}
                    label={brandLabel}
                    onPress={openBrandPanel}
                    open={brandPanelOpen}
                    variant="quiet"
                  />
                </View>
              ) : null}
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {canDraft ? (
                <>
                  <KolamButton
                    disabled={jobsProgress.isRunning('market.scan_bulk')}
                    label={
                      jobsProgress.isRunning('market.scan_bulk')
                        ? 'Scan…'
                        : 'Scan 40 produk'
                    }
                    onPress={() => {
                      void jobsProgress
                        .onStartMarketJob(
                          'market.scan_bulk',
                          {limit: 40, useLlama: false},
                          'Scan bulk produk',
                        )
                        .then(() => controller.onRefresh());
                    }}
                  />
                  <KolamButton
                    disabled={jobsProgress.isRunning(
                      'market.channel_pricing_scan',
                    )}
                    label={
                      jobsProgress.isRunning('market.channel_pricing_scan')
                        ? 'Channel…'
                        : 'Scan channel'
                    }
                    onPress={() => {
                      void jobsProgress
                        .onStartMarketJob(
                          'market.channel_pricing_scan',
                          {limit: 60, brandId: brandQueryParam},
                          'Scan channel pricing',
                        )
                        .then(() => controller.onRefresh());
                    }}
                  />
                  <KolamButton
                    label="Monitor kompetitor"
                    onPress={() =>
                      onRouteChange?.(
                        '/campaign/dara-market-intel/competitors',
                      )
                    }
                  />
                  <KolamButton
                    intent="primary"
                    label={`Persetujuan (${dashboard?.pendingApprovals ?? 0})`}
                    onPress={() =>
                      onRouteChange?.(
                        '/campaign/dara-market-intel/approvals',
                      )
                    }
                  />
                </>
              ) : null}
              <KolamButton
                disabled={loading}
                label={loading ? 'Memuat…' : 'Refresh'}
                onPress={() => {
                  void controller.onRefresh();
                }}
              />
            </View>
          </View>
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
                  intent={brandId === option.value ? 'primary' : 'plain'}
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

      {error && dashboard ? <Text style={styles.warnText}>{error}</Text> : null}
      {!marketEnabled ? (
        <Text style={styles.warnText}>
          Intel Pasar dimatikan di pengaturan.
        </Text>
      ) : null}

      {error && !dashboard ? (
        <KolamEmptyState message={error} title="Gagal memuat" />
      ) : null}

      {loading && !dashboard ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : null}

      {dashboard ? (
        <>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Menunggu approval</Text>
              <Text style={styles.kpiValue}>{dashboard.pendingApprovals}</Text>
            </View>
            {canViewMargin &&
            dashboard.totals.extraProfitPotential != null ? (
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Potensi profit tambahan</Text>
                <Text style={styles.kpiValue}>
                  {formatKolamDaraMarketIntelIdr(
                    dashboard.totals.extraProfitPotential,
                  )}
                </Text>
              </View>
            ) : null}
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Potensi hemat pembelian</Text>
              <Text style={styles.kpiValue}>
                {formatKolamDaraMarketIntelIdr(
                  dashboard.totals.purchaseSavingsPotential,
                )}
              </Text>
            </View>
          </View>

          {canViewMargin && dashboard.taxPolicy ? (
            <Text style={styles.metaLine}>
              {`PPN ${dashboard.taxPolicy.ppnRate}%${
                dashboard.taxPolicy.pricesIncludeTax ? ' (inkl.)' : ' (ekskl.)'
              } · Sumber ${formatKolamDaraMarketIntelTaxSource(
                dashboard.taxPolicy.source,
              )} · HPP dari biaya varian / PO terbaru`}
            </Text>
          ) : null}

          <View style={styles.panels}>
            {canViewMargin ? (
              <>
                <MarketListCard
                  emptyLabel="Tidak ada"
                  rows={dashboard.tooCheap.map(row => ({
                    id: row.productId,
                    left: row.name,
                    right: `${formatKolamDaraMarketIntelIdr(
                      row.sellPrice,
                    )} → ${formatKolamDaraMarketIntelIdr(row.idealPrice)}`,
                  }))}
                  title="Terlalu murah"
                />
                <MarketListCard
                  emptyLabel="Tidak ada"
                  rows={dashboard.tooExpensive.map(row => ({
                    id: row.productId,
                    left: row.name,
                    right: formatKolamDaraMarketIntelIdr(row.sellPrice),
                  }))}
                  title="Terlalu mahal"
                />
                <MarketListCard
                  emptyLabel="Tidak ada"
                  rows={dashboard.lowMargin.map(row => ({
                    id: row.productId,
                    left: row.name,
                    right: `${row.marginPercent}%`,
                  }))}
                  title="Margin rendah"
                />
              </>
            ) : null}
            <MarketListCard
              emptyLabel="Belum ada data"
              rows={dashboard.supplierLeaders.map(row => ({
                id: row.productId,
                left: row.productName,
                right: `${row.bestSupplier} · ${row.cheapest}`,
              }))}
              title="Supplier terbaik / termurah"
            />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function MarketListCard({
  emptyLabel,
  rows,
  title,
}: {
  emptyLabel: string;
  rows: Array<{id: string; left: string; right: string}>;
  title: string;
}) {
  return (
    <View style={styles.panelCard}>
      <Text style={styles.panelTitle}>{title}</Text>
      {rows.length ? (
        rows.map(row => (
          <View key={row.id} style={styles.listRow}>
            <Text numberOfLines={1} style={styles.listLeft}>
              {row.left}
            </Text>
            <Text style={styles.listRight}>{row.right}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyLine}>{emptyLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
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
  warnText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  kpiGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 1,
    gap: 8,
    minWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kpiLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  kpiValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  metaLine: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  panels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  panelCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 1,
    gap: 0,
    minWidth: 280,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  panelTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  listRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  listLeft: {
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minWidth: 0,
  },
  listRight: {
    color: V.colors.fg,
    flexShrink: 0,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyLine: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
});
