import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  canCloseKolamComplaint,
  canSetKolamComplaintDecision,
  canUpdateKolamComplaintStatus,
  getAllowedKolamComplaintStatuses,
  getAllowedKolamComplaintTrackingStatuses,
  getAvailableKolamComplaintDecisions,
  getKolamComplaintCategoryLabel,
  getKolamComplaintDecisionBadgeIntent,
  getKolamComplaintDecisionLabel,
  getKolamComplaintHistoryActionLabel,
  getKolamComplaintPriorityLabel,
  getKolamComplaintSourceLabel,
  getKolamComplaintStatusBadgeIntent,
  getKolamComplaintStatusLabel,
  getKolamComplaintTrackingStatusLabel,
  isWarrantyClaimComplaint,
  KOLAM_COMPLAINT_DECISION_OPTIONS,
  KOLAM_COMPLAINT_KPI_OPTIONS,
  KOLAM_COMPLAINT_ROOT,
  KOLAM_COMPLAINT_SOURCE_OPTIONS,
  KOLAM_COMPLAINT_STATUS_OPTIONS,
  needsKolamComplaintReturnTracking,
  resolveKolamComplaintSaleSourceLogoUri,
  type KolamComplaint,
  type KolamComplaintDecision,
  type KolamComplaintKpiSeverity,
  type KolamComplaintStatus,
  type KolamComplaintTrackingStatus,
} from '../domain/kolam-complaint';
import { type KolamTableColumn } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import {
  useKolamComplaintController,
  type KolamComplaintController,
} from '../hooks/use-kolam-complaint-controller';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamComplaintCreateForm } from './kolam-complaint-create-form';
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
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
        <KolamComplaintCreateForm
          controller={controller}
          onRouteChange={onRouteChange}
          route={route}
        />
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
  const saleId = controller.selectedComplaint?.saleId;

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
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_COMPLAINT_ROOT);
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            {saleId ? (
              <KolamButton
                label="Lihat invoice"
                onPress={() => onRouteChange?.(`/sales/${saleId}`)}
                style={styles.toolbarButton}
              />
            ) : null}
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
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
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

  const itemCount = complaint.itemCount || complaint.items.length;
  const sourceLogoUri = resolveKolamComplaintSaleSourceLogoUri(
    complaint,
    controller.saleSources,
  );

  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      style={styles.detailRoot}
    >
      {complaint.marketplaceReadOnly ? (
        <KolamStatusBadge
          intent="warning"
          label={`Mirror marketplace ${complaint.marketplaceSource} — hanya baca di Kolam.`}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <KolamCardFrame style={styles.stripCard} variant="compact">
        <View style={styles.stripRow}>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Status</Text>
            <KolamStatusBadge
              intent={getKolamComplaintStatusBadgeIntent(complaint.status)}
              label={getKolamComplaintStatusLabel(complaint.status)}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Keputusan</Text>
            <KolamStatusBadge
              intent={getKolamComplaintDecisionBadgeIntent(complaint.decision)}
              label={getKolamComplaintDecisionLabel(complaint.decision)}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Prioritas</Text>
            <Text style={styles.stripValue}>
              {getKolamComplaintPriorityLabel(complaint.priority)}
            </Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Items</Text>
            <Text style={styles.stripValue}>{itemCount}</Text>
          </View>
          {complaint.refundAmount > 0 ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Refund</Text>
              <Text style={styles.stripValue}>
                {formatRupiah(complaint.refundAmount)}
              </Text>
            </View>
          ) : null}
          {complaint.isCustomProject ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Flag</Text>
              <KolamStatusBadge intent="info" label="Proyek khusus" />
            </View>
          ) : null}
          {complaint.isServiceOnly ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Layanan</Text>
              <KolamStatusBadge intent="secondary" label="Khusus layanan" />
            </View>
          ) : null}
          {sourceLogoUri ? (
            <View style={styles.stripSourceSlot}>
              <KolamRemoteImage
                accessibilityLabel={
                  complaint.saleSourceRef?.name || 'Sumber penjualan'
                }
                resizeMode="contain"
                sourceUri={sourceLogoUri}
                style={styles.stripSourceLogo}
              />
            </View>
          ) : null}
        </View>
      </KolamCardFrame>

      <View style={styles.columns}>
        <View style={styles.columnMain}>
          <Text style={styles.sectionTitle}>Informasi Komplain</Text>
          <KolamDescriptionList
            accessibilityLabel="Informasi komplain"
            rows={[
              descRow('invoice', 'Invoice', complaint.invoiceCode || '—'),
              descRow('customer', 'Pelanggan', complaint.customerName || '—'),
              descRow(
                'source',
                'Sumber komplain',
                getKolamComplaintSourceLabel(complaint.source),
              ),
              descRow(
                'saleSource',
                'Sumber penjualan',
                complaint.saleSourceRef?.name || '—',
              ),
              descRow(
                'category',
                'Kategori',
                getKolamComplaintCategoryLabel(complaint.category),
              ),
              descRow(
                'staff',
                'Staf ditugaskan',
                complaint.assignedStaffName || '—',
              ),
              descRow(
                'createdBy',
                'Dibuat oleh',
                complaint.createdByName || '—',
              ),
              descRow('createdAt', 'Dibuat', formatListDate(complaint.createdAt)),
              descRow(
                'description',
                'Deskripsi',
                complaint.description || '—',
              ),
            ]}
          />

          <Text style={styles.sectionTitle}>Item komplain</Text>
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

          {complaint.photos.length ? (
            <>
              <Text style={styles.sectionTitle}>Bukti foto</Text>
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
            </>
          ) : null}

          {complaint.returnTracking || needsKolamComplaintReturnTracking(complaint) ? (
            <>
              <Text style={styles.sectionTitle}>Pelacakan retur</Text>
              <KolamDescriptionList
                accessibilityLabel="Retur"
                rows={[
                  descRow(
                    'ret-status',
                    'Status',
                    getKolamComplaintTrackingStatusLabel(
                      complaint.returnTracking?.status || 'pending',
                    ),
                  ),
                  descRow(
                    'ret-track',
                    'Resi',
                    complaint.returnTracking?.trackingNumber || '—',
                  ),
                  descRow(
                    'ret-courier',
                    'Kurir',
                    complaint.returnTracking?.courierName || '—',
                  ),
                ]}
              />
            </>
          ) : null}

          {complaint.replacementTracking ? (
            <>
              <Text style={styles.sectionTitle}>Pelacakan penggantian</Text>
              <KolamDescriptionList
                accessibilityLabel="Penggantian"
                rows={[
                  descRow(
                    'rep-status',
                    'Status',
                    getKolamComplaintTrackingStatusLabel(
                      complaint.replacementTracking.status,
                    ),
                  ),
                  descRow(
                    'rep-track',
                    'Resi',
                    complaint.replacementTracking.trackingNumber || '—',
                  ),
                  descRow(
                    'rep-courier',
                    'Kurir',
                    complaint.replacementTracking.courierName || '—',
                  ),
                ]}
              />
            </>
          ) : null}

          {complaint.replacementReturnTracking ? (
            <>
              <Text style={styles.sectionTitle}>Retur barang pengganti</Text>
              <KolamDescriptionList
                accessibilityLabel="Retur pengganti"
                rows={[
                  descRow(
                    'repr-status',
                    'Status',
                    getKolamComplaintTrackingStatusLabel(
                      complaint.replacementReturnTracking.status,
                    ),
                  ),
                  descRow(
                    'repr-track',
                    'Resi',
                    complaint.replacementReturnTracking.trackingNumber || '—',
                  ),
                  descRow(
                    'repr-courier',
                    'Kurir',
                    complaint.replacementReturnTracking.courierName || '—',
                  ),
                ]}
              />
            </>
          ) : null}

          {!complaint.marketplaceReadOnly ? (
            <KolamComplaintWorkflowPanel controller={controller} complaint={complaint} />
          ) : (
            <KolamStatusBadge
              intent="secondary"
              label="Aksi staf disembunyikan untuk mirror marketplace."
              numberOfLines={2}
              style={styles.banner}
            />
          )}
        </View>

        <View style={styles.columnSide}>
          <Text style={styles.sectionTitle}>Riwayat</Text>
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
        </View>
      </View>
    </ScrollView>
  );
}

function KolamComplaintWorkflowPanel({
  complaint,
  controller,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
}) {
  const allowedStatuses = getAllowedKolamComplaintStatuses(complaint.status);
  const decisionOptions = getAvailableKolamComplaintDecisions(
    complaint.isServiceOnly,
    { isWarrantyClaim: isWarrantyClaimComplaint(complaint) },
  );
  const returnStatus =
    complaint.returnTracking?.status || ('pending' as KolamComplaintTrackingStatus);
  const allowedReturnStatuses = getAllowedKolamComplaintTrackingStatuses(returnStatus);

  const [staffId, setStaffId] = React.useState(complaint.assignedStaffId || '');
  const [assignNote, setAssignNote] = React.useState('');
  const [nextStatus, setNextStatus] = React.useState<KolamComplaintStatus>(
    allowedStatuses[0] || complaint.status,
  );
  const [statusNote, setStatusNote] = React.useState('');
  const [decision, setDecision] = React.useState<NonNullable<KolamComplaintDecision> | ''>(
    complaint.decision || decisionOptions[0]?.id || '',
  );
  const [refundAmount, setRefundAmount] = React.useState(
    complaint.refundAmount > 0 ? String(complaint.refundAmount) : '',
  );
  const [decisionNote, setDecisionNote] = React.useState('');
  const [closeNote, setCloseNote] = React.useState('');
  const [kpiSeverity, setKpiSeverity] = React.useState<
    KolamComplaintKpiSeverity | 'none'
  >('none');
  const [returnNextStatus, setReturnNextStatus] =
    React.useState<KolamComplaintTrackingStatus>(
      allowedReturnStatuses[0] || returnStatus,
    );
  const [returnNote, setReturnNote] = React.useState('');
  const [returnVerifiedNote, setReturnVerifiedNote] = React.useState('');
  const [trackingNumber, setTrackingNumber] = React.useState(
    complaint.returnTracking?.trackingNumber || '',
  );
  const [courierName, setCourierName] = React.useState(
    complaint.returnTracking?.courierName || '',
  );

  React.useEffect(() => {
    const nextAllowed = getAllowedKolamComplaintStatuses(complaint.status);
    const nextDecisions = getAvailableKolamComplaintDecisions(
      complaint.isServiceOnly,
      { isWarrantyClaim: isWarrantyClaimComplaint(complaint) },
    );
    const nextReturnStatus =
      complaint.returnTracking?.status ||
      ('pending' as KolamComplaintTrackingStatus);
    const nextAllowedReturn =
      getAllowedKolamComplaintTrackingStatuses(nextReturnStatus);

    setStaffId(complaint.assignedStaffId || '');
    setNextStatus(nextAllowed[0] || complaint.status);
    setDecision(complaint.decision || nextDecisions[0]?.id || '');
    setRefundAmount(
      complaint.refundAmount > 0 ? String(complaint.refundAmount) : '',
    );
    setReturnNextStatus(nextAllowedReturn[0] || nextReturnStatus);
    setTrackingNumber(complaint.returnTracking?.trackingNumber || '');
    setCourierName(complaint.returnTracking?.courierName || '');
  }, [
    complaint.assignedStaffId,
    complaint.decision,
    complaint.id,
    complaint.isServiceOnly,
    complaint.refundAmount,
    complaint.returnTracking?.courierName,
    complaint.returnTracking?.status,
    complaint.returnTracking?.trackingNumber,
    complaint.source,
    complaint.status,
  ]);

  const busy = controller.mutating || controller.loading;
  const needsRefundAmount =
    decision === 'refund' || decision === 'return_then_refund';

  return (
    <View style={styles.workflowPanel}>
      <Text style={styles.sectionTitle}>Aksi workflow</Text>

      <View style={styles.workflowBlock}>
        <Text style={styles.workflowBlockTitle}>Tugaskan staf</Text>
        <KolamDropdownSelect
          accessibilityLabel="Pilih staf"
          label="Staf"
          menuPlacement="inline"
          onChange={setStaffId}
          options={[
            { label: 'Pilih staf…', value: '' },
            ...controller.staffOptions.map(option => ({
              label: option.label,
              value: option.id,
            })),
          ]}
          searchable={controller.staffOptions.length > 8}
          searchPlaceholder="Cari staf…"
          showLabelInTrigger={false}
          value={staffId}
        />
        <KolamFormTextField
          multiline
          numberOfLines={2}
          onChangeText={setAssignNote}
          placeholder="Catatan penugasan (opsional)"
          style={styles.workflowNote}
          value={assignNote}
        />
        <KolamButton
          disabled={busy || !staffId}
          intent="primary"
          label={busy ? 'Menyimpan…' : 'Simpan penugasan'}
          onPress={() => {
            void controller.onAssignStaff(staffId, assignNote).then(ok => {
              if (ok) {
                setAssignNote('');
              }
            });
          }}
        />
      </View>

      <View style={styles.workflowBlock}>
        <Text style={styles.workflowBlockTitle}>Ubah status</Text>
        {!complaint.assignedStaffId ? (
          <Text style={styles.metaText}>
            Tugaskan staf dulu sebelum mengubah status.
          </Text>
        ) : null}
        <KolamDropdownSelect
          accessibilityLabel="Status baru"
          label="Status"
          menuPlacement="inline"
          onChange={value => setNextStatus(value as KolamComplaintStatus)}
          options={allowedStatuses.map(status => ({
            label: getKolamComplaintStatusLabel(status),
            value: status,
          }))}
          showLabelInTrigger={false}
          value={nextStatus}
        />
        <KolamFormTextField
          multiline
          numberOfLines={3}
          onChangeText={setStatusNote}
          placeholder="Catatan wajib…"
          style={styles.workflowNote}
          value={statusNote}
        />
        <KolamButton
          disabled={
            busy ||
            !canUpdateKolamComplaintStatus(complaint) ||
            !statusNote.trim() ||
            !allowedStatuses.includes(nextStatus)
          }
          intent="primary"
          label={busy ? 'Menyimpan…' : 'Update status'}
          onPress={() => {
            void controller.onUpdateStatus(nextStatus, statusNote).then(ok => {
              if (ok) {
                setStatusNote('');
              }
            });
          }}
        />
      </View>

      {canSetKolamComplaintDecision(complaint) ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>
            {complaint.decision ? 'Ubah keputusan' : 'Set keputusan'}
          </Text>
          <KolamDropdownSelect
            accessibilityLabel="Keputusan"
            label="Keputusan"
            menuPlacement="inline"
            onChange={value =>
              setDecision(value as NonNullable<KolamComplaintDecision>)
            }
            options={decisionOptions.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={decision}
          />
          {needsRefundAmount ? (
            <KolamFormTextField
              mode="numeric"
              onChangeText={setRefundAmount}
              placeholder="Jumlah refund (Rp)"
              value={refundAmount}
            />
          ) : null}
          <KolamFormTextField
            multiline
            numberOfLines={3}
            onChangeText={setDecisionNote}
            placeholder="Catatan wajib…"
            style={styles.workflowNote}
            value={decisionNote}
          />
          <KolamButton
            disabled={
              busy ||
              !decision ||
              !decisionNote.trim() ||
              (needsRefundAmount && !refundAmount.trim())
            }
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Simpan keputusan'}
            onPress={() => {
              if (!decision) {
                return;
              }
              void controller
                .onUpdateDecision({
                  decision,
                  note: decisionNote,
                  ...(needsRefundAmount
                    ? { refundAmount: Math.max(0, Number(refundAmount) || 0) }
                    : {}),
                })
                .then(ok => {
                  if (ok) {
                    setDecisionNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}

      {needsKolamComplaintReturnTracking(complaint) &&
      allowedReturnStatuses.length > 0 ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Update retur</Text>
          <KolamDropdownSelect
            accessibilityLabel="Status retur"
            label="Status retur"
            menuPlacement="inline"
            onChange={value =>
              setReturnNextStatus(value as KolamComplaintTrackingStatus)
            }
            options={allowedReturnStatuses.map(status => ({
              label: getKolamComplaintTrackingStatusLabel(status),
              value: status,
            }))}
            showLabelInTrigger={false}
            value={returnNextStatus}
          />
          <KolamFormTextField
            onChangeText={setTrackingNumber}
            placeholder="Nomor resi"
            value={trackingNumber}
          />
          <KolamFormTextField
            onChangeText={setCourierName}
            placeholder="Nama kurir"
            value={courierName}
          />
          {returnNextStatus === 'verified' ? (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReturnVerifiedNote}
              placeholder="Catatan verifikasi wajib…"
              style={styles.workflowNote}
              value={returnVerifiedNote}
            />
          ) : (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReturnNote}
              placeholder="Catatan…"
              style={styles.workflowNote}
              value={returnNote}
            />
          )}
          <KolamButton
            disabled={
              busy ||
              (returnNextStatus === 'verified'
                ? !returnVerifiedNote.trim()
                : false)
            }
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Update retur'}
            onPress={() => {
              void controller
                .onUpdateReturnStatus({
                  status: returnNextStatus,
                  trackingNumber,
                  courierName,
                  ...(returnNextStatus === 'verified'
                    ? { verifiedNote: returnVerifiedNote }
                    : { note: returnNote }),
                })
                .then(ok => {
                  if (ok) {
                    setReturnNote('');
                    setReturnVerifiedNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}

      {canCloseKolamComplaint(complaint) ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Tutup tiket</Text>
          <KolamFormTextField
            multiline
            numberOfLines={3}
            onChangeText={setCloseNote}
            placeholder="Catatan penutupan wajib…"
            style={styles.workflowNote}
            value={closeNote}
          />
          <KolamDropdownSelect
            accessibilityLabel="Penalti KPI"
            label="KPI"
            menuPlacement="inline"
            onChange={value =>
              setKpiSeverity(value as KolamComplaintKpiSeverity | 'none')
            }
            options={KOLAM_COMPLAINT_KPI_OPTIONS.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={kpiSeverity}
          />
          <KolamButton
            disabled={busy || closeNote.trim().length < 10}
            intent="danger"
            label={busy ? 'Menutup…' : 'Tutup tiket'}
            onPress={() => {
              void controller
                .onCloseComplaint({
                  note: closeNote,
                  kpiSeverity: kpiSeverity === 'none' ? null : kpiSeverity,
                })
                .then(ok => {
                  if (ok) {
                    setCloseNote('');
                    setKpiSeverity('none');
                  }
                });
            }}
          />
        </View>
      ) : null}
    </View>
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
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 420,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
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
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  switchInline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  detailRoot: {
    flexGrow: 0,
  },
  detailContent: {
    gap: 12,
    paddingBottom: 24,
  },
  stripCard: {
    overflow: 'hidden',
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 0,
  },
  stripRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    minHeight: 72,
  },
  stripItem: {
    gap: 4,
    justifyContent: 'center',
    minWidth: 120,
    paddingVertical: 12,
  },
  stripLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  stripValue: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  stripSourceSlot: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginLeft: 'auto',
    minHeight: 72,
    width: 88,
  },
  stripSourceLogo: {
    height: 72,
    width: 88,
  },
  banner: {
    alignSelf: 'stretch',
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  columnMain: {
    flex: 2,
    flexBasis: 420,
    gap: 10,
    minWidth: 280,
  },
  columnSide: {
    flex: 1,
    flexBasis: 280,
    gap: 10,
    minWidth: 240,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  workflowPanel: {
    gap: 12,
    marginTop: 8,
  },
  workflowBlock: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 12,
  },
  workflowBlockTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  workflowNote: {
    minHeight: 72,
    width: '100%',
  },
  itemCard: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
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
  placeholder: {
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
});
