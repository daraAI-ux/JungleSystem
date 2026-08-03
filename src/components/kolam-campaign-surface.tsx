import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  buildKolamCampaignDetailRoute,
  buildKolamCampaignEditRoute,
  countKolamCampaignVariants,
  formatKolamCampaignCreatedAt,
  formatKolamCampaignDateTimeParts,
  formatKolamCampaignDiscountLabel,
  formatKolamCampaignDurationLabel,
  formatKolamCampaignStatusLabel,
  getKolamCampaignStatusIntent,
  KOLAM_CAMPAIGN_CREATE_ROUTE,
  KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS,
  type KolamCampaign,
  type KolamCampaignStatus,
} from '../domain/kolam-campaign';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCampaignController,
  type KolamCampaignController,
} from '../hooks/use-kolam-campaign-controller';
import { KolamButton } from './kolam-button';
import { KolamCampaignDetail } from './kolam-campaign-detail';
import { KolamCampaignForm } from './kolam-campaign-form';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
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

const CAMPAIGN_SKELETON_ROW_COUNT = 8;

function fitCampaignListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('campaign'),
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

export function KolamCampaignSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCampaignController(route);

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Tidak ada izin view penjualan (sale) untuk membuka kampanye."
          title="Akses ditolak"
        />
      </View>
    );
  }

  if (controller.mode === 'list') {
    return (
      <KolamCampaignList controller={controller} onRouteChange={onRouteChange} />
    );
  }

  if (controller.mode === 'detail') {
    return (
      <KolamCampaignDetail
        controller={controller}
        onRouteChange={onRouteChange}
      />
    );
  }

  return (
    <KolamCampaignForm controller={controller} onRouteChange={onRouteChange} />
  );
}

function KolamCampaignList({
  controller,
  onRouteChange,
}: {
  controller: KolamCampaignController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(controller.search);
  const [pendingDelete, setPendingDelete] = React.useState<KolamCampaign | null>(
    null,
  );
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const columns = React.useMemo(
    () => fitCampaignListColumns(tableBodyWidth),
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
    KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS.find(
      option => option.value === controller.statusFilter,
    )?.label ?? 'Status';

  const clearSearchFilter = () => {
    setSearchInput('');
    controller.onSearchChange('');
  };

  const clearStatusFilter = () => {
    controller.onSetStatusFilter('');
  };

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              onChangeText={setSearchInput}
              placeholder="Cari"
              value={searchInput}
            />
            <KolamDropdownSelect
              label={controller.statusFilter ? statusFilterLabel : 'Status'}
              onChange={value =>
                controller.onSetStatusFilter(
                  value as '' | KolamCampaignStatus,
                )
              }
              options={KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              value={controller.statusFilter}
            />
            {filtersApplied ? (
              <KolamButton
                intent="plain"
                label="Hapus"
                onPress={controller.onClearFilters}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {controller.canCreate ? (
              <KolamButton
                intent="outline"
                label="Baru"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.(KOLAM_CAMPAIGN_CREATE_ROUTE);
                }}
              />
            ) : null}
            <KolamButton
              label="Muat ulang"
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
                onPress={clearSearchFilter}
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
                onPress={clearStatusFilter}
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
                  disabled={controller.page <= 1}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onSetPage(Math.max(1, controller.page - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {controller.page} / {controller.totalPages}
                </Text>
                <KolamButton
                  disabled={controller.page >= controller.totalPages}
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
        {controller.loading && controller.campaigns.length === 0
          ? Array.from({ length: CAMPAIGN_SKELETON_ROW_COUNT }).map((_, index) => (
              <KolamCampaignSkeletonRow columns={columns} key={`sk-${index}`} />
            ))
          : null}
        {!controller.loading && controller.campaigns.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              message="Belum ada kampanye untuk filter ini."
              title="Kampanye kosong"
            />
          </View>
        ) : null}
        {controller.campaigns.map(campaign => (
          <KolamCampaignRow
            campaign={campaign}
            canDelete={controller.canDelete}
            canUpdate={controller.canUpdate}
            columns={columns}
            key={campaign.id}
            mutating={controller.mutating}
            onDelete={() => setPendingDelete(campaign)}
            onEdit={() => onRouteChange?.(buildKolamCampaignEditRoute(campaign.id))}
            onSelect={() =>
              onRouteChange?.(buildKolamCampaignDetailRoute(campaign.id))
            }
          />
        ))}
      </KolamCatalogListTableShell>

      <KolamDeleteConfirmDialog
        itemLabel={pendingDelete?.title}
        itemType="kampanye"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const target = pendingDelete;
          setPendingDelete(null);
          if (target) {
            void controller.onDeleteCampaign(target);
          }
        }}
        visible={Boolean(pendingDelete)}
      />
    </View>
  );
}

function KolamCampaignSkeletonRow({
  columns,
}: {
  columns: KolamTableColumn[];
}) {
  const mainColumns = columns.filter(column => column.id !== 'actions');

  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        {mainColumns.map(column => (
          <View
            key={column.id}
            style={[styles.cell, getKolamDataTableColumnStyle(column)]}
          >
            <View
              style={[
                styles.skeletonBar,
                column.id === 'primary'
                  ? styles.skeletonBarWide
                  : styles.skeletonBarNarrow,
              ]}
            />
          </View>
        ))}
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <View style={styles.skeletonAction} />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamCampaignRow({
  campaign,
  canDelete,
  canUpdate,
  columns,
  mutating,
  onDelete,
  onEdit,
  onSelect,
}: {
  campaign: KolamCampaign;
  canDelete: boolean;
  canUpdate: boolean;
  columns: KolamTableColumn[];
  mutating: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const columnOf = (id: KolamTableColumn['id']) =>
    columns.find(column => column.id === id);
  const start = formatKolamCampaignDateTimeParts(campaign.startDate);
  const end = formatKolamCampaignDateTimeParts(campaign.endDate);
  const variantCount = countKolamCampaignVariants(campaign);

  return (
    <Pressable onPress={onSelect}>
      <KolamDataTableRowFrame>
        <KolamDataTableMainTrack>
          <View
            style={[
              styles.cell,
              columnOf('primary')
                ? getKolamDataTableColumnStyle(columnOf('primary')!)
                : null,
            ]}
          >
            <Text numberOfLines={2} style={styles.title}>
              {campaign.title}
            </Text>
          </View>

          <View
            style={[
              styles.cell,
              styles.centerCell,
              columnOf('status')
                ? getKolamDataTableColumnStyle(columnOf('status')!)
                : null,
            ]}
          >
            <KolamStatusBadge
              intent={getKolamCampaignStatusIntent(campaign.status)}
              label={formatKolamCampaignStatusLabel(campaign.status)}
              numberOfLines={2}
              style={styles.centerBadge}
            />
          </View>

          <View
            style={[
              styles.cell,
              columnOf('children')
                ? getKolamDataTableColumnStyle(columnOf('children')!)
                : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.startDate}>
              {start.date}
            </Text>
            {start.time ? (
              <Text numberOfLines={1} style={styles.meta}>
                {start.time}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.cell,
              columnOf('marketplace')
                ? getKolamDataTableColumnStyle(columnOf('marketplace')!)
                : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.endDate}>
              {end.date}
            </Text>
            {end.time ? (
              <Text numberOfLines={1} style={styles.meta}>
                {end.time}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.cell,
              styles.centerCell,
              columnOf('notes')
                ? getKolamDataTableColumnStyle(columnOf('notes')!)
                : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.primaryText}>
              {formatKolamCampaignDurationLabel(campaign)}
            </Text>
          </View>

          <View
            style={[
              styles.cell,
              columnOf('amount')
                ? getKolamDataTableColumnStyle(columnOf('amount')!)
                : null,
            ]}
          >
            <Text numberOfLines={2} style={styles.primaryText}>
              {formatKolamCampaignDiscountLabel(campaign)}
            </Text>
          </View>

          <View
            style={[
              styles.cell,
              styles.centerCell,
              columnOf('products')
                ? getKolamDataTableColumnStyle(columnOf('products')!)
                : null,
            ]}
          >
            <KolamStatusBadge
              intent="secondary"
              label={`${campaign.products.length} Produk`}
              numberOfLines={1}
              style={styles.centerBadge}
            />
            {variantCount > 0 ? (
              <KolamStatusBadge
                intent="info"
                label={`${variantCount} Varian`}
                numberOfLines={1}
                style={styles.centerBadge}
              />
            ) : null}
          </View>

          <View
            style={[
              styles.cell,
              styles.centerCell,
              columnOf('meta')
                ? getKolamDataTableColumnStyle(columnOf('meta')!)
                : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.meta}>
              {formatKolamCampaignCreatedAt(campaign.createdAt)}
            </Text>
          </View>
        </KolamDataTableMainTrack>

        <KolamDataTableActionsTrack>
          <KolamOverflowMenuButton
            accessibilityLabel={`Menu ${campaign.title}`}
            actions={[
              { label: 'Lihat', onPress: onSelect },
              ...(canUpdate
                ? [{ label: 'Rubah', onPress: onEdit }]
                : []),
              ...(canDelete
                ? [
                    {
                      label: 'Hapus',
                      onPress: onDelete,
                      disabled: mutating,
                    },
                  ]
                : []),
            ]}
          />
        </KolamDataTableActionsTrack>
      </KolamDataTableRowFrame>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  filterChipBar: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterChipLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    maxWidth: 280,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filterChipText: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  filterChipRemove: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  emptyWrap: {
    padding: 16,
  },
  cell: {
    gap: 2,
    justifyContent: 'center',
    minWidth: 0,
    paddingVertical: 8,
  },
  centerCell: {
    alignItems: 'center',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  skeletonBar: {
    backgroundColor: V.colors.muted,
    borderRadius: 4,
    height: 12,
  },
  skeletonBarWide: {
    width: '78%',
  },
  skeletonBarNarrow: {
    width: '56%',
  },
  skeletonAction: {
    alignSelf: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 4,
    height: 18,
    width: 28,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  startDate: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  endDate: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
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
});
