import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamProyekLifecycleLabel,
  getKolamProyekLifecycleIntent,
  getKolamProyekSectionVisibility,
  KOLAM_PROYEK_LIFECYCLE_FILTER_OPTIONS,
  type KolamProyekLifecycleStatus,
  type KolamProyekListItem,
} from '../domain/kolam-proyek';
import {
  fitKolamDataTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import {
  useKolamProyekController,
  type KolamProyekController,
} from '../hooks/use-kolam-proyek-controller';
import { KolamButton } from './kolam-button';
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
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const LIST_COLUMNS_BASE: KolamTableColumn[] = [
  { id: 'primary', label: 'Penawaran', align: 'left', width: 160 },
  { id: 'meta', label: 'Pelanggan', align: 'left', width: 160 },
  { id: 'status', label: 'Status', align: 'left', width: 130 },
  { id: 'notes', label: 'Progress', align: 'left', width: 80 },
  { id: 'amount', label: 'Nilai kontrak', align: 'right', width: 120 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

function fitProyekListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(LIST_COLUMNS_BASE, containerWidth, {
    actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
    primaryMinWidth: 140,
    secondaryMinWidth: 56,
  });
}

export function KolamProyekSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamProyekController(route, onRouteChange);

  if (controller.mode === 'list') {
    return <KolamProyekList controller={controller} />;
  }

  if (controller.mode === 'new' || controller.mode === 'edit') {
    return (
      <KolamProyekPlaceholder
        controller={controller}
        message={
          controller.mode === 'new'
            ? 'Form surat penawaran akan tersedia di batch berikutnya (P2).'
            : 'Edit surat penawaran akan tersedia di batch berikutnya (P2).'
        }
        title={controller.mode === 'new' ? 'Proyek baru' : 'Edit proyek'}
      />
    );
  }

  return <KolamProyekDetailSummary controller={controller} />;
}

function KolamProyekList({
  controller,
}: {
  controller: KolamProyekController;
}) {
  const [tableBodyWidth, setTableBodyWidth] = useState(0);
  const columns = useMemo(
    () => fitProyekListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const actionsWidth = Math.max(
    columns.find(column => column.id === 'actions')?.width ??
      KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  );

  const filterLabel =
    KOLAM_PROYEK_LIFECYCLE_FILTER_OPTIONS.find(
      option => option.value === controller.lifecycleFilter,
    )?.label ?? 'Semua status';

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

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamDropdownSelect
              label={filterLabel}
              onChange={value =>
                controller.onSetLifecycleFilter(
                  value as '' | KolamProyekLifecycleStatus,
                )
              }
              options={KOLAM_PROYEK_LIFECYCLE_FILTER_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              showLabelInTrigger={false}
              style={styles.statusFilter}
              value={controller.lifecycleFilter}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="outline"
              label="Muat ulang"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Baru"
              onPress={() => {
                controller.onCreateNew();
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
                  intent="outline"
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
                  intent="outline"
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
        {controller.loading && controller.items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState message="Memuat daftar proyek…" title="Memuat" />
          </View>
        ) : null}
        {!controller.loading && controller.items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              message="Belum ada proyek kustom."
              title="Kosong"
            />
          </View>
        ) : null}
        {controller.items.map(item => (
          <ProyekListRow
            actionsWidth={actionsWidth}
            columns={columns}
            item={item}
            key={item.id}
            onOpen={() => controller.onOpenItem(item)}
          />
        ))}
      </KolamCatalogListTableShell>
    </View>
  );
}

function ProyekListRow({
  actionsWidth,
  columns,
  item,
  onOpen,
}: {
  actionsWidth: number;
  columns: KolamTableColumn[];
  item: KolamProyekListItem;
  onOpen: () => void;
}) {
  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={styles.rowPress}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.cellPrimary,
              getKolamDataTableColumnStyle(columns, 'primary'),
            ]}
          >
            {item.quotationNumber || item.id}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.cellMeta,
              getKolamDataTableColumnStyle(columns, 'meta'),
            ]}
          >
            {item.clientName}
          </Text>
          <View style={getKolamDataTableColumnStyle(columns, 'status')}>
            <KolamStatusBadge
              intent={getKolamProyekLifecycleIntent(item.lifecycleStatus)}
              label={formatKolamProyekLifecycleLabel(item.lifecycleStatus)}
            />
          </View>
          <Text
            numberOfLines={1}
            style={[
              styles.cellMeta,
              getKolamDataTableColumnStyle(columns, 'notes'),
            ]}
          >
            {Math.round(item.progressPercent)}%
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.cellAmount,
              getKolamDataTableColumnStyle(columns, 'amount'),
            ]}
          >
            {formatRupiah(item.contractValue || item.dealAmount)}
          </Text>
        </Pressable>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack width={actionsWidth}>
        <KolamButton intent="outline" label="Buka" onPress={onOpen} size="sm" />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamProyekDetailSummary({
  controller,
}: {
  controller: KolamProyekController;
}) {
  const detail = controller.selected;

  if (controller.loading && !detail) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="Memuat detail proyek…" title="Memuat" />
      </View>
    );
  }

  if (!detail) {
    return (
      <KolamProyekPlaceholder
        controller={controller}
        message={controller.error || 'Proyek tidak ditemukan.'}
        title="Tidak ditemukan"
      />
    );
  }

  const quotationVisible =
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'quotationActions') !==
    'hidden';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.toolbarTitle}>
              {detail.quotationNumber || detail.id}
            </Text>
            <KolamStatusBadge
              intent={getKolamProyekLifecycleIntent(detail.lifecycleStatus)}
              label={formatKolamProyekLifecycleLabel(detail.lifecycleStatus)}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="outline"
              label="Muat ulang"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="outline"
              label="Kembali ke daftar"
              onPress={controller.onBackToList}
            />
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.detailContent}>
        <Text style={styles.sectionTitle}>Ringkasan</Text>
        <Text style={styles.metaText}>Pelanggan: {detail.clientName}</Text>
        <Text style={styles.metaText}>PIC: {detail.designerName}</Text>
        <Text style={styles.metaText}>
          Progress: {Math.round(detail.progressPercent)}%
        </Text>
        <Text style={styles.metaText}>
          Nilai kontrak: {formatRupiah(detail.contractValue || detail.dealAmount)}
        </Text>
        <Text style={styles.metaText}>Item penawaran: {detail.itemCount}</Text>
        {detail.saleInvoiceCode ? (
          <Text style={styles.metaText}>
            Penjualan: {detail.saleInvoiceCode}
          </Text>
        ) : null}
        {detail.linkedTaskId ? (
          <Text style={styles.metaText}>
            Tugas: {detail.linkedTaskId}
          </Text>
        ) : null}
        {quotationVisible ? (
          <Text style={styles.hintText}>
            Panel aksi penawaran, DP, desain, dan close akan dilanjutkan di
            batch P1–P4.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function KolamProyekPlaceholder({
  controller,
  message,
  title,
}: {
  controller: KolamProyekController;
  message: string;
  title: string;
}) {
  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text style={styles.toolbarTitle}>{title}</Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="outline"
              label="Kembali ke daftar"
              onPress={controller.onBackToList}
            />
          </View>
        </View>
      </View>
      <KolamEmptyState message={message} title={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  banner: {
    alignSelf: 'stretch',
  },
  statusFilter: {
    minWidth: 160,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  rowPress: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    minWidth: 0,
  },
  cellPrimary: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  cellMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  cellAmount: {
    color: V.colors.fg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  toolbarTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
  },
  detailContent: {
    gap: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 18,
  },
  hintText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    marginTop: 12,
  },
});
