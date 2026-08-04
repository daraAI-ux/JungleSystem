import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getFinanceExpenseStatusIntent,
  getKolamAssetPurchaseCreateRoute,
  getKolamAssetPurchaseDetailRoute,
  getKolamAssetPurchaseSurfaceMode,
  KOLAM_FINANCE_EXPENSE_PERIOD_FILTER_OPTIONS,
  KOLAM_FINANCE_EXPENSE_STATUS_FILTER_OPTIONS,
  type KolamFinanceExpenseKind,
  type KolamFinanceExpenseListRow,
  type KolamFinanceExpensePeriodFilter,
  type KolamFinanceExpenseStatusFilter,
} from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  getFinanceExpenseUnsupportedBackRoute,
  useKolamFinanceExpenseListController,
  type KolamFinanceExpenseListController,
} from '../hooks/use-kolam-finance-expense-list-controller';
import { formatRupiah } from '../lib/money';
import { KolamAssetPurchaseFormSurface } from './kolam-asset-purchase-form-surface';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDateField } from './kolam-date-field';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type ColumnDef = {
  id: string;
  label: string;
  flex: number;
  render: (row: KolamFinanceExpenseListRow) => React.ReactNode;
};

function buildColumns(
  kind: KolamFinanceExpenseKind,
  controller: KolamFinanceExpenseListController,
  onRouteChange?: (route: string) => void,
): ColumnDef[] {
  const base: ColumnDef[] = [
    {
      id: 'code',
      label: 'Kode',
      flex: 0.9,
      render: row => (
        <Text numberOfLines={1} style={styles.metaText}>
          {row.code || '—'}
        </Text>
      ),
    },
    {
      id: 'name',
      label: kind === 'asset-purchase' ? 'Nama aset' : 'Nama',
      flex: 1.2,
      render: row => (
        <Text numberOfLines={2} style={styles.primaryText}>
          {row.name}
        </Text>
      ),
    },
  ];

  if (kind === 'routine-expense') {
    base.push({
      id: 'category',
      label: 'Kategori',
      flex: 0.8,
      render: row => (
        <Text numberOfLines={1} style={styles.metaText}>
          {row.categoryLabel}
        </Text>
      ),
    });
  }

  base.push({
    id: 'status',
    label: 'Status',
    flex: 0.9,
    render: row => (
      <KolamStatusBadge
        intent={getFinanceExpenseStatusIntent(row.status)}
        label={row.statusLabel}
      />
    ),
  });

  if (kind === 'asset-purchase') {
    base.push(
      {
        id: 'price',
        label: 'Harga',
        flex: 0.9,
        render: row => (
          <Text style={styles.primaryText}>{formatRupiah(row.price)}</Text>
        ),
      },
      {
        id: 'shipping',
        label: 'Pengiriman',
        flex: 0.8,
        render: row => (
          <Text style={styles.metaText}>
            {row.shippingCost > 0 ? formatRupiah(row.shippingCost) : 'Gratis'}
          </Text>
        ),
      },
      {
        id: 'amount',
        label: 'Total',
        flex: 0.9,
        render: row => (
          <Text style={styles.primaryText}>{formatRupiah(row.total)}</Text>
        ),
      },
      {
        id: 'bookValue',
        label: 'Nilai buku',
        flex: 0.9,
        render: row => (
          <Text style={styles.metaText}>
            {row.bookValue == null ? '—' : formatRupiah(row.bookValue)}
          </Text>
        ),
      },
      {
        id: 'location',
        label: 'Lokasi',
        flex: 0.8,
        render: row => (
          <Text numberOfLines={1} style={styles.metaText}>
            {row.locationLabel}
          </Text>
        ),
      },
    );
  } else {
    base.push({
      id: 'amount',
      label: 'Jumlah',
      flex: 1,
      render: row => (
        <Text style={styles.primaryText}>{formatRupiah(row.amount)}</Text>
      ),
    });
  }

  base.push(
    {
      id: 'wallet',
      label: 'Dompet',
      flex: 0.9,
      render: row => (
        <Text numberOfLines={1} style={styles.metaText}>
          {row.walletLabel}
        </Text>
      ),
    },
    {
      id: 'executed',
      label: 'Dieksekusi',
      flex: 0.9,
      render: row => (
        <Text numberOfLines={1} style={styles.metaText}>
          {row.executedAtLabel}
        </Text>
      ),
    },
  );

  if (kind === 'unexpected-expense' || kind === 'unexpected-income') {
    base.push({
      id: 'reason',
      label: 'Alasan',
      flex: 1,
      render: row => (
        <Text numberOfLines={2} style={styles.metaText}>
          {row.reason || '—'}
        </Text>
      ),
    });
  }

  if (kind === 'routine-expense') {
    base.push({
      id: 'note',
      label: 'Catatan',
      flex: 1,
      render: row => (
        <Text numberOfLines={2} style={styles.metaText}>
          {row.note || '—'}
        </Text>
      ),
    });
  }

  if (kind === 'asset-purchase') {
    base.push({
      id: 'reason',
      label: 'Alasan',
      flex: 1,
      render: row => (
        <Text numberOfLines={2} style={styles.metaText}>
          {row.reason || '—'}
        </Text>
      ),
    });
  }

  base.push({
    id: 'createdBy',
    label: 'Dibuat oleh',
    flex: 0.9,
    render: row => (
      <Text numberOfLines={1} style={styles.metaText}>
        {row.createdByLabel}
      </Text>
    ),
  });

  base.push({
    id: 'action',
    label: '',
    flex: kind === 'asset-purchase' ? 1.2 : 0.8,
    render: row => (
      <View style={styles.rowActions}>
        {kind === 'asset-purchase' && onRouteChange && row.id ? (
          <KolamButton
            intent="secondary"
            label="Lihat"
            onPress={() =>
              onRouteChange(getKolamAssetPurchaseDetailRoute(row.id))
            }
            style={styles.actionButton}
          />
        ) : null}
        {controller.canVerify && row.status !== 'verified' ? (
          <KolamButton
            intent="primary"
            label={controller.verifyingId === row.id ? '…' : 'Verifikasi'}
            onPress={() => {
              void controller.onVerify(row);
            }}
            style={styles.actionButton}
          />
        ) : null}
      </View>
    ),
  });

  return base;
}

export function KolamFinanceExpenseListSurface({
  kind,
  onRouteChange,
  route,
}: {
  kind: KolamFinanceExpenseKind;
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamFinanceExpenseListController(
    kind,
    route,
    onRouteChange,
  );

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
            onPress={() =>
              onRouteChange(getFinanceExpenseUnsupportedBackRoute(kind))
            }
            style={styles.backButton}
          />
        ) : null}
      </View>
    );
  }

  return (
    <FinanceExpenseListBody
      controller={controller}
      kind={kind}
      onRouteChange={onRouteChange}
    />
  );
}

function FinanceExpenseListBody({
  controller,
  kind,
  onRouteChange,
}: {
  controller: KolamFinanceExpenseListController;
  kind: KolamFinanceExpenseKind;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = useState(controller.filters.search);
  const [exportOpen, setExportOpen] = useState(false);
  const isAssetPurchase = kind === 'asset-purchase';
  const columns = React.useMemo(
    () => buildColumns(kind, controller, onRouteChange),
    [kind, controller, onRouteChange],
  );

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
    KOLAM_FINANCE_EXPENSE_STATUS_FILTER_OPTIONS.find(
      option => option.value === controller.filters.status,
    )?.label ?? 'Semua status';
  const periodLabel =
    KOLAM_FINANCE_EXPENSE_PERIOD_FILTER_OPTIONS.find(
      option => option.value === controller.filters.period,
    )?.label ?? 'Semua waktu';

  const locationOptions = useMemo(
    () => [
      { label: 'Semua lokasi', value: '' },
      ...controller.locations.map(location => ({
        label: location.label || location.name,
        value: location.id,
      })),
    ],
    [controller.locations],
  );

  const filtersApplied =
    Boolean(controller.filters.search.trim()) ||
    controller.filters.status !== 'all' ||
    controller.filters.period !== 'all' ||
    Boolean(controller.filters.locationId.trim());

  const safePage = Math.max(1, controller.pagination.page);
  const pageCount = Math.max(1, controller.pagination.totalPages);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamFinanceExpenseListRow }) => {
      const cells = (
        <>
          {columns.map(column => (
            <View key={column.id} style={[styles.cell, { flex: column.flex }]}>
              {column.render(item)}
            </View>
          ))}
        </>
      );

      if (isAssetPurchase && onRouteChange && item.id) {
        return (
          <Pressable
            onPress={() =>
              onRouteChange(getKolamAssetPurchaseDetailRoute(item.id))
            }
            style={styles.row}
          >
            {cells}
          </Pressable>
        );
      }

      return <View style={styles.row}>{cells}</View>;
    },
    [columns, isAssetPurchase, onRouteChange],
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

      {controller.totals && kind === 'routine-expense' ? (
        <View style={styles.totalsStrip}>
          <Text style={styles.totalsText}>
            Total: {formatRupiah(controller.totals.totalAmount)}
          </Text>
          <Text style={styles.totalsMeta}>
            {controller.totals.totalCount} baris
          </Text>
        </View>
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
                controller.onStatusChange(
                  value as KolamFinanceExpenseStatusFilter,
                )
              }
              options={KOLAM_FINANCE_EXPENSE_STATUS_FILTER_OPTIONS.map(
                option => ({
                  label: option.label,
                  value: option.value,
                }),
              )}
              showLabelInTrigger={false}
              value={controller.filters.status}
            />
            {isAssetPurchase ? (
              <>
                <KolamDropdownSelect
                  label={periodLabel}
                  onChange={value =>
                    controller.onPeriodChange(
                      value as KolamFinanceExpensePeriodFilter,
                    )
                  }
                  options={KOLAM_FINANCE_EXPENSE_PERIOD_FILTER_OPTIONS.map(
                    option => ({
                      label: option.label,
                      value: option.value,
                    }),
                  )}
                  showLabelInTrigger={false}
                  value={controller.filters.period}
                />
                {controller.filters.period === 'custom' ? (
                  <>
                    <KolamDateField
                      accessibilityLabel="Tanggal mulai"
                      label="Dari"
                      onChange={controller.onStartDateChange}
                      placeholder="Dari"
                      showLabelInTrigger={false}
                      style={styles.dateField}
                      triggerStyle={styles.dateFieldTrigger}
                      value={controller.filters.startDate}
                    />
                    <KolamDateField
                      accessibilityLabel="Tanggal sampai"
                      label="Sampai"
                      onChange={controller.onEndDateChange}
                      placeholder="Sampai"
                      showLabelInTrigger={false}
                      style={styles.dateField}
                      triggerStyle={styles.dateFieldTrigger}
                      value={controller.filters.endDate}
                    />
                  </>
                ) : null}
                <KolamDropdownSelect
                  label="Lokasi"
                  onChange={controller.onLocationChange}
                  options={locationOptions}
                  showLabelInTrigger={false}
                  style={styles.locationSelect}
                  value={controller.filters.locationId}
                />
              </>
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {isAssetPurchase && filtersApplied ? (
              <KolamButton
                intent="secondary"
                label="Reset"
                onPress={controller.onClearFilters}
              />
            ) : null}
            {isAssetPurchase ? (
              <KolamButton
                intent="secondary"
                label="Ekspor"
                onPress={() => setExportOpen(true)}
              />
            ) : null}
            <KolamButton
              intent="secondary"
              label={controller.loading ? 'Memuat…' : 'Muat ulang'}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {isAssetPurchase && controller.canCreate && onRouteChange ? (
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => onRouteChange(getKolamAssetPurchaseCreateRoute())}
              />
            ) : null}
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
                {columns.map(column => (
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

      {isAssetPurchase ? (
        <KolamExportDialog
          catalogEndpoint="/asset-purchase/export/fields"
          downloadEndpoint="/asset-purchase/export.xlsx"
          downloadParams={{
            search: controller.filters.search.trim() || undefined,
            period:
              controller.filters.period !== 'all'
                ? controller.filters.period
                : undefined,
            startDate:
              controller.filters.period === 'custom'
                ? controller.filters.startDate || undefined
                : undefined,
            endDate:
              controller.filters.period === 'custom'
                ? controller.filters.endDate || undefined
                : undefined,
            status:
              controller.filters.status !== 'all'
                ? controller.filters.status
                : undefined,
          }}
          filenameHint="asset-purchase"
          onOpenChange={setExportOpen}
          storageKey="asset-purchase-export-fields"
          title="Ekspor Pembelian Aset"
          visible={exportOpen}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  banner: {
    alignSelf: 'stretch',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  totalsStrip: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  totalsText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  totalsMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  dateField: {
    flexGrow: 0,
    flexShrink: 0,
    width: 96,
  },
  dateFieldTrigger: {
    minWidth: 96,
    paddingHorizontal: 8,
  },
  locationSelect: {
    minWidth: 120,
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
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  actionButton: {
    alignSelf: 'flex-start',
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

export function KolamRoutineExpenseSurface(props: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  return (
    <KolamFinanceExpenseListSurface kind="routine-expense" {...props} />
  );
}

export function KolamUnexpectedExpenseSurface(props: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  return (
    <KolamFinanceExpenseListSurface kind="unexpected-expense" {...props} />
  );
}

export function KolamUnexpectedIncomeSurface(props: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  return (
    <KolamFinanceExpenseListSurface kind="unexpected-income" {...props} />
  );
}

export function KolamAssetPurchaseSurface(props: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const mode = getKolamAssetPurchaseSurfaceMode(props.route);
  if (mode === 'create' || mode === 'edit') {
    return <KolamAssetPurchaseFormSurface {...props} />;
  }
  if (mode === 'list') {
    return (
      <KolamFinanceExpenseListSurface kind="asset-purchase" {...props} />
    );
  }
  return (
    <View style={styles.surface}>
      <KolamEmptyState title="Belum tersedia" />
      {props.onRouteChange ? (
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={() =>
            props.onRouteChange?.(
              getFinanceExpenseUnsupportedBackRoute('asset-purchase'),
            )
          }
          style={styles.backButton}
        />
      ) : null}
    </View>
  );
}
