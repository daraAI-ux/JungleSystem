import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { KOLAM_COMMISSION_ROOT } from '../domain/kolam-commission';
import {
  canReleaseCommissionRowFromNormalized,
  getCommissionStatusIntent,
  KOLAM_COMMISSION_STATUS_FILTER_OPTIONS,
  type KolamCommissionListRow,
  type KolamCommissionStatusFilter,
} from '../domain/kolam-commission';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamCommissionListController } from '../hooks/use-kolam-commission-list-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const COMMISSION_COLUMNS = [
  { id: 'invoice', label: 'Invoice', flex: 1 },
  { id: 'recipient', label: 'Penerima', flex: 1 },
  { id: 'item', label: 'Item', flex: 1.1 },
  { id: 'status', label: 'Status', flex: 0.9 },
  { id: 'amount', label: 'Komisi', flex: 0.9 },
  { id: 'action', label: 'Pembayaran', flex: 1.2 },
] as const;

export function KolamCommissionSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCommissionListController(route, onRouteChange);

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" />
      </View>
    );
  }

  if (controller.mode === 'unsupported') {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() => onRouteChange(KOLAM_COMMISSION_ROOT)}
            style={styles.backButton}
          />
        ) : null}
      </View>
    );
  }

  return <CommissionListBody controller={controller} />;
}

function CommissionListBody({
  controller,
}: {
  controller: ReturnType<typeof useKolamCommissionListController>;
}) {
  const [searchInput, setSearchInput] = useState(controller.filters.search);

  useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const statusLabel =
    KOLAM_COMMISSION_STATUS_FILTER_OPTIONS.find(
      option => option.value === controller.filters.status,
    )?.label ?? 'Semua status';

  const walletOptions = controller.wallets.map(wallet => ({
    label: wallet.name,
    value: wallet.id,
  }));

  const safePage = Math.max(1, controller.pagination.page);
  const pageCount = Math.max(1, controller.pagination.totalPages);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamCommissionListRow }) => {
      const showRelease =
        controller.canRelease &&
        canReleaseCommissionRowFromNormalized(item);
      const selectedWallet = controller.walletByRow[item.id] ?? '';

      return (
        <View style={styles.row}>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.invoiceLabel}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.recipientLabel}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1.1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.itemLabel}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.itemSku}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            <KolamStatusBadge
              intent={getCommissionStatusIntent(item.status)}
              label={item.statusLabel}
            />
            <Text numberOfLines={1} style={styles.metaText}>
              {item.deliveryStatusLabel}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            <Text style={styles.primaryText}>
              {formatRupiah(item.commissionAmount)}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.commissionRateLabel}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1.2 }]}>
            {showRelease ? (
              <View style={styles.releaseRow}>
                <KolamDropdownSelect
                  label={
                    walletOptions.find(option => option.value === selectedWallet)
                      ?.label ?? 'Dompet'
                  }
                  onChange={value => controller.onWalletChange(item.id, value)}
                  options={walletOptions}
                  value={selectedWallet}
                />
                <KolamButton
                  intent="primary"
                  label={
                    controller.releasingId === item.id ? '…' : 'Bayar'
                  }
                  onPress={() => {
                    void controller.onRelease(item);
                  }}
                  style={styles.releaseButton}
                />
              </View>
            ) : item.status === 'released' ? (
              <Text numberOfLines={2} style={styles.metaText}>
                {item.releasedAtLabel}
              </Text>
            ) : null}
          </View>
        </View>
      );
    },
    [controller, walletOptions],
  );

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari"
              value={searchInput}
            />
            <KolamDropdownSelect
              label={statusLabel}
              onChange={value =>
                controller.onStatusChange(value as KolamCommissionStatusFilter)
              }
              options={KOLAM_COMMISSION_STATUS_FILTER_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              value={controller.filters.status}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="secondary"
              label={controller.loading ? 'Memuat…' : 'Muat ulang'}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.listRoot}>
        <KolamCatalogListTableShell
          footer={
            <KolamTableFooterControls
              onPageSizeChange={controller.onLimitChange}
              page={safePage}
              pageSize={controller.pagination.limit}
              total={controller.pagination.total}
            >
              {pageCount > 1 ? (
                <View style={styles.paginationBar}>
                  <KolamButton
                    disabled={safePage <= 1 || controller.loading}
                    label="Sebelumnya"
                    onPress={() =>
                      controller.onPageChange(Math.max(1, safePage - 1))
                    }
                  />
                  <Text style={styles.pageLabel}>
                    {safePage} / {pageCount}
                  </Text>
                  <KolamButton
                    disabled={safePage >= pageCount || controller.loading}
                    label="Berikutnya"
                    onPress={() =>
                      controller.onPageChange(
                        Math.min(pageCount, safePage + 1),
                      )
                    }
                  />
                </View>
              ) : null}
            </KolamTableFooterControls>
          }
          style={styles.tableFrame}
        >
          <FlatList
            contentContainerStyle={styles.listContent}
            data={controller.rows}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  title={controller.loading ? 'Memuat…' : 'Tidak ada data'}
                />
              </View>
            }
            ListHeaderComponent={
              <View style={styles.headerRow}>
                {COMMISSION_COLUMNS.map(column => (
                  <View
                    key={column.id}
                    style={[styles.cell, { flex: column.flex }]}
                  >
                    <Text style={styles.headerCellText}>{column.label}</Text>
                  </View>
                ))}
              </View>
            }
            renderItem={renderRow}
            style={styles.list}
          />
        </KolamCatalogListTableShell>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  banner: {
    alignSelf: 'stretch',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  listRoot: {
    flex: 1,
    minHeight: 240,
  },
  tableFrame: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: 8,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cell: {
    paddingHorizontal: 4,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  releaseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  releaseButton: {
    flexGrow: 0,
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
