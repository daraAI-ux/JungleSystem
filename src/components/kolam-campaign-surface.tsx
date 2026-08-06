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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCampaignController,
  type KolamCampaignController,
} from '../hooks/use-kolam-campaign-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCampaignDetail } from './kolam-campaign-detail';
import { KolamCampaignForm } from './kolam-campaign-form';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
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
  const openCampaign = React.useCallback(
    (campaign: KolamCampaign) => {
      onRouteChange?.(buildKolamCampaignDetailRoute(campaign.id));
    },
    [onRouteChange],
  );
  const columns = React.useMemo(
    () => buildCampaignListColumns({ onSelect: openCampaign }),
    [openCampaign],
  );

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
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari"
              value={searchInput}
            />
            <KolamDropdownSelect
              label={statusFilterLabel}
              onChange={value =>
                controller.onSetStatusFilter(
                  value as '' | KolamCampaignStatus,
                )
              }
              options={KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS.map(option => ({
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
                  onRouteChange?.(KOLAM_CAMPAIGN_CREATE_ROUTE);
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

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle={
          controller.loading ? 'Memuat kampanye...' : 'Kampanye kosong'
        }
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
        getRowKey={campaign => campaign.id}
        loading={controller.loading}
        renderActions={campaign => (
          <KolamOverflowMenuButton
            accessibilityLabel={`Menu ${campaign.title}`}
            actions={[
              { label: 'Lihat', onPress: () => openCampaign(campaign) },
              ...(controller.canUpdate
                ? [
                    {
                      label: 'Rubah',
                      onPress: () =>
                        onRouteChange?.(
                          buildKolamCampaignEditRoute(campaign.id),
                        ),
                    },
                  ]
                : []),
              ...(controller.canDelete
                ? [
                    {
                      label: 'Hapus',
                      onPress: () => setPendingDelete(campaign),
                      disabled: controller.mutating,
                      tone: 'danger' as const,
                    },
                  ]
                : []),
            ]}
          />
        )}
        rows={controller.campaigns}
      />

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

function buildCampaignListColumns({
  onSelect,
}: {
  onSelect: (campaign: KolamCampaign) => void;
}): Array<KolamListTableColumn<KolamCampaign>> {
  return [
    {
      flex: 1.5,
      id: 'primary',
      label: 'Kampanye',
      render: campaign => (
        <Pressable onPress={() => onSelect(campaign)} style={styles.cellPressable}>
          <Text numberOfLines={2} style={styles.title}>
            {campaign.title}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: campaign => (
        <KolamStatusBadge
          intent={getKolamCampaignStatusIntent(campaign.status)}
          label={formatKolamCampaignStatusLabel(campaign.status)}
          numberOfLines={2}
          style={styles.centerBadge}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'children',
      label: 'Mulai',
      render: campaign => {
        const start = formatKolamCampaignDateTimeParts(campaign.startDate);
        return (
          <View style={styles.centerCell}>
            <Text numberOfLines={1} style={styles.startDate}>
              {start.date}
            </Text>
            {start.time ? (
              <Text numberOfLines={1} style={styles.meta}>
                {start.time}
              </Text>
            ) : null}
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'marketplace',
      label: 'Selesai',
      render: campaign => {
        const end = formatKolamCampaignDateTimeParts(campaign.endDate);
        return (
          <View style={styles.centerCell}>
            <Text numberOfLines={1} style={styles.endDate}>
              {end.date}
            </Text>
            {end.time ? (
              <Text numberOfLines={1} style={styles.meta}>
                {end.time}
              </Text>
            ) : null}
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'notes',
      label: 'Durasi',
      render: campaign => (
        <Text numberOfLines={1} style={styles.centerText}>
          {formatKolamCampaignDurationLabel(campaign)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'amount',
      label: 'Diskon',
      render: campaign => (
        <Text numberOfLines={2} style={styles.centerText}>
          {formatKolamCampaignDiscountLabel(campaign)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'products',
      label: 'Produk',
      render: campaign => {
        const variantCount = countKolamCampaignVariants(campaign);
        return (
          <View style={styles.centerCell}>
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
        );
      },
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'meta',
      label: 'Dibuat',
      render: campaign => (
        <Text numberOfLines={1} style={styles.centerMeta}>
          {formatKolamCampaignCreatedAt(campaign.createdAt)}
        </Text>
      ),
    },
  ];
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
  },
  statusFilter: {
    flexGrow: 0,
    flexShrink: 0,
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
  centerCell: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  cellPressable: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
  },
  centerText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
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
  centerMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
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
