import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import {
  buildKolamVoucherDetailRoute,
  formatKolamVoucherDiscountLabel,
  formatKolamVoucherPeriodLabel,
  formatKolamVoucherRemainingLabel,
  formatKolamVoucherStatusLabel,
  formatKolamVoucherUsageLabel,
  getKolamVoucherStatusIntent,
  KOLAM_VOUCHER_CREATE_ROUTE,
  KOLAM_VOUCHER_STATUS_FILTER_OPTIONS,
  type KolamVoucher,
  type KolamVoucherStatus,
} from '../domain/kolam-voucher';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import {
  useKolamVoucherController,
  type KolamVoucherController,
} from '../hooks/use-kolam-voucher-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamVoucherDetail } from './kolam-voucher-detail';
import { KolamVoucherForm } from './kolam-voucher-form';

const VOUCHER_SKELETON_ROW_COUNT = 6;

function fitVoucherListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('voucher'),
    containerWidth,
    {
      actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      gap: KOLAM_DATA_TABLE_COLUMN_GAP,
      paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
      primaryMinWidth: 160,
      secondaryMinWidth: 56,
    },
  );
}

export function KolamVoucherSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamVoucherController(route);

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Tidak ada izin view voucher untuk membuka daftar ini."
          title="Akses ditolak"
        />
      </View>
    );
  }

  if (controller.mode === 'list') {
    return (
      <KolamVoucherList controller={controller} onRouteChange={onRouteChange} />
    );
  }

  if (controller.mode === 'detail') {
    return (
      <KolamVoucherDetail
        controller={controller}
        onRouteChange={onRouteChange}
      />
    );
  }

  return (
    <KolamVoucherForm controller={controller} onRouteChange={onRouteChange} />
  );
}

function KolamVoucherList({
  controller,
  onRouteChange,
}: {
  controller: KolamVoucherController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(controller.search);
  const [pendingDelete, setPendingDelete] = React.useState<KolamVoucher | null>(
    null,
  );
  const [pendingToggle, setPendingToggle] = React.useState<KolamVoucher | null>(
    null,
  );
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const columns = React.useMemo(
    () => fitVoucherListColumns(tableBodyWidth),
    [tableBodyWidth],
  );

  React.useEffect(() => {
    setSearchInput(controller.search);
  }, [controller.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const filtersApplied =
    Boolean(controller.search.trim()) || Boolean(controller.statusFilter);

  const statusFilterLabel =
    KOLAM_VOUCHER_STATUS_FILTER_OPTIONS.find(
      option => option.value === controller.statusFilter,
    )?.label ?? 'Status';

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
              placeholder="Cari kode atau judul"
              value={searchInput}
            />
            <KolamDropdownSelect
              label={statusFilterLabel}
              onChange={value =>
                controller.onSetStatusFilter(value as '' | KolamVoucherStatus)
              }
              options={KOLAM_VOUCHER_STATUS_FILTER_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              showLabelInTrigger={false}
              style={styles.statusFilter}
              value={controller.statusFilter}
            />
            {filtersApplied ? (
              <KolamButton
                intent="plain"
                label="Hapus"
                onPress={() => {
                  setSearchInput('');
                  controller.onClearFilters();
                }}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {controller.canCreate ? (
              <KolamButton
                intent="outline"
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.(KOLAM_VOUCHER_CREATE_ROUTE);
                }}
              />
            ) : null}
            <KolamRefreshButton
  accessibilityLabel="Muat ulang"

              onPress={() => {
                void controller.onRefresh();
              }}
            />
          </View>
        </View>

        {filtersApplied ? (
          <View style={styles.filterChipBar}>
            <Text style={styles.filterChipLabel}>Filter:</Text>
            {controller.search.trim() ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setSearchInput('');
                  controller.onSearchChange('');
                }}
                style={styles.filterChip}
              >
                <Text numberOfLines={1} style={styles.filterChipText}>
                  "{controller.search.trim()}"
                </Text>
                <Text style={styles.filterChipRemove}>×</Text>
              </Pressable>
            ) : null}
            {controller.statusFilter ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => controller.onSetStatusFilter('')}
                style={styles.filterChip}
              >
                <Text numberOfLines={1} style={styles.filterChipText}>
                  {statusFilterLabel}
                </Text>
                <Text style={styles.filterChipRemove}>×</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onSetPageSize}
            page={controller.page}
            pageSize={controller.pageSize}
            total={controller.total}
          >
            {controller.totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={controller.page <= 1 || controller.loading}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onSetPage(Math.max(1, controller.page - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {controller.page} / {controller.totalPages}
                </Text>
                <KolamButton
                  disabled={
                    controller.page >= controller.totalPages ||
                    controller.loading
                  }
                  label="Berikutnya"
                  onPress={() =>
                    controller.onSetPage(
                      Math.min(controller.totalPages, controller.page + 1),
                    )
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={columns} />
        {controller.loading && controller.vouchers.length === 0
          ? Array.from({ length: VOUCHER_SKELETON_ROW_COUNT }).map(
              (_, index) => (
                <KolamDataTableRowFrame key={`sk-${index}`}>
                  <KolamDataTableMainTrack>
                    {columns
                      .filter(column => column.id !== 'actions')
                      .map(column => (
                        <View
                          key={column.id}
                          style={[
                            getKolamDataTableColumnStyle(column),
                            styles.skeletonCell,
                          ]}
                        />
                      ))}
                  </KolamDataTableMainTrack>
                </KolamDataTableRowFrame>
              ),
            )
          : null}

        {!controller.loading && controller.vouchers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message={
                filtersApplied
                  ? 'Sesuaikan filter atau muat ulang dari server.'
                  : 'Belum ada voucher diskon di kampanye.'
              }
              title="Voucher kosong"
            />
          </View>
        ) : null}

        {controller.vouchers.map(voucher => {
          const remaining = formatKolamVoucherRemainingLabel(voucher);
          return (
            <KolamDataTableRowFrame
              key={voucher.id}
              onPress={() =>
                onRouteChange?.(buildKolamVoucherDetailRoute(voucher.id))
              }
            >
              <KolamDataTableMainTrack>
                {columns.map(column => {
                  if (column.id === 'actions') {
                    return null;
                  }
                  return (
                    <View
                      key={column.id}
                      style={getKolamDataTableColumnStyle(column)}
                    >
                      {column.id === 'primary' ? (
                        <View style={styles.primaryCell}>
                          <Text numberOfLines={1} style={styles.primaryTitle}>
                            {voucher.title || '—'}
                          </Text>
                          <Text numberOfLines={1} style={styles.primaryCode}>
                            {voucher.code || '—'}
                          </Text>
                        </View>
                      ) : null}
                      {column.id === 'amount' ? (
                        <Text numberOfLines={2} style={styles.cellTextCenter}>
                          {formatKolamVoucherDiscountLabel(voucher)}
                        </Text>
                      ) : null}
                      {column.id === 'meta' ? (
                        <Text numberOfLines={1} style={styles.cellTextCenter}>
                          {voucher.minPurchaseAmount > 0
                            ? formatRupiah(voucher.minPurchaseAmount)
                            : '—'}
                        </Text>
                      ) : null}
                      {column.id === 'children' ? (
                        <Text numberOfLines={1} style={styles.cellText}>
                          {formatKolamVoucherUsageLabel(voucher)}
                        </Text>
                      ) : null}
                      {column.id === 'notes' ? (
                        <View style={styles.periodCell}>
                          <Text numberOfLines={1} style={styles.cellTextCenter}>
                            {formatKolamVoucherPeriodLabel(voucher)}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.remainingText,
                              remaining.intent === 'danger' &&
                                styles.remainingDanger,
                              remaining.intent === 'warning' &&
                                styles.remainingWarning,
                              remaining.intent === 'success' &&
                                styles.remainingSuccess,
                            ]}
                          >
                            {remaining.label}
                          </Text>
                        </View>
                      ) : null}
                      {column.id === 'status' ? (
                        <View style={styles.statusCell}>
                          {controller.canUpdate &&
                          voucher.status !== 'expired' ? (
                            <Switch
                              accessibilityLabel={`Ubah status ${voucher.code}`}
                              disabled={controller.mutating}
                              onValueChange={() => setPendingToggle(voucher)}
                              value={voucher.status === 'active'}
                            />
                          ) : null}
                          <KolamStatusBadge
                            intent={getKolamVoucherStatusIntent(voucher.status)}
                            label={formatKolamVoucherStatusLabel(voucher.status)}
                            style={styles.centerBadge}
                          />
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </KolamDataTableMainTrack>
              <KolamDataTableActionsTrack
                width={Math.max(
                  columns.find(column => column.id === 'actions')?.width ??
                    KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
                  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
                )}
              >
                <KolamOverflowMenuButton
                  accessibilityLabel={`Menu ${voucher.code}`}
                  actions={[
                    {
                      label: 'Lihat',
                      onPress: () =>
                        onRouteChange?.(
                          buildKolamVoucherDetailRoute(voucher.id),
                        ),
                    },
                    ...(controller.canDelete
                      ? [
                          {
                            label: 'Hapus',
                            onPress: () => setPendingDelete(voucher),
                            disabled: controller.mutating,
                            tone: 'danger' as const,
                          },
                        ]
                      : []),
                  ]}
                />
              </KolamDataTableActionsTrack>
            </KolamDataTableRowFrame>
          );
        })}
      </KolamCatalogListTableShell>

      <KolamDeleteConfirmDialog
        itemLabel={pendingDelete?.code}
        itemType="voucher"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const target = pendingDelete;
          setPendingDelete(null);
          if (target) {
            void controller.onDeleteVoucher(target);
          }
        }}
        visible={Boolean(pendingDelete)}
      />

      <KolamConfirmDialog
        confirmLabel={
          pendingToggle?.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'
        }
        destructive={pendingToggle?.status === 'active'}
        message={
          pendingToggle
            ? pendingToggle.status === 'active'
              ? `Nonaktifkan voucher ${pendingToggle.code}?`
              : `Aktifkan voucher ${pendingToggle.code}?`
            : ''
        }
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => {
          const target = pendingToggle;
          setPendingToggle(null);
          if (target) {
            void controller.onToggleStatus(target);
          }
        }}
        title="Ubah status voucher"
        visible={Boolean(pendingToggle)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  banner: {
    alignSelf: 'stretch',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  statusFilter: {
    minWidth: 120,
  },
  filterChipBar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterChipLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filterChipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    maxWidth: 180,
  },
  filterChipRemove: {
    color: V.colors.mutedFg,
    fontSize: 14,
    fontWeight: '700',
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  skeletonCell: {
    backgroundColor: V.colors.muted,
    borderRadius: 4,
    height: 14,
  },
  primaryCell: {
    gap: 2,
  },
  primaryTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryCode: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  cellTextCenter: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  periodCell: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  remainingText: {
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  remainingDanger: {
    color: V.colors.danger,
  },
  remainingWarning: {
    color: V.colors.warning,
  },
  remainingSuccess: {
    color: V.colors.success,
  },
  statusCell: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    width: '100%',
  },
  centerBadge: {
    alignSelf: 'center',
  },
});
