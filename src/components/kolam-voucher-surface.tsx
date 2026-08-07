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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import {
  useKolamVoucherController,
  type KolamVoucherController,
} from '../hooks/use-kolam-voucher-controller';
import { KolamButton } from './kolam-button';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamVoucherDetail } from './kolam-voucher-detail';
import { KolamVoucherForm } from './kolam-voucher-form';

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
  const openVoucher = React.useCallback(
    (voucher: KolamVoucher) => {
      onRouteChange?.(buildKolamVoucherDetailRoute(voucher.id));
    },
    [onRouteChange],
  );
  const columns = React.useMemo(
    () =>
      buildVoucherListColumns({
        canUpdate: controller.canUpdate,
        loading: controller.mutating,
        onSelect: openVoucher,
        onToggle: setPendingToggle,
      }),
    [controller.canUpdate, controller.mutating, openVoucher],
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

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle={controller.loading ? 'Memuat voucher...' : 'Voucher kosong'}
        getRowKey={voucher => voucher.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSetPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={voucher => (
          <KolamOverflowMenuButton
            accessibilityLabel={`Menu ${voucher.code}`}
            actions={[
              {
                label: 'Lihat',
                onPress: () => openVoucher(voucher),
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
        )}
        rows={controller.vouchers}
      />

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

function buildVoucherListColumns({
  canUpdate,
  loading,
  onSelect,
  onToggle,
}: {
  canUpdate: boolean;
  loading: boolean;
  onSelect: (voucher: KolamVoucher) => void;
  onToggle: (voucher: KolamVoucher) => void;
}): Array<KolamListTableColumn<KolamVoucher>> {
  return [
    {
      flex: 1.4,
      id: 'primary',
      label: 'Voucher',
      render: voucher => (
        <Pressable onPress={() => onSelect(voucher)} style={styles.cellPressable}>
          <View style={styles.primaryCell}>
            <Text numberOfLines={1} style={styles.primaryTitle}>
              {voucher.title || 'â€”'}
            </Text>
            <Text numberOfLines={1} style={styles.primaryCode}>
              {voucher.code || 'â€”'}
            </Text>
          </View>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'amount',
      label: 'Diskon',
      render: voucher => (
        <Text numberOfLines={2} style={styles.cellTextCenter}>
          {formatKolamVoucherDiscountLabel(voucher)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'meta',
      label: 'Min. belanja',
      render: voucher => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {voucher.minPurchaseAmount > 0
            ? formatRupiah(voucher.minPurchaseAmount)
            : 'â€”'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'children',
      label: 'Pemakaian',
      render: voucher => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {formatKolamVoucherUsageLabel(voucher)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1,
      id: 'notes',
      label: 'Periode',
      render: voucher => {
        const remaining = formatKolamVoucherRemainingLabel(voucher);
        return (
          <View style={styles.periodCell}>
            <Text numberOfLines={1} style={styles.cellTextCenter}>
              {formatKolamVoucherPeriodLabel(voucher)}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.remainingText,
                remaining.intent === 'danger' && styles.remainingDanger,
                remaining.intent === 'warning' && styles.remainingWarning,
                remaining.intent === 'success' && styles.remainingSuccess,
              ]}
            >
              {remaining.label}
            </Text>
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: voucher => (
        <View style={styles.statusCell}>
          {canUpdate && voucher.status !== 'expired' ? (
            <Switch
              accessibilityLabel={`Ubah status ${voucher.code}`}
              disabled={loading}
              onValueChange={() => onToggle(voucher)}
              value={voucher.status === 'active'}
            />
          ) : null}
          <KolamStatusBadge
            intent={getKolamVoucherStatusIntent(voucher.status)}
            label={formatKolamVoucherStatusLabel(voucher.status)}
            style={styles.centerBadge}
          />
        </View>
      ),
    },
  ];
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
  cellPressable: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
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
