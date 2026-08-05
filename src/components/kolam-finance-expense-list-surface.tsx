import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  buildKolamAssetPurchaseDetailRoute,
  getFinanceExpenseStatusIntent,
  getKolamAssetPurchaseCreateRoute,
  getKolamAssetPurchaseDetailRoute,
  getKolamAssetPurchaseEditRoute,
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
import { getKolamFileUrl } from '../lib/file-url';
import { resolveProfilePhotoUrl } from '../services/auth-api';
import { KolamAssetPurchaseDetailSurface } from './kolam-asset-purchase-detail-surface';
import { KolamAssetPurchaseFormSurface } from './kolam-asset-purchase-form-surface';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDateField } from './kolam-date-field';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamPaginationSummaryLabel,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
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
  onRequestDelete?: (row: KolamFinanceExpenseListRow) => void,
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
        render: row =>
          row.bookValue == null ? (
            <Text style={styles.metaText}>—</Text>
          ) : onRouteChange && row.id ? (
            <Pressable
              onPress={() =>
                onRouteChange(
                  buildKolamAssetPurchaseDetailRoute(row.id, 'depreciation'),
                )
              }
            >
              <Text style={styles.linkText}>{formatRupiah(row.bookValue)}</Text>
            </Pressable>
          ) : (
            <Text style={styles.metaText}>{formatRupiah(row.bookValue)}</Text>
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
      render: row => {
        if (kind === 'asset-purchase') {
          if (row.walletId && onRouteChange) {
            return (
              <Pressable
                onPress={() =>
                  onRouteChange(`/wallet/${encodeURIComponent(row.walletId)}`)
                }
              >
                <Text numberOfLines={1} style={styles.linkText}>
                  {row.walletLabel || row.walletId}
                </Text>
              </Pressable>
            );
          }
          return (
            <Text numberOfLines={1} style={styles.metaText}>
              {row.walletId ? row.walletLabel || row.walletId : 'Dompet Utama'}
            </Text>
          );
        }
        return (
          <Text numberOfLines={1} style={styles.metaText}>
            {row.walletLabel}
          </Text>
        );
      },
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

  if (kind === 'asset-purchase') {
    base.push({
      id: 'createdBy',
      label: 'PIC',
      flex: 0.55,
      render: row => <AssetPurchasePicAvatar row={row} />,
    });
  } else {
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
  }

  if (kind === 'asset-purchase') {
    base.push({
      id: 'createdAt',
      label: 'Dibuat',
      flex: 0.8,
      render: row => (
        <Text numberOfLines={1} style={styles.metaText}>
          {row.createdAtLabel || '—'}
        </Text>
      ),
    });
  }

  if (kind === 'asset-purchase') {
    // Action column rendered by AssetPurchaseListRow (needs menu-open z-index).
    return base;
  }

  base.push({
    id: 'action',
    label: '',
    flex: 0.8,
    render: row => (
      <View style={styles.rowActions}>
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

function buildAssetPurchaseRowActions(
  row: KolamFinanceExpenseListRow,
  controller: KolamFinanceExpenseListController,
  onRouteChange?: (route: string) => void,
  onRequestDelete?: (row: KolamFinanceExpenseListRow) => void,
): Array<{
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
}> {
  if (!row.id) {
    return [];
  }
  const actions: Array<{
    label: string;
    onPress: () => void;
    tone?: 'default' | 'danger';
  }> = [];
  if (onRouteChange) {
    actions.push({
      label: 'Lihat',
      onPress: () => onRouteChange(getKolamAssetPurchaseDetailRoute(row.id)),
    });
    if (controller.canUpdate) {
      actions.push({
        label: 'Rubah',
        onPress: () => onRouteChange(getKolamAssetPurchaseEditRoute(row.id)),
      });
    }
  }
  if (controller.canDelete) {
    actions.push({
      label: 'Hapus',
      onPress: () => {
        onRequestDelete?.(row);
      },
      tone: 'danger',
    });
  }
  return actions;
}

function AssetPurchasePicAvatar({
  onTooltipOpenChange,
  row,
}: {
  onTooltipOpenChange?: (open: boolean) => void;
  row: KolamFinanceExpenseListRow;
}) {
  const name =
    row.createdByLabel && row.createdByLabel !== '—'
      ? row.createdByLabel
      : 'Tanpa PIC';
  const photoUri =
    resolveProfilePhotoUrl(row.createdByPhoto) ??
    getKolamFileUrl(row.createdByPhoto);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?';

  return (
    <View style={styles.picCell}>
      <KolamHoverTooltip
        align="center"
        containerStyle={styles.picTooltip}
        label={name}
        onOpenChange={onTooltipOpenChange}
      >
        <View accessibilityLabel={`PIC ${name}`} style={styles.picAvatar}>
          <KolamProfileAvatarContent
            imageStyle={styles.picAvatarImage}
            imageUrl={photoUri}
            initials={initials}
            textStyle={styles.picAvatarText}
          />
        </View>
      </KolamHoverTooltip>
    </View>
  );
}

function AssetPurchaseListRow({
  columns,
  controller,
  item,
  onRequestDelete,
  onRouteChange,
}: {
  columns: ColumnDef[];
  controller: KolamFinanceExpenseListController;
  item: KolamFinanceExpenseListRow;
  onRequestDelete?: (row: KolamFinanceExpenseListRow) => void;
  onRouteChange?: (route: string) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [picTooltipOpen, setPicTooltipOpen] = React.useState(false);
  const actions = buildAssetPurchaseRowActions(
    item,
    controller,
    onRouteChange,
    onRequestDelete,
  );
  const elevate = menuOpen || picTooltipOpen;

  return (
    <View style={[styles.row, elevate ? styles.rowMenuOpen : null]}>
      {columns.map(column => (
        <View
          key={column.id}
          style={[
            styles.cell,
            { flex: column.flex },
            column.id === 'createdBy' ? styles.picCellOverflow : null,
          ]}
        >
          {column.id === 'createdBy' ? (
            <AssetPurchasePicAvatar
              onTooltipOpenChange={setPicTooltipOpen}
              row={item}
            />
          ) : (
            column.render(item)
          )}
        </View>
      ))}
      <View style={[styles.cell, styles.actionsCell]}>
        {actions.length > 0 ? (
          <View style={styles.rowActions}>
            <KolamOverflowMenuButton
              accessibilityLabel={`Menu ${item.name || item.code || item.id}`}
              actions={actions}
              onOpenChange={setMenuOpen}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
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
  const [deleteCandidate, setDeleteCandidate] =
    useState<KolamFinanceExpenseListRow | null>(null);
  const isAssetPurchase = kind === 'asset-purchase';
  const columns = React.useMemo(
    () =>
      buildColumns(kind, controller, onRouteChange, row =>
        setDeleteCandidate(row),
      ),
    [kind, controller, onRouteChange],
  );

  useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  useEffect(() => {
    if (!isAssetPurchase || controller.filters.limit === 10) {
      return;
    }
    controller.onLimitChange(10);
  }, [controller, isAssetPurchase]);

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

  const renderRow = (item: KolamFinanceExpenseListRow) => {
    if (isAssetPurchase) {
      return (
        <AssetPurchaseListRow
          key={item.id}
          columns={columns}
          controller={controller}
          item={item}
          onRequestDelete={row => setDeleteCandidate(row)}
          onRouteChange={onRouteChange}
        />
      );
    }

    return (
      <View key={item.id} style={styles.row}>
        {columns.map(column => (
          <View key={column.id} style={[styles.cell, { flex: column.flex }]}>
            {column.render(item)}
          </View>
        ))}
      </View>
    );
  };

  const paginationControls =
    pageCount > 1 ? (
      <View style={styles.paginationBar}>
        <KolamButton
          disabled={safePage <= 1 || controller.loading}
          label="Sebelumnya"
          onPress={() => controller.onPageChange(Math.max(1, safePage - 1))}
        />
        <Text style={styles.pageLabel}>
          {safePage} / {pageCount}
        </Text>
        <KolamButton
          disabled={safePage >= pageCount || controller.loading}
          label="Berikutnya"
          onPress={() =>
            controller.onPageChange(Math.min(pageCount, safePage + 1))
          }
        />
      </View>
    ) : null;

  const tableFooter = isAssetPurchase ? (
    <View style={styles.fixedPageFooter}>
      <KolamPaginationSummaryLabel
        page={safePage}
        pageSize={10}
        total={controller.pagination.total}
      />
      {paginationControls}
    </View>
  ) : (
    <KolamTableFooterControls
      onPageSizeChange={controller.onLimitChange}
      page={safePage}
      pageSize={controller.pagination.limit}
      total={controller.pagination.total}
    >
      {paginationControls}
    </KolamTableFooterControls>
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
          footer={tableFooter}
          style={styles.tableFrame}
        >
          <View style={styles.headerRow}>
            {columns.map(column => (
              <View
                key={column.id}
                style={[styles.cell, { flex: column.flex }]}
              >
                <Text style={styles.headerCellText}>{column.label}</Text>
              </View>
            ))}
            {isAssetPurchase ? (
              <View style={[styles.cell, styles.actionsCell]} />
            ) : null}
          </View>
          {controller.rows.length === 0 ? (
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={controller.loading ? 'Memuat…' : 'Tidak ada data'}
              />
            </View>
          ) : (
            controller.rows.map(item => renderRow(item))
          )}
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

      {isAssetPurchase ? (
        <KolamDeleteConfirmDialog
          itemLabel={deleteCandidate?.name || deleteCandidate?.code}
          itemType="pembelian aset"
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={() => {
            const row = deleteCandidate;
            setDeleteCandidate(null);
            if (row) {
              void controller.onDelete(row);
            }
          }}
          visible={Boolean(deleteCandidate)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    gap: 10,
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
    gap: 8,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1,
  },
  tableFrame: {
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    zIndex: 1,
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
    overflow: 'visible',
    paddingHorizontal: 8,
    zIndex: 0,
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
    overflow: 'visible',
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
    zIndex: 1,
  },
  rowMenuOpen: {
    elevation: 1000,
    overflow: 'visible',
    zIndex: 1000,
  },
  cell: {
    minWidth: 0,
    overflow: 'visible',
    paddingHorizontal: 4,
  },
  picCellOverflow: {
    overflow: 'visible',
    zIndex: 2,
  },
  picCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  picTooltip: {
    alignSelf: 'center',
  },
  picAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  picAvatarImage: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  picAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  actionsCell: {
    alignItems: 'flex-end',
    flex: 0.45,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    minWidth: 48,
    overflow: 'visible',
    zIndex: 2,
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
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  rowActions: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-end',
    overflow: 'visible',
    zIndex: 2,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  fixedPageFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
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
  if (mode === 'detail') {
    return <KolamAssetPurchaseDetailSurface {...props} />;
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
