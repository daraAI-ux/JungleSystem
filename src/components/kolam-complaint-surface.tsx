import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getKolamComplaintCategoryLabel,
  getKolamComplaintDecisionBadgeIntent,
  getKolamComplaintDecisionLabel,
  getKolamComplaintHistoryActionLabel,
  getKolamComplaintPriorityLabel,
  getKolamComplaintSourceLabel,
  getKolamComplaintStatusBadgeIntent,
  getKolamComplaintStatusLabel,
  KOLAM_COMPLAINT_DECISION_OPTIONS,
  KOLAM_COMPLAINT_ROOT,
  KOLAM_COMPLAINT_SOURCE_OPTIONS,
  KOLAM_COMPLAINT_STATUS_OPTIONS,
  type KolamComplaint,
} from '../domain/kolam-complaint';
import { type KolamTableColumn } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import {
  useKolamComplaintController,
  type KolamComplaintController,
} from '../hooks/use-kolam-complaint-controller';
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
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import type { KolamPaginationState } from './kolam-pagination-footer-types';
import { KolamPaginationNav } from './kolam-pagination-nav';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';

function buildComplaintListPagination(
  page: number,
  pageSize: number,
  total: number,
): KolamPaginationState {
  const safeTotal = Math.max(0, total);
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    total: safeTotal,
    page: safePage,
    from: safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1,
    to: Math.min(safeTotal, safePage * safePageSize),
    hasPrevious: safePage > 1,
    hasNext: safePage < pageCount,
    pages: Array.from({ length: pageCount }, (_, index) => index + 1),
  };
}

const LIST_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Kode Tiket', align: 'left', width: 150 },
  { id: 'meta', label: 'Invoice', align: 'left', width: 140 },
  { id: 'children', label: 'Sumber', align: 'left', width: 110 },
  { id: 'products', label: 'Item', align: 'right', width: 64 },
  { id: 'status', label: 'Status', align: 'left', width: 120 },
  { id: 'notes', label: 'Keputusan', align: 'left', width: 130 },
  { id: 'marketplace', label: 'Staf', align: 'left', width: 120 },
  { id: 'amount', label: 'Dibuat', align: 'left', width: 110 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

function descRow(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
}

function Section({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          { id: 'title', text: title, style: styles.sectionTitle },
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.sectionDescription,
                },
              ]
            : []),
        ]}
      />
      <KolamContentFrame variant="nativeFormControls">{children}</KolamContentFrame>
    </KolamContentFrame>
  );
}

export function KolamComplaintSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamComplaintController(route);

  return (
    <KolamComplaintShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamComplaintList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'new' ? (
        <KolamComplaintCreatePlaceholder onRouteChange={onRouteChange} />
      ) : (
        <KolamComplaintDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </KolamComplaintShell>
  );
}

function KolamComplaintShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
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
        {children}
      </View>
    );
  }

  const contextLabel =
    controller.mode === 'new'
      ? 'Komplain baru'
      : controller.selectedComplaint?.ticketCode || 'Detail komplain';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {contextLabel}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_COMPLAINT_ROOT);
              }}
            />
          </View>
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamComplaintCreatePlaceholder({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.placeholder}>
      <KolamEmptyState
        message="Form buat komplain akan hadir di batch berikutnya. Sementara buka daftar untuk melihat tiket existing."
        title="Buat komplain (segera)"
      />
      <KolamButton
        intent="primary"
        label="Kembali ke daftar"
        onPress={() => onRouteChange?.(KOLAM_COMPLAINT_ROOT)}
      />
    </View>
  );
}

function KolamComplaintList({
  controller,
  onRouteChange,
}: {
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);

  const columns = React.useMemo(() => {
    if (tableBodyWidth <= 0) {
      return LIST_COLUMNS;
    }
    const flexible = LIST_COLUMNS.filter(column => column.id !== 'actions');
    const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
    const gapTotal = KOLAM_DATA_TABLE_COLUMN_GAP * (LIST_COLUMNS.length - 1);
    const available = Math.max(
      420,
      tableBodyWidth - actionsWidth - gapTotal,
    );
    const baseWidth = flexible.reduce(
      (sum, column) => sum + (column.width ?? 100),
      0,
    );
    const scale = available / Math.max(1, baseWidth);
    return [
      ...flexible.map(column => ({
        ...column,
        width: Math.max(56, Math.round((column.width ?? 100) * scale)),
      })),
      { ...LIST_COLUMNS[LIST_COLUMNS.length - 1], width: actionsWidth },
    ];
  }, [tableBodyWidth]);

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={controller.onSearchChange}
              placeholder="Cari tiket, invoice, pelanggan…"
              value={controller.search}
            />
            <KolamDropdownSelect
              label="Sumber"
              onChange={value =>
                controller.onSetSourceFilter(
                  value as typeof controller.sourceFilter,
                )
              }
              options={[
                { label: 'Sumber', value: 'all' },
                ...KOLAM_COMPLAINT_SOURCE_OPTIONS.filter(
                  option => option.id !== 'all',
                ).map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              value={controller.sourceFilter}
            />
            <KolamDropdownSelect
              label="Status"
              onChange={value =>
                controller.onSetStatusFilter(
                  value as typeof controller.statusFilter,
                )
              }
              options={[
                { label: 'Status', value: 'all' },
                ...KOLAM_COMPLAINT_STATUS_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              value={controller.statusFilter}
            />
            <KolamDropdownSelect
              label="Keputusan"
              onChange={value =>
                controller.onSetDecisionFilter(
                  value as typeof controller.decisionFilter,
                )
              }
              options={[
                { label: 'Keputusan', value: 'all' },
                ...KOLAM_COMPLAINT_DECISION_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              value={controller.decisionFilter}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <View style={styles.switchInline}>
              <Text style={styles.metaText}>Proyek khusus</Text>
              <KolamSwitch
                active={controller.customProjectOnly}
                onPress={() =>
                  controller.onSetCustomProjectOnly(!controller.customProjectOnly)
                }
              />
            </View>
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/create`);
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
            <KolamPaginationNav
              onPageChange={controller.onSetPage}
              pagination={buildComplaintListPagination(
                controller.page,
                controller.pageSize,
                controller.total,
              )}
            />
          </KolamTableFooterControls>
        }
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={columns} />
        {!controller.loading && controller.complaints.length === 0 ? (
          <KolamEmptyState
            message="Belum ada tiket komplain, atau filter tidak menemukan hasil."
            title="Komplain kosong"
          />
        ) : null}
        {controller.complaints.map(complaint => (
          <KolamComplaintRow
            columns={columns}
            complaint={complaint}
            key={complaint.id}
            onSelect={() => {
              void controller.onSelectComplaint(complaint).then(() => {
                onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/${complaint.id}`);
              });
            }}
          />
        ))}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamComplaintRow({
  columns,
  complaint,
  onSelect,
}: {
  columns: KolamTableColumn[];
  complaint: KolamComplaint;
  onSelect: () => void;
}) {
  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onSelect}
          style={getKolamDataTableColumnStyle(columns[0])}
        >
          <Text numberOfLines={1} style={styles.primaryText}>
            {complaint.ticketCode}
          </Text>
          {complaint.marketplaceSource ? (
            <Text numberOfLines={1} style={styles.metaText}>
              Mirror {complaint.marketplaceSource}
            </Text>
          ) : null}
        </Pressable>
        <View style={getKolamDataTableColumnStyle(columns[1])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {complaint.invoiceCode}
          </Text>
          {complaint.isCustomProject ? (
            <KolamStatusBadge intent="info" label="Proyek khusus" />
          ) : null}
        </View>
        <View style={getKolamDataTableColumnStyle(columns[2])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {getKolamComplaintSourceLabel(complaint.source)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[3])}>
          <Text style={styles.cellText}>{complaint.itemCount}</Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[4])}>
          <KolamStatusBadge
            intent={getKolamComplaintStatusBadgeIntent(complaint.status)}
            label={getKolamComplaintStatusLabel(complaint.status)}
          />
        </View>
        <View style={getKolamDataTableColumnStyle(columns[5])}>
          <KolamStatusBadge
            intent={getKolamComplaintDecisionBadgeIntent(complaint.decision)}
            label={getKolamComplaintDecisionLabel(complaint.decision)}
          />
        </View>
        <View style={getKolamDataTableColumnStyle(columns[6])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {complaint.assignedStaffName}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[7])}>
          <Text numberOfLines={1} style={styles.metaText}>
            {formatListDate(complaint.createdAt)}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${complaint.ticketCode}`}
          actions={[{ label: 'Lihat', onPress: onSelect }]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamComplaintDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  const complaint = controller.selectedComplaint;

  if (!complaint) {
    return (
      <KolamEmptyState
        message="Tiket komplain tidak ditemukan."
        title="Tidak ada data"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      {complaint.marketplaceReadOnly ? (
        <KolamStatusBadge
          intent="warning"
          label={`Mirror marketplace ${complaint.marketplaceSource} — hanya baca di Kolam.`}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <View style={styles.stripRow}>
        <KolamStatusBadge
          intent={getKolamComplaintStatusBadgeIntent(complaint.status)}
          label={getKolamComplaintStatusLabel(complaint.status)}
        />
        <KolamStatusBadge
          intent={getKolamComplaintDecisionBadgeIntent(complaint.decision)}
          label={getKolamComplaintDecisionLabel(complaint.decision)}
        />
        {complaint.isCustomProject ? (
          <KolamStatusBadge intent="info" label="Proyek khusus" />
        ) : null}
        {complaint.isServiceOnly ? (
          <KolamStatusBadge intent="secondary" label="Khusus layanan" />
        ) : null}
      </View>

      <Section title="Ringkasan">
        <KolamDescriptionList
          accessibilityLabel="Ringkasan komplain"
          rows={[
            descRow('ticket', 'Kode tiket', complaint.ticketCode),
            descRow('invoice', 'Invoice', complaint.invoiceCode),
            descRow('customer', 'Pelanggan', complaint.customerName),
            descRow(
              'source',
              'Sumber',
              getKolamComplaintSourceLabel(complaint.source),
            ),
            descRow(
              'priority',
              'Prioritas',
              getKolamComplaintPriorityLabel(complaint.priority),
            ),
            descRow(
              'category',
              'Kategori',
              getKolamComplaintCategoryLabel(complaint.category),
            ),
            descRow('staff', 'Staf ditugaskan', complaint.assignedStaffName),
            descRow(
              'refund',
              'Nilai refund',
              complaint.refundAmount > 0
                ? formatRupiah(complaint.refundAmount)
                : '—',
            ),
            descRow('createdBy', 'Dibuat oleh', complaint.createdByName),
            descRow('createdAt', 'Dibuat', formatListDate(complaint.createdAt)),
          ]}
        />
        {complaint.saleId ? (
          <View style={styles.detailActions}>
            <KolamButton
              label="Lihat invoice"
              onPress={() => onRouteChange?.(`/sales/${complaint.saleId}`)}
            />
          </View>
        ) : null}
      </Section>

      <Section description={complaint.description || '—'} title="Deskripsi">
        <View />
      </Section>

      <Section title="Item komplain">
        {complaint.items.length === 0 ? (
          <Text style={styles.metaText}>Tidak ada item.</Text>
        ) : (
          complaint.items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.primaryText}>{item.name}</Text>
              <Text style={styles.metaText}>
                Qty {item.quantity}
                {item.reason ? ` · ${item.reason}` : ''}
              </Text>
            </View>
          ))
        )}
      </Section>

      {complaint.photos.length ? (
        <Section title="Bukti foto">
          <View style={styles.photoRow}>
            {complaint.photos.map(photo =>
              photo.uri ? (
                <KolamRemoteImage
                  accessibilityLabel="Bukti komplain"
                  key={photo.id}
                  resizeMode="cover"
                  sourceUri={photo.uri}
                  style={styles.photo}
                />
              ) : null,
            )}
          </View>
        </Section>
      ) : null}

      {complaint.returnTracking ? (
        <Section title="Pelacakan retur">
          <KolamDescriptionList
            accessibilityLabel="Retur"
            rows={[
              descRow(
                'ret-status',
                'Status',
                complaint.returnTracking.status,
              ),
              descRow(
                'ret-track',
                'Resi',
                complaint.returnTracking.trackingNumber || '—',
              ),
              descRow(
                'ret-courier',
                'Kurir',
                complaint.returnTracking.courierName || '—',
              ),
            ]}
          />
        </Section>
      ) : null}

      <Section title="Riwayat">
        {complaint.histories.length === 0 ? (
          <Text style={styles.metaText}>Belum ada riwayat.</Text>
        ) : (
          complaint.histories.map(history => (
            <View key={history.id} style={styles.historyCard}>
              <Text style={styles.primaryText}>
                {getKolamComplaintHistoryActionLabel(history.action)}
              </Text>
              <Text style={styles.metaText}>{history.note || '—'}</Text>
              <Text style={styles.metaText}>
                {history.changedByLabel} · {formatListDate(history.changedAt)}
              </Text>
            </View>
          ))
        )}
      </Section>

      <KolamStatusBadge
        intent="secondary"
        label="Aksi workflow (assign/status/keputusan/retur) menyusul di batch berikutnya."
        numberOfLines={2}
        style={styles.banner}
      />
    </ScrollView>
  );
}

function formatListDate(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  stack: {
    flex: 1,
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 420,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  switchInline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  detailContent: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 8,
  },
  stripRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  banner: {
    alignSelf: 'stretch',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  itemCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photo: {
    borderRadius: 8,
    height: 88,
    width: 88,
  },
  historyCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  placeholder: {
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
});
