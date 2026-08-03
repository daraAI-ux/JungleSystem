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
  KOLAM_CAMPAIGN_ROOT,
  KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS,
  type KolamCampaign,
  type KolamCampaignStatus,
} from '../domain/kolam-campaign';
import {
  getKolamTableColumns,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCampaignController,
  type KolamCampaignController,
} from '../hooks/use-kolam-campaign-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
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

export function KolamCampaignSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCampaignController(route);

  if (controller.mode !== 'list') {
    return (
      <KolamCampaignPlaceholder
        mode={controller.mode}
        onBack={() => onRouteChange?.(KOLAM_CAMPAIGN_ROOT)}
      />
    );
  }

  return (
    <KolamCampaignList controller={controller} onRouteChange={onRouteChange} />
  );
}

function KolamCampaignPlaceholder({
  mode,
  onBack,
}: {
  mode: 'detail' | 'edit' | 'new';
  onBack: () => void;
}) {
  const title =
    mode === 'new'
      ? 'Kampanye baru'
      : mode === 'edit'
        ? 'Ubah kampanye'
        : 'Detail kampanye';
  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <Text numberOfLines={1} style={styles.placeholderTitle}>
            {title}
          </Text>
          <KolamButton label="Kembali ke daftar" onPress={onBack} />
        </View>
      </View>
      <KolamEmptyState
        message="Form create / detail / edit kampanye menyusul di batch berikutnya. Daftar sudah live."
        title="Belum tersedia"
      />
    </View>
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
  const columns = React.useMemo(() => getKolamTableColumns('campaign'), []);

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
            <KolamButton
              intent="outline"
              label="Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.(KOLAM_CAMPAIGN_CREATE_ROUTE);
              }}
            />
            <KolamButton
              label="Muat ulang"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
          </View>
        </View>
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
      >
        <KolamDataTableHeader columns={columns} />
        {controller.loading && controller.campaigns.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              message="Memuat daftar kampanye…"
              title="Memuat"
            />
          </View>
        ) : null}
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

function KolamCampaignRow({
  campaign,
  columns,
  mutating,
  onDelete,
  onEdit,
  onSelect,
}: {
  campaign: KolamCampaign;
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
              { label: 'Rubah', onPress: onEdit },
              {
                label: 'Hapus',
                onPress: onDelete,
                disabled: mutating,
              },
            ]}
            style={
              columnOf('actions')
                ? {
                    width:
                      columnOf('actions')!.width ??
                      KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
                  }
                : undefined
            }
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
  emptyWrap: {
    padding: 16,
  },
  placeholderTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
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
