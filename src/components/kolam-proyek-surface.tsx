import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  buildKolamProyekActivityEntries,
  computeKolamProyekCommissionPreview,
  computeKolamProyekOutstanding,
  formatKolamProyekComplaintWindowLabel,
  formatKolamProyekDpRowStatusLabel,
  formatKolamProyekItemTypeLabel,
  formatKolamProyekLifecycleLabel,
  formatKolamProyekLifecycleTransitionLabel,
  formatKolamProyekReviewDecisionLabel,
  getKolamProyekDpRowOutstanding,
  getKolamProyekDpRowStatusIntent,
  getKolamProyekHappyPathNext,
  getKolamProyekLifecycleIntent,
  getKolamProyekReviewDecisionIntent,
  getKolamProyekSectionVisibility,
  getKolamProyekStepperStageState,
  getLatestKolamProyekReviewSubmission,
  isKolamProyekImagePath,
  KOLAM_PROYEK_HAPPY_PATH,
  KOLAM_PROYEK_LIFECYCLE_FILTER_OPTIONS,
  resolveKolamProyekNextStepHero,
  type KolamProyekDetail,
  type KolamProyekHppMaterial,
  type KolamProyekLifecycleStatus,
  type KolamProyekListItem,
  type KolamProyekNextStepAction,
  type KolamProyekNextStepHero,
  type KolamProyekReviewFile,
  type KolamProyekReviewSubmission,
  type KolamProyekSubmitRoundInput,
} from '../domain/kolam-proyek';
import {
  fitKolamDataTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import {
  useKolamProyekController,
  type KolamProyekController,
} from '../hooks/use-kolam-proyek-controller';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { kolamDetailMetaStripStyles } from './kolam-detail-meta-strip';
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
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamFormTextField } from './kolam-form-text-field';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { openKolamImagePreview } from './kolam-image-preview-dialog';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamProyekQuotationForm } from './kolam-proyek-quotation-form';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import {
  pickNativeAssetFile,
  pickNativeImageFile,
} from '../services/native-file-picker';

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

  if (!controller.pluginEnabled) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Plugin Proyek dinonaktifkan di Settings. Aktifkan plugin untuk membuka modul ini."
          title="Plugin nonaktif"
        />
      </View>
    );
  }

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Tidak ada izin view custom-project untuk membuka modul Proyek."
          title="Akses ditolak"
        />
      </View>
    );
  }

  if (controller.mode === 'list') {
    return <KolamProyekList controller={controller} />;
  }

  if (controller.mode === 'new' || controller.mode === 'edit') {
    return <KolamProyekQuotationForm controller={controller} />;
  }

  return <KolamProyekDetailRead controller={controller} onRouteChange={onRouteChange} />;
}

function KolamProyekList({
  controller,
}: {
  controller: KolamProyekController;
}) {
  const [searchInput, setSearchInput] = useState(controller.search);
  const [tableBodyWidth, setTableBodyWidth] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const columns = useMemo(
    () => fitProyekListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const actionsWidth = Math.max(
    columns.find(column => column.id === 'actions')?.width ??
      KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  );

  useEffect(() => {
    setSearchInput(controller.search);
  }, [controller.search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

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
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari QUO / pelanggan"
              value={searchInput}
            />
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
              intent="outline"
              label="Export XLSX"
              onPress={() => setExportDialogOpen(true)}
            />
            {controller.canCreate ? (
              <KolamButton
                label="Baru"
                onPress={() => {
                  controller.onCreateNew();
                }}
              />
            ) : null}
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

      <KolamExportDialog
        catalogEndpoint="/custom-project/export/fields"
        defaultPresetKey="default"
        description="Pilih field yang ingin di-export ke XLSX. Filter pencarian dan status list saat ini akan diterapkan."
        downloadEndpoint="/custom-project/export.xlsx"
        downloadParams={{
          search: controller.search.trim() || undefined,
          lifecycle: controller.lifecycleFilter || undefined,
        }}
        filenameHint="custom_project"
        onOpenChange={setExportDialogOpen}
        storageKey="export.custom-project.v1"
        title="Export Proyek"
        visible={exportDialogOpen}
      />
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
  const columnOf = (id: string) => columns.find(column => column.id === id);
  const primaryColumn = columnOf('primary');
  const metaColumn = columnOf('meta');
  const statusColumn = columnOf('status');
  const notesColumn = columnOf('notes');
  const amountColumn = columnOf('amount');
  const label = item.quotationNumber || item.id;

  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={[
            styles.listCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellPrimary}>
            {label}
          </Text>
        </Pressable>
        <View
          style={[
            styles.listCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellMeta}>
            {item.clientName || '—'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getKolamProyekLifecycleIntent(item.lifecycleStatus)}
            label={formatKolamProyekLifecycleLabel(item.lifecycleStatus)}
          />
        </View>
        <View
          style={[
            styles.listCell,
            notesColumn ? getKolamDataTableColumnStyle(notesColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellMeta}>
            {Math.round(item.progressPercent)}%
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            amountColumn ? getKolamDataTableColumnStyle(amountColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellAmount}>
            {formatRupiah(item.contractValue || item.dealAmount)}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack width={actionsWidth}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${label}`}
          actions={[{ label: 'Lihat', onPress: onOpen }]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamProyekDetailRead({
  controller,
  onRouteChange,
}: {
  controller: KolamProyekController;
  onRouteChange?: (route: string) => void;
}) {
  const detail = controller.selected;
  const [sendOpen, setSendOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [resendNote, setResendNote] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundNote, setRefundNote] = useState('');
  const [startWorkOpen, setStartWorkOpen] = useState(false);
  const [startWorkNote, setStartWorkNote] = useState('Mulai pengerjaan');
  const [confirmDpIndex, setConfirmDpIndex] = useState<number | null>(null);
  const [confirmDpAmount, setConfirmDpAmount] = useState('');
  const [confirmDpNote, setConfirmDpNote] = useState('');
  const [closeOpen, setCloseOpen] = useState(false);
  const [progressPercentText, setProgressPercentText] = useState('');
  const [progressNoteText, setProgressNoteText] = useState('');
  const [lifecycleNote, setLifecycleNote] = useState('');
  const [lifecycleTarget, setLifecycleTarget] = useState<
    KolamProyekLifecycleStatus | ''
  >('');
  const detailScrollRef = useRef<ScrollView>(null);
  const sectionOffsetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!detail) {
      return;
    }
    setProgressPercentText(String(Math.round(detail.progressPercent || 0)));
    setProgressNoteText(detail.progressNote || '');
    const nextTargets = getKolamProyekHappyPathNext(detail.lifecycleStatus);
    setLifecycleTarget(nextTargets[0] ?? '');
    setLifecycleNote('');
  }, [detail?.id, detail?.progressPercent, detail?.progressNote, detail?.lifecycleStatus]);

  const scrollToSection = (key: string) => {
    const y = sectionOffsetsRef.current[key];
    if (y == null) {
      return;
    }
    detailScrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
  };

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

  const showHpp =
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'hppMaterials') !==
    'hidden';
  const showCommission =
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'commission') !==
    'hidden';
  const dpVisibility = getKolamProyekSectionVisibility(
    detail.lifecycleStatus,
    'dpSchedule',
  );
  const showDp =
    dpVisibility !== 'hidden' &&
    detail.paymentMode === 'staged' &&
    detail.dpSchedule.length > 0;
  const showProgress =
    getKolamProyekSectionVisibility(
      detail.lifecycleStatus,
      'progressUpdate',
    ) !== 'hidden';
  const showDesign =
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'designReview') !==
      'hidden' || detail.designSubmissions.length > 0;
  const showDelivery =
    detail.lifecycleStatus === 'delivered' ||
    detail.deliverySubmissions.length > 0;
  const showClose =
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'closeProject') ===
    'active';
  const cost = detail.costBreakdown;
  const outstanding = computeKolamProyekOutstanding(detail);
  const receivedTotal = Math.max(
    0,
    (Number(detail.contractValue) || Number(detail.dealAmount) || 0) -
      outstanding,
  );
  const commissionPreview = computeKolamProyekCommissionPreview(detail);
  const nextStep = resolveKolamProyekNextStepHero(detail);
  const activityEntries = buildKolamProyekActivityEntries(detail);
  const adminLifecycleTargets = getKolamProyekHappyPathNext(
    detail.lifecycleStatus,
  );
  const showDomainLifecycleInfo =
    getKolamProyekSectionVisibility(
      detail.lifecycleStatus,
      'lifecycleAdmin',
    ) === 'active' &&
    adminLifecycleTargets.length === 0 &&
    (detail.lifecycleStatus === 'in_progress' ||
      detail.lifecycleStatus === 'design_review');
  const complaintWindow = formatKolamProyekComplaintWindowLabel(
    detail.termsTemplates,
  );
  const clientContact = [detail.clientEmail, detail.clientPhone]
    .filter(Boolean)
    .join(' · ');
  const confirmDpRow =
    confirmDpIndex == null
      ? null
      : detail.dpSchedule.find(row => row.index === confirmDpIndex) ?? null;
  const latestDesign = getLatestKolamProyekReviewSubmission(
    detail.designSubmissions,
  );
  const latestDelivery = getLatestKolamProyekReviewSubmission(
    detail.deliverySubmissions,
  );

  const runNextStepAction = (action: KolamProyekNextStepAction) => {
    switch (action) {
      case 'send_quotation':
        setSendOpen(true);
        break;
      case 'edit':
        controller.onEdit();
        break;
      case 'resend_quotation':
        setResendOpen(true);
        break;
      case 'scroll_dp':
        scrollToSection('dp');
        break;
      case 'start_work':
        setStartWorkNote('Mulai pengerjaan');
        setStartWorkOpen(true);
        break;
      case 'scroll_design':
        scrollToSection('design');
        break;
      case 'scroll_delivery':
        scrollToSection('delivery');
        break;
      case 'close_project':
        setCloseOpen(true);
        break;
      case 'open_complaint':
        if (detail.complaintId) {
          onRouteChange?.(`/complaints/${detail.complaintId}`);
        }
        break;
      default:
        break;
    }
  };

  const markSection = (key: string) => (event: {nativeEvent: {layout: {y: number}}}) => {
    sectionOffsetsRef.current[key] = event.nativeEvent.layout.y;
  };

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
            {controller.canDownloadInvoice ? (
              <KolamPdfDownloadButton
                disabled={controller.acting}
                intent="outline"
                label="Unduh invoice"
                loading={controller.acting}
                loadingLabel="Mengunduh…"
                onPress={() => {
                  void controller.onDownloadInvoice();
                }}
              />
            ) : null}
            {controller.canEdit ? (
              <KolamButton label="Ubah" onPress={controller.onEdit} />
            ) : null}
            {controller.canSend ? (
              <KolamButton
                disabled={controller.acting || detail.contractValue <= 0}
                label={controller.acting ? 'Mengirim…' : 'Kirim ke klien'}
                onPress={() => setSendOpen(true)}
              />
            ) : null}
            {controller.canResend ? (
              <KolamButton
                disabled={controller.acting}
                label={controller.acting ? 'Mengirim…' : 'Kirim ulang'}
                onPress={() => setResendOpen(true)}
              />
            ) : null}
            {controller.canStartWork ? (
              <KolamButton
                disabled={controller.acting}
                label={
                  controller.acting ? 'Memulai…' : 'Mulai pengerjaan'
                }
                onPress={() => {
                  setStartWorkNote('Mulai pengerjaan');
                  setStartWorkOpen(true);
                }}
              />
            ) : null}
            {showClose ? (
              <KolamButton
                disabled={controller.acting || !controller.canClose}
                label="Tutup proyek"
                onPress={() => setCloseOpen(true)}
              />
            ) : null}
            {controller.canCancel ? (
              <KolamButton
                disabled={controller.acting}
                intent="outline"
                label="Batalkan"
                onPress={() => setCancelOpen(true)}
              />
            ) : null}
            {controller.canRefund ? (
              <KolamButton
                disabled={controller.acting}
                intent="danger"
                label="Refund"
                onPress={() => {
                  setRefundNote('');
                  setRefundOpen(true);
                }}
              />
            ) : null}
            {controller.canDelete ? (
              <KolamButton
                disabled={controller.acting}
                intent="danger"
                label="Hapus draft"
                onPress={() => setDeleteOpen(true)}
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

      <View style={styles.detailTop}>
        <KolamCardFrame style={styles.proyekMetaStripCard} variant="compact">
          <View style={styles.proyekMetaStripRow}>
            <ProyekMetaStripItem label="Nilai kontrak">
              <Text
                numberOfLines={1}
                style={[
                  kolamDetailMetaStripStyles.stripValue,
                  styles.tabular,
                ]}
              >
                {formatRupiah(cost.contractValue)}
              </Text>
            </ProyekMetaStripItem>
            <ProyekMetaStripItem label="Pemakaian toko">
              <Text
                numberOfLines={1}
                style={[
                  kolamDetailMetaStripStyles.stripValue,
                  styles.tabular,
                ]}
              >
                {formatRupiah(cost.produkToko)}
              </Text>
            </ProyekMetaStripItem>
            <ProyekMetaStripItem label="UE terverifikasi">
              <Text
                numberOfLines={1}
                style={[
                  kolamDetailMetaStripStyles.stripValue,
                  styles.tabular,
                ]}
              >
                {formatRupiah(cost.unexpectedExpenseTotal)}
              </Text>
            </ProyekMetaStripItem>
            <ProyekMetaStripItem label="VAR">
              <Text
                numberOfLines={1}
                style={[
                  kolamDetailMetaStripStyles.stripValue,
                  styles.tabular,
                ]}
              >
                {formatRupiah(cost.varAmount)}
              </Text>
            </ProyekMetaStripItem>
            {detail.paymentMode === 'staged' && showDp ? (
              <ProyekMetaStripItem label="DP terkumpul">
                <Text
                  numberOfLines={1}
                  style={[
                    kolamDetailMetaStripStyles.stripValue,
                    styles.tabular,
                  ]}
                >
                  {formatRupiah(receivedTotal)}
                </Text>
              </ProyekMetaStripItem>
            ) : null}
            <ProyekMetaStripItem label="Status">
              <KolamStatusBadge
                intent={getKolamProyekLifecycleIntent(detail.lifecycleStatus)}
                label={formatKolamProyekLifecycleLabel(detail.lifecycleStatus)}
              />
            </ProyekMetaStripItem>
            {showProgress ? (
              <ProyekMetaStripItem label="Progress">
                <Text
                  numberOfLines={1}
                  style={[
                    kolamDetailMetaStripStyles.stripValue,
                    styles.tabular,
                  ]}
                >
                  {Math.round(detail.progressPercent)}%
                </Text>
              </ProyekMetaStripItem>
            ) : null}
            <ProyekMetaStripItem label="Tunggakan">
              <Text
                numberOfLines={1}
                style={[
                  kolamDetailMetaStripStyles.stripValue,
                  styles.tabular,
                  outstanding > 0 ? styles.warningText : null,
                ]}
              >
                {formatRupiah(outstanding)}
              </Text>
            </ProyekMetaStripItem>
          </View>
        </KolamCardFrame>
      </View>

      <View style={styles.detailFrame}>
        <View style={styles.bodyRow}>
          <View style={styles.mainPane}>
            <ScrollView
              contentContainerStyle={styles.detailContent}
              ref={detailScrollRef}
              style={styles.mainScroll}
            >
        <DetailSection title="Ringkasan kontrak">
          <Text style={styles.metaText}>
            Klien: {detail.clientName}
            {clientContact ? ` · ${clientContact}` : ''}
          </Text>
          <Text style={styles.metaText}>PIC: {detail.designerName}</Text>
          <Text style={styles.metaText}>
            Jendela komplain: {complaintWindow}
          </Text>
          <Text style={styles.metaText}>
            Keputusan penawaran: {detail.quotationDecision || '—'}
          </Text>
          {detail.maxWorkDays != null ? (
            <Text style={styles.metaText}>
              Lama pengerjaan: {detail.maxWorkDays} hari
            </Text>
          ) : null}
          {detail.targetCompletionDate ? (
            <Text style={styles.metaText}>
              Target selesai: {formatShortDate(detail.targetCompletionDate)}
            </Text>
          ) : null}
          {detail.designReferenceEmbedUrl ? (
            <Pressable
              onPress={() => {
                const url = getKolamFileUrl(detail.designReferenceEmbedUrl);
                if (url) {
                  void Linking.openURL(url);
                }
              }}
            >
              <Text style={styles.linkText}>Buka referensi desain</Text>
            </Pressable>
          ) : null}
          {detail.progressNote ? (
            <View style={styles.noteBlock}>
              <Text style={styles.sectionSubtitle}>Deskripsi proyek</Text>
              {containsHtmlMarkup(detail.progressNote) ? (
                <KolamHtmlContent html={detail.progressNote} />
              ) : (
                <Text style={styles.metaText}>{detail.progressNote}</Text>
              )}
            </View>
          ) : null}
        </DetailSection>

        {detail.termsTemplates.length > 0 ? (
          <DetailSection title="Syarat & Ketentuan">
            {detail.termsTemplates.map(template => (
              <View key={template.id} style={styles.listRow}>
                <Text style={styles.primaryText}>{template.title}</Text>
                {template.complaintWindowDays != null &&
                template.complaintWindowDays > 0 ? (
                  <Text style={styles.metaText}>
                    Jendela komplain: {template.complaintWindowDays} hari
                  </Text>
                ) : null}
                {template.content ? (
                  containsHtmlMarkup(template.content) ? (
                    <KolamHtmlContent html={template.content} />
                  ) : (
                    <Text style={styles.metaText}>{template.content}</Text>
                  )
                ) : null}
              </View>
            ))}
          </DetailSection>
        ) : null}

        <DetailSection title="Item penawaran">
          {detail.items.length === 0 ? (
            <Text style={styles.metaText}>Belum ada item.</Text>
          ) : (
            detail.items.map(item => (
              <View key={item.id} style={styles.listRow}>
                <Text style={styles.primaryText}>{item.title}</Text>
                <Text style={styles.metaText}>
                  {formatKolamProyekItemTypeLabel(item.itemType)} ·{' '}
                  {item.quantity} × {formatRupiah(item.unitPrice)} ={' '}
                  {formatRupiah(item.subtotal)}
                </Text>
                {item.note ? (
                  <Text style={styles.metaText}>{item.note}</Text>
                ) : null}
              </View>
            ))
          )}
        </DetailSection>

        <DetailSection title="Bahan Tambahan">
          <Text style={styles.metaText}>
            Pembelian di luar toko — dari Unexpected Expense ter-link ke proyek
            ini.
          </Text>
          {detail.linkedUnexpectedExpenses.length === 0 ? (
            <Text style={styles.metaText}>
              Belum ada pembelian luar tercatat.
            </Text>
          ) : (
            detail.linkedUnexpectedExpenses.map(expense => (
              <View key={expense.id} style={styles.listRow}>
                <View style={styles.dpRowHeader}>
                  <Pressable
                    onPress={() =>
                      onRouteChange?.(`/unexpected-expense/${expense.id}`)
                    }
                  >
                    <Text style={styles.linkText}>
                      {expense.code
                        ? `${expense.code} · ${formatRupiah(expense.amount)}`
                        : formatRupiah(expense.amount)}
                    </Text>
                  </Pressable>
                  <KolamStatusBadge
                    intent={
                      expense.status === 'verified' ? 'success' : 'warning'
                    }
                    label={
                      expense.status === 'verified'
                        ? 'Verified'
                        : 'Belum verified'
                    }
                  />
                </View>
                {expense.executedAt ? (
                  <Text style={styles.metaText}>
                    {formatShortDate(expense.executedAt)}
                  </Text>
                ) : null}
                {expense.allocationLabels.map((label, index) => (
                  <Text
                    key={`${expense.id}-alloc-${index}`}
                    style={styles.metaText}
                  >
                    {label}
                  </Text>
                ))}
                {expense.shippingAmount > 0 ? (
                  <Text style={styles.metaText}>
                    Ongkir: {formatRupiah(expense.shippingAmount)}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </DetailSection>

        {showHpp ? (
          <ProyekHppMaterialsSection
            acting={controller.acting}
            canEdit={controller.canEditHpp}
            detail={detail}
            onSave={controller.onSaveHppMaterials}
            totalHppFallback={cost.totalHpp}
          />
        ) : null}

        {showCommission ? (
          <DetailSection title="Komisi">
            {detail.commissionConfig ? (
              <>
                <Text style={styles.metaText}>
                  Dunia Anura: {detail.commissionConfig.daType}{' '}
                  {detail.commissionConfig.daType === 'percentage'
                    ? `${detail.commissionConfig.daValue}%`
                    : formatRupiah(detail.commissionConfig.daValue)}
                  {commissionPreview
                    ? ` → ${formatRupiah(commissionPreview.daAmount)}`
                    : ''}
                </Text>
                <Text style={styles.metaText}>
                  PIC: {detail.commissionConfig.designerType}{' '}
                  {detail.commissionConfig.designerType === 'percentage'
                    ? `${detail.commissionConfig.designerValue}%`
                    : formatRupiah(detail.commissionConfig.designerValue)}
                  {commissionPreview
                    ? ` → ${formatRupiah(commissionPreview.designerAmount)}`
                    : ''}
                </Text>
                {commissionPreview ? (
                  <Text style={styles.metaText}>
                    {detail.lifecycleStatus === 'completed'
                      ? `Tercatat saat proyek ditutup · VAR ${formatRupiah(commissionPreview.basis)}`
                      : `Pratinjau dari VAR ${formatRupiah(commissionPreview.basis)} — final saat proyek selesai`}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.metaText}>Konfigurasi komisi belum diisi.</Text>
            )}
            {detail.commissionAccruals.length > 0 ? (
              <View style={styles.historyBlock}>
                {detail.commissionAccruals.map(accrual => (
                  <Text key={accrual.id} style={styles.metaText}>
                    Akru {accrual.party}: {formatRupiah(accrual.amount)}
                    {accrual.status ? ` · ${accrual.status}` : ''}
                  </Text>
                ))}
              </View>
            ) : null}
          </DetailSection>
        ) : null}

        {showDp ? (
          <View onLayout={markSection('dp')}>
            <DetailSection title="Pembayaran">
              <Text style={styles.primaryText}>
                {formatRupiah(receivedTotal)} /{' '}
                {formatRupiah(cost.contractValue)}
              </Text>
              <Text style={styles.metaText}>
                Sisa {formatRupiah(outstanding)}
              </Text>
              {detail.dpAmount > 0 ? (
                <Text style={styles.metaText}>
                  DP awal: {formatRupiah(detail.dpAmount)}
                </Text>
              ) : null}
              {detail.dpSchedule.map(row => {
                const rowOutstanding = getKolamProyekDpRowOutstanding(row);
                const rowActive = !row.paidAt;
                const canUploadRow =
                  controller.canUploadDpProof && rowActive;
                const canConfirmRow =
                  controller.canConfirmDp &&
                  rowActive &&
                  rowOutstanding > 0;
                return (
                  <View key={`dp-${row.index}`} style={styles.listRow}>
                    <View style={styles.dpRowHeader}>
                      <Text style={styles.primaryText}>
                        {row.name} · {formatRupiah(row.amount)}
                      </Text>
                      <KolamStatusBadge
                        intent={getKolamProyekDpRowStatusIntent(row)}
                        label={formatKolamProyekDpRowStatusLabel(row)}
                      />
                    </View>
                    <Text style={styles.metaText}>
                      Diterima {formatRupiah(row.amountReceived)}
                      {rowOutstanding > 0 && !row.paidAt
                        ? ` · sisa ${formatRupiah(rowOutstanding)}`
                        : ''}
                      {row.paidAt
                        ? ` · lunas ${formatShortDate(row.paidAt)}`
                        : row.dueAt
                          ? ` · jatuh tempo ${formatShortDate(row.dueAt)}`
                          : ''}
                    </Text>
                    {row.kwitansiNumber ? (
                      <View style={styles.dpActionRow}>
                        <Text style={styles.metaText}>
                          Kwitansi: {row.kwitansiNumber}
                        </Text>
                        {controller.canDownloadKwitansi && row.paidAt ? (
                          <KolamPdfDownloadButton
                            disabled={controller.acting}
                            intent="outline"
                            label="Buka kwitansi"
                            loading={controller.acting}
                            loadingLabel="Mengunduh…"
                            onPress={() => {
                              void controller.onDownloadKwitansi(row.index);
                            }}
                            size="sm"
                          />
                        ) : null}
                      </View>
                    ) : null}
                    {row.paymentProofs.length > 0 ? (
                      <View style={styles.historyBlock}>
                        <Text style={styles.metaText}>
                          {row.paymentProofs.length} bukti pembayaran
                        </Text>
                        {row.paymentProofs.map((proof, proofIndex) => {
                          const url = getKolamFileUrl(proof.path);
                          return (
                            <Pressable
                              key={`${row.index}-proof-${proofIndex}`}
                              disabled={!url}
                              onPress={() => {
                                if (url) {
                                  void Linking.openURL(url);
                                }
                              }}
                            >
                              <Text
                                style={url ? styles.linkText : styles.metaText}
                              >
                                Bukti {proofIndex + 1}
                                {proof.uploadedAt
                                  ? ` · ${formatShortDateTime(proof.uploadedAt)}`
                                  : ''}
                                {proof.note ? ` — ${proof.note}` : ''}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                    {row.paymentConfirmations.length > 0 ? (
                      <View style={styles.historyBlock}>
                        <Text style={styles.metaText}>Riwayat konfirmasi:</Text>
                        {row.paymentConfirmations.map(conf => (
                          <View
                            key={`${row.index}-conf-${conf.index}`}
                            style={styles.dpConfirmRow}
                          >
                            <KolamStatusBadge
                              intent={conf.reversedAt ? 'secondary' : 'success'}
                              label={
                                conf.reversedAt ? 'Dibatalkan' : 'Dikonfirmasi'
                              }
                            />
                            <Text style={styles.metaText}>
                              {formatRupiah(conf.amount)}
                              {conf.confirmedAt
                                ? ` · ${formatShortDateTime(conf.confirmedAt)}`
                                : ''}
                              {conf.note ? ` · ${conf.note}` : ''}
                              {conf.reversedAt && conf.reversalReason
                                ? ` — ${conf.reversalReason}`
                                : ''}
                            </Text>
                            {controller.canReverseDp && !conf.reversedAt ? (
                              <KolamButton
                                disabled={controller.acting}
                                intent="outline"
                                label="Batalkan"
                                onPress={() => {
                                  void controller.onReverseDpConfirmation(
                                    row.index,
                                    conf.index,
                                  );
                                }}
                                size="sm"
                              />
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {canUploadRow || canConfirmRow ? (
                      <View style={styles.dpActionRow}>
                        {canUploadRow ? (
                          <KolamButton
                            disabled={controller.acting}
                            intent="outline"
                            label={
                              controller.acting
                                ? 'Mengunggah…'
                                : 'Upload bukti'
                            }
                            onPress={() => {
                              void (async () => {
                                const picked = await pickNativeAssetFile().catch(
                                  () => null,
                                );
                                if (!picked || picked.cancelled || !picked.uri) {
                                  return;
                                }
                                await controller.onUploadDpProofs(row.index, [
                                  {
                                    uri: picked.uri,
                                    name: picked.name,
                                    mimeType: picked.mimeType,
                                  },
                                ]);
                              })();
                            }}
                            size="sm"
                          />
                        ) : null}
                        {canConfirmRow ? (
                          <KolamButton
                            disabled={controller.acting}
                            label="Konfirmasi dana masuk"
                            onPress={() => {
                              setConfirmDpIndex(row.index);
                              setConfirmDpAmount(String(rowOutstanding));
                              setConfirmDpNote('');
                            }}
                            size="sm"
                          />
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </DetailSection>
          </View>
        ) : null}

        {showProgress ? (
          <DetailSection title="Progress">
            <Text style={styles.primaryText}>
              {Math.round(detail.progressPercent)}%
              {detail.linkedTask ? ` · dari tugas` : ''}
            </Text>
            {detail.progressNote ? (
              <Text style={styles.metaText}>{detail.progressNote}</Text>
            ) : null}
            {controller.canUpdateProgress ? (
              <View style={styles.progressEditor}>
                <View style={styles.row2}>
                  <View style={styles.col}>
                    <KolamSettingsWebFieldLabel label="Progress %" required />
                    <KolamFormTextField
                      mode="numeric"
                      onChangeText={setProgressPercentText}
                      placeholder="0–100"
                      value={progressPercentText}
                    />
                  </View>
                  <View style={styles.col}>
                    <KolamSettingsWebFieldLabel label="Catatan" required={false} />
                    <KolamFormTextField
                      onChangeText={setProgressNoteText}
                      placeholder="Opsional"
                      value={progressNoteText}
                    />
                  </View>
                </View>
                <KolamButton
                  disabled={controller.acting}
                  label={controller.acting ? 'Menyimpan…' : 'Simpan progress'}
                  onPress={() => {
                    const next =
                      Number(
                        String(progressPercentText).replace(/[^\d.-]/g, ''),
                      ) || 0;
                    void controller.onUpdateProgress(next, progressNoteText);
                  }}
                />
              </View>
            ) : null}
            {detail.progressHistory.length > 0 ? (
              <View style={styles.historyBlock}>
                {detail.progressHistory.slice(0, 12).map((entry, index) => (
                  <Text
                    key={`${entry.at}-${entry.progressPercent}-${index}`}
                    style={styles.metaText}
                  >
                    {entry.progressPercent}%
                    {entry.at ? ` · ${formatShortDateTime(entry.at)}` : ''}
                    {entry.progressNote ? ` — ${entry.progressNote}` : ''}
                  </Text>
                ))}
              </View>
            ) : null}
          </DetailSection>
        ) : null}

        {showDesign ? (
          <View onLayout={markSection('design')}>
            <DetailSection title="Review desain">
            {controller.canSubmitDesign ? (
              <ReviewRoundSubmitForm
                acting={controller.acting}
                defaultRoundTitle={`Ronde ${detail.designSubmissions.length + 1}`}
                linkedTaskId={detail.linkedTask?.id || null}
                linkedTaskReady={controller.linkedTaskDone}
                onRouteChange={onRouteChange}
                onSubmit={input => controller.onSubmitDesign(input)}
                showResolutionNote={detail.designSubmissions.some(
                  item =>
                    item.clientDecision === 'revision_requested' ||
                    item.clientDecision === 'rejected',
                )}
                submitLabel="Kirim desain ke klien"
                taskGateMessage="Task proyek harus selesai (PIC Done) sebelum desain dikirim."
              />
            ) : null}
            {detail.lifecycleStatus === 'design_review' &&
            latestDesign?.clientDecision === 'pending' ? (
              <Text style={styles.metaText}>
                Menunggu keputusan klien untuk “{latestDesign.roundTitle}”.
              </Text>
            ) : null}
            {detail.designSubmissions.length === 0 ? (
              <Text style={styles.metaText}>Belum ada kiriman desain.</Text>
            ) : (
              detail.designSubmissions
                .slice()
                .reverse()
                .map((submission, index) => (
                  <ReviewSubmissionCard
                    key={submission.id}
                    roundNumber={detail.designSubmissions.length - index}
                    submission={submission}
                  />
                ))
            )}
            </DetailSection>
          </View>
        ) : null}

        {showDelivery ? (
          <View onLayout={markSection('delivery')}>
            <DetailSection title="Bukti pengerjaan">
            {controller.canSubmitDelivery ? (
              <ReviewRoundSubmitForm
                acting={controller.acting}
                defaultRoundTitle={`Bukti ${detail.deliverySubmissions.length + 1}`}
                linkedTaskId={null}
                linkedTaskReady
                onRouteChange={onRouteChange}
                onSubmit={input => controller.onSubmitDelivery(input)}
                showResolutionNote={detail.deliverySubmissions.some(
                  item =>
                    item.clientDecision === 'revision_requested' ||
                    item.clientDecision === 'rejected',
                )}
                submitLabel="Kirim bukti pengerjaan"
                taskGateMessage=""
              />
            ) : null}
            {latestDelivery?.clientDecision === 'pending' ? (
              <Text style={styles.metaText}>
                Menunggu approve bukti “{latestDelivery.roundTitle}” dari klien.
              </Text>
            ) : null}
            {detail.deliverySubmissions.length === 0 ? (
              <Text style={styles.metaText}>
                Belum ada bukti pengerjaan. Kirim foto/video/PDF hasil kerja.
              </Text>
            ) : (
              detail.deliverySubmissions
                .slice()
                .reverse()
                .map((submission, index) => (
                  <ReviewSubmissionCard
                    key={submission.id}
                    roundNumber={detail.deliverySubmissions.length - index}
                    submission={submission}
                  />
                ))
            )}
            </DetailSection>
          </View>
        ) : null}

        {showClose ? (
          <DetailSection title="Tutup proyek">
            {controller.closeBlockReason ? (
              <Text style={styles.metaText}>{controller.closeBlockReason}</Text>
            ) : (
              <Text style={styles.metaText}>
                Syarat terpenuhi (bukti approved + progress 100%). Siap
                finalisasi.
              </Text>
            )}
            <KolamButton
              disabled={controller.acting || !controller.canClose}
              label={controller.acting ? 'Memproses…' : 'Tutup proyek'}
              onPress={() => setCloseOpen(true)}
            />
          </DetailSection>
        ) : null}
            </ScrollView>
          </View>

          <View style={styles.historyPane}>
            <ScrollView
              contentContainerStyle={styles.historyScroll}
              style={styles.historyScrollView}
            >
              <ProyekLifecycleTimeline
                acting={controller.acting}
                canAdminLifecycle={controller.canAdminLifecycle}
                detail={detail}
                lifecycleNote={lifecycleNote}
                lifecycleTarget={lifecycleTarget}
                nextStepSlot={
                  <ProyekNextStepHero
                    acting={controller.acting}
                    config={nextStep}
                    onAction={runNextStepAction}
                  />
                }
                onLifecycleNoteChange={setLifecycleNote}
                onLifecycleTargetChange={setLifecycleTarget}
                onTransition={(to, note) =>
                  controller.onAdminLifecycleTransition(to, note)
                }
                showDomainInfo={showDomainLifecycleInfo}
              />

              <DetailSection title="Aktivitas">
                {activityEntries.length === 0 ? (
                  <Text style={styles.metaText}>Belum ada aktivitas.</Text>
                ) : (
                  <ScrollView
                    contentContainerStyle={styles.historyListScroll}
                    nestedScrollEnabled
                    style={styles.historyListScrollView}
                  >
                    <View style={styles.historyTimeline}>
                      {[...activityEntries].reverse().map((entry, index) => (
                        <View
                          key={`${entry.at}-${index}`}
                          style={styles.historyTimelineItem}
                        >
                          <View
                            style={[
                              styles.historyTimelineDot,
                              styles.historyTimelineDotPrimary,
                            ]}
                          />
                          <View style={styles.historyTimelineBody}>
                            <Text style={styles.historyTimelineTitle}>
                              {entry.label}
                            </Text>
                            <Text style={styles.metaText}>
                              {formatShortDateTime(entry.at)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </DetailSection>

              {detail.saleInvoiceCode || detail.saleId ? (
                <DetailSection title="Invoice / PO">
                  <Text style={styles.primaryText}>
                    {detail.saleInvoiceCode || detail.saleId}
                  </Text>
                  {detail.saleStatus ? (
                    <KolamStatusBadge
                      intent={
                        detail.saleStatus === 'paid'
                          ? 'success'
                          : detail.saleStatus === 'cancelled'
                            ? 'danger'
                            : 'secondary'
                      }
                      label={
                        detail.saleStatus === 'paid'
                          ? 'Lunas'
                          : detail.saleStatus === 'partial'
                            ? 'Sebagian'
                            : detail.saleStatus === 'pending'
                              ? 'Menunggu'
                              : detail.saleStatus === 'cancelled'
                                ? 'Dibatalkan'
                                : detail.saleStatus === 'draft'
                                  ? 'Draf'
                                  : detail.saleStatus
                      }
                    />
                  ) : null}
                  {detail.saleFinalTotal != null ? (
                    <Text style={styles.metaText}>
                      {formatRupiah(detail.saleFinalTotal)}
                    </Text>
                  ) : null}
                  {detail.saleId ? (
                    <KolamButton
                      intent="outline"
                      label="Lihat invoice"
                      onPress={() =>
                        onRouteChange?.(`/sales/${detail.saleId}`)
                      }
                    />
                  ) : null}
                </DetailSection>
              ) : null}

              <DetailSection title="Tautan terkait">
                {detail.linkedTask ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() =>
                      onRouteChange?.(
                        `/task-manager/${detail.linkedTask!.id}`,
                      )
                    }
                  >
                    <Text style={styles.linkText}>
                      Tugas: {detail.linkedTask.title} ·{' '}
                      {detail.linkedTask.status}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.metaText}>
                    Belum ada tugas operasional.
                  </Text>
                )}
              </DetailSection>

              {controller.canRefund ||
              controller.canCancel ||
              controller.canDelete ||
              detail.lifecycleStatus === 'refunded' ? (
                <DetailSection title="Zona berbahaya">
                  <Text style={styles.metaText}>
                    {detail.lifecycleStatus === 'refunded'
                      ? 'Proyek sudah di-refund. Status terminal — tidak ada aksi lanjutan.'
                      : 'Refund memakai transisi lifecycle ke status refunded (catatan audit min. 5 karakter). Alur wallet Fase 3 belum tersedia di BE/plugin.'}
                  </Text>
                  <View style={styles.dpActionRow}>
                    {controller.canRefund ? (
                      <KolamButton
                        disabled={controller.acting}
                        intent="danger"
                        label="Tandai refund"
                        onPress={() => {
                          setRefundNote('');
                          setRefundOpen(true);
                        }}
                      />
                    ) : null}
                    {controller.canCancel ? (
                      <KolamButton
                        disabled={controller.acting}
                        intent="outline"
                        label="Batalkan proyek"
                        onPress={() => setCancelOpen(true)}
                      />
                    ) : null}
                    {controller.canDelete ? (
                      <KolamButton
                        disabled={controller.acting}
                        intent="danger"
                        label="Hapus draft"
                        onPress={() => setDeleteOpen(true)}
                      />
                    ) : null}
                  </View>
                </DetailSection>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </View>

      <KolamConfirmDialog
        confirmLabel="Tutup proyek"
        message="Proyek akan diselesaikan (delivered → completed). Pastikan bukti sudah approve dan progress 100%."
        onCancel={() => setCloseOpen(false)}
        onConfirm={() => {
          void controller.onCloseProject().then(ok => {
            if (ok) {
              setCloseOpen(false);
            }
          });
        }}
        title="Tutup proyek?"
        visible={closeOpen}
      />

      <KolamConfirmDialog
        confirmLabel="Kirim"
        message="Surat penawaran akan dikirim ke klien. Mereka dapat setujui, minta revisi, atau batalkan."
        onCancel={() => setSendOpen(false)}
        onConfirm={() => {
          void controller.onSendQuotation().then(ok => {
            if (ok) {
              setSendOpen(false);
            }
          });
        }}
        title="Kirim surat penawaran?"
        visible={sendOpen}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setConfirmDpIndex(null)}
        transparent
        visible={confirmDpIndex != null}
      >
        <View style={styles.dialogOverlay}>
          <KolamModalBackdrop onPress={() => setConfirmDpIndex(null)} />
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Konfirmasi dana masuk</Text>
            <Text style={styles.dialogMessage}>
              {confirmDpRow
                ? `${confirmDpRow.name} · sisa ${formatRupiah(
                    getKolamProyekDpRowOutstanding(confirmDpRow),
                  )}`
                : 'Konfirmasi pembayaran baris DP.'}
            </Text>
            <KolamSettingsWebFieldLabel label="Jumlah diterima (Rp)" required />
            <KolamFormTextField
              mode="numeric"
              onChangeText={setConfirmDpAmount}
              placeholder="0"
              value={confirmDpAmount}
            />
            <KolamSettingsWebFieldLabel label="Catatan" required={false} />
            <KolamFormTextField
              multiline
              onChangeText={setConfirmDpNote}
              placeholder="Opsional"
              value={confirmDpNote}
            />
            <View style={styles.dialogActions}>
              <KolamButton
                intent="outline"
                label="Tutup"
                onPress={() => setConfirmDpIndex(null)}
              />
              <KolamButton
                disabled={controller.acting || confirmDpIndex == null}
                label={controller.acting ? 'Menyimpan…' : 'Konfirmasi'}
                onPress={() => {
                  if (confirmDpIndex == null) {
                    return;
                  }
                  const amount =
                    Number(String(confirmDpAmount).replace(/[^\d.-]/g, '')) ||
                    0;
                  void controller
                    .onConfirmDpReceived(
                      confirmDpIndex,
                      amount,
                      confirmDpNote,
                    )
                    .then(ok => {
                      if (ok) {
                        setConfirmDpIndex(null);
                        setConfirmDpAmount('');
                        setConfirmDpNote('');
                      }
                    });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setStartWorkOpen(false)}
        transparent
        visible={startWorkOpen}
      >
        <View style={styles.dialogOverlay}>
          <KolamModalBackdrop onPress={() => setStartWorkOpen(false)} />
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Mulai pengerjaan?</Text>
            <Text style={styles.dialogMessage}>
              Status menjadi dikerjakan. Task PIC dibuat dan HPP stok dapat
              dipotong di backend.
            </Text>
            <KolamSettingsWebFieldLabel label="Catatan" required />
            <KolamFormTextField
              multiline
              onChangeText={setStartWorkNote}
              placeholder="Min. 5 karakter"
              value={startWorkNote}
            />
            <View style={styles.dialogActions}>
              <KolamButton
                intent="outline"
                label="Batal"
                onPress={() => setStartWorkOpen(false)}
              />
              <KolamButton
                disabled={controller.acting}
                label={controller.acting ? 'Memulai…' : 'Mulai pengerjaan'}
                onPress={() => {
                  void controller.onStartWork(startWorkNote).then(ok => {
                    if (ok) {
                      setStartWorkOpen(false);
                    }
                  });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setResendOpen(false)}
        transparent
        visible={resendOpen}
      >
        <View style={styles.dialogOverlay}>
          <KolamModalBackdrop onPress={() => setResendOpen(false)} />
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Kirim ulang penawaran</Text>
            <Text style={styles.dialogMessage}>
              Opsional: catat resolusi revisi untuk klien.
            </Text>
            <KolamSettingsWebFieldLabel label="Catatan resolusi" required={false} />
            <KolamFormTextField
              multiline
              onChangeText={setResendNote}
              placeholder="Opsional"
              value={resendNote}
            />
            <View style={styles.dialogActions}>
              <KolamButton
                intent="outline"
                label="Batal"
                onPress={() => setResendOpen(false)}
              />
              <KolamButton
                disabled={controller.acting}
                label={controller.acting ? 'Mengirim…' : 'Kirim ulang'}
                onPress={() => {
                  void controller.onResendQuotation(resendNote).then(ok => {
                    if (ok) {
                      setResendOpen(false);
                      setResendNote('');
                    }
                  });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setCancelOpen(false)}
        transparent
        visible={cancelOpen}
      >
        <View style={styles.dialogOverlay}>
          <KolamModalBackdrop onPress={() => setCancelOpen(false)} />
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Batalkan proyek?</Text>
            <Text style={styles.dialogMessage}>
              Alasan pembatalan wajib diisi (minimal 3 karakter).
            </Text>
            <KolamSettingsWebFieldLabel label="Alasan" required />
            <KolamFormTextField
              multiline
              onChangeText={setCancelReason}
              placeholder="Alasan pembatalan"
              value={cancelReason}
            />
            <View style={styles.dialogActions}>
              <KolamButton
                intent="outline"
                label="Tutup"
                onPress={() => setCancelOpen(false)}
              />
              <KolamButton
                disabled={controller.acting}
                intent="danger"
                label={controller.acting ? 'Membatalkan…' : 'Batalkan proyek'}
                onPress={() => {
                  void controller.onCancelProject(cancelReason).then(ok => {
                    if (ok) {
                      setCancelOpen(false);
                      setCancelReason('');
                    }
                  });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setRefundOpen(false)}
        transparent
        visible={refundOpen}
      >
        <View style={styles.dialogOverlay}>
          <KolamModalBackdrop onPress={() => setRefundOpen(false)} />
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Tandai proyek refund?</Text>
            <Text style={styles.dialogMessage}>
              Status akan menjadi refunded lewat lifecycle admin. Catatan audit
              wajib (minimal 5 karakter). Ini bukan alur wallet/kwitansi Fase 3.
            </Text>
            <KolamSettingsWebFieldLabel label="Catatan refund" required />
            <KolamFormTextField
              multiline
              onChangeText={setRefundNote}
              placeholder="Alasan / catatan refund"
              value={refundNote}
            />
            <View style={styles.dialogActions}>
              <KolamButton
                intent="outline"
                label="Tutup"
                onPress={() => setRefundOpen(false)}
              />
              <KolamButton
                disabled={controller.acting}
                intent="danger"
                label={controller.acting ? 'Memproses…' : 'Tandai refund'}
                onPress={() => {
                  void controller.onRefundProject(refundNote).then(ok => {
                    if (ok) {
                      setRefundOpen(false);
                      setRefundNote('');
                    }
                  });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setDeleteOpen(false)}
        transparent
        visible={deleteOpen}
      >
        <View style={styles.dialogOverlay}>
          <KolamModalBackdrop onPress={() => setDeleteOpen(false)} />
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Hapus draft?</Text>
            <Text style={styles.dialogMessage}>
              Masukkan password admin untuk menghapus draft. Tidak bisa dibatalkan.
            </Text>
            <KolamSettingsWebFieldLabel label="Password" required />
            <KolamFormTextField
              mode="password"
              onChangeText={setDeletePassword}
              placeholder="Password"
              value={deletePassword}
            />
            <View style={styles.dialogActions}>
              <KolamButton
                intent="outline"
                label="Tutup"
                onPress={() => setDeleteOpen(false)}
              />
              <KolamButton
                disabled={controller.acting}
                intent="danger"
                label={controller.acting ? 'Menghapus…' : 'Hapus draft'}
                onPress={() => {
                  void controller.onDeleteDraft(deletePassword).then(ok => {
                    if (ok) {
                      setDeleteOpen(false);
                      setDeletePassword('');
                    }
                  });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ProyekMetaStripItem({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.proyekMetaStripItem}>
      <Text numberOfLines={1} style={styles.proyekMetaStripLabel}>
        {label}
      </Text>
      {children}
    </View>
  );
}

type PickedFile = {
  uri: string;
  name?: string;
  mimeType?: string;
};

function ReviewRoundSubmitForm({
  acting,
  defaultRoundTitle,
  linkedTaskId,
  linkedTaskReady,
  onRouteChange,
  onSubmit,
  showResolutionNote,
  submitLabel,
  taskGateMessage,
}: {
  acting: boolean;
  defaultRoundTitle: string;
  linkedTaskId: string | null;
  linkedTaskReady: boolean;
  onRouteChange?: (route: string) => void;
  onSubmit: (input: KolamProyekSubmitRoundInput) => Promise<boolean>;
  showResolutionNote: boolean;
  submitLabel: string;
  taskGateMessage: string;
}) {
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [roundTitle, setRoundTitle] = useState(defaultRoundTitle);
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    setRoundTitle(defaultRoundTitle);
  }, [defaultRoundTitle]);

  const pickFile = async (kind: 'image' | 'asset') => {
    try {
      const picked =
        kind === 'image'
          ? await pickNativeImageFile()
          : await pickNativeAssetFile();
      if (picked.cancelled || !(picked.uri || picked.path)) {
        return;
      }
      const uri = picked.uri || picked.path || '';
      setFiles(prev =>
        [
          ...prev,
          {
            uri,
            name: picked.name || undefined,
            mimeType: picked.mimeType || undefined,
          },
        ].slice(0, 10),
      );
    } catch {
      // Native picker errors are surfaced by the bridge; keep local silent.
    }
  };

  return (
    <View style={styles.submitCard}>
      {!linkedTaskReady && taskGateMessage ? (
        <View style={styles.gateBox}>
          <Text style={styles.metaText}>{taskGateMessage}</Text>
          {linkedTaskId ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                onRouteChange?.(`/task-manager/${linkedTaskId}`)
              }
            >
              <Text style={styles.linkText}>Buka task</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <KolamSettingsWebFieldLabel label="Judul ronde" required={false} />
      <KolamFormTextField
        onChangeText={setRoundTitle}
        placeholder="Ronde 1"
        value={roundTitle}
      />
      <KolamSettingsWebFieldLabel label="Tenggat (YYYY-MM-DD)" required={false} />
      <KolamFormTextField
        onChangeText={setDeadline}
        placeholder="Opsional"
        value={deadline}
      />
      <KolamSettingsWebFieldLabel label="Catatan" required={false} />
      <KolamFormTextField
        multiline
        onChangeText={setNote}
        placeholder="Opsional"
        value={note}
      />
      {showResolutionNote ? (
        <>
          <KolamSettingsWebFieldLabel
            label="Catatan resolusi revisi"
            required={false}
          />
          <KolamFormTextField
            multiline
            onChangeText={setResolutionNote}
            placeholder="Opsional"
            value={resolutionNote}
          />
        </>
      ) : null}
      <View style={styles.dialogActions}>
        <KolamButton
          intent="outline"
          label="Pilih gambar"
          onPress={() => {
            void pickFile('image');
          }}
        />
        <KolamButton
          intent="outline"
          label="Pilih file"
          onPress={() => {
            void pickFile('asset');
          }}
        />
      </View>
      {files.length > 0 ? (
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.fileRow}>
              <Text numberOfLines={1} style={styles.metaText}>
                {file.name || file.uri.split(/[/\\]/).pop() || `File ${index + 1}`}
              </Text>
              <KolamButton
                intent="outline"
                label="Hapus"
                onPress={() =>
                  setFiles(prev => prev.filter((_, i) => i !== index))
                }
                size="sm"
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.metaText}>Belum ada file (maks. 10).</Text>
      )}
      <KolamButton
        disabled={acting || !linkedTaskReady}
        label={acting ? 'Mengirim…' : submitLabel}
        onPress={() => {
          void onSubmit({
            files,
            note,
            roundTitle,
            deadline,
            resolutionNote,
          }).then(ok => {
            if (ok) {
              setFiles([]);
              setNote('');
              setResolutionNote('');
              setDeadline('');
            }
          });
        }}
      />
    </View>
  );
}

function ProyekLifecycleTimeline({
  acting,
  canAdminLifecycle,
  detail,
  lifecycleNote,
  lifecycleTarget,
  nextStepSlot,
  onLifecycleNoteChange,
  onLifecycleTargetChange,
  onTransition,
  showDomainInfo,
}: {
  acting: boolean;
  canAdminLifecycle: boolean;
  detail: KolamProyekDetail;
  lifecycleNote: string;
  lifecycleTarget: KolamProyekLifecycleStatus | '';
  nextStepSlot?: React.ReactNode;
  onLifecycleNoteChange: (value: string) => void;
  onLifecycleTargetChange: (value: KolamProyekLifecycleStatus | '') => void;
  onTransition: (
    to: KolamProyekLifecycleStatus,
    note: string,
  ) => Promise<boolean>;
  showDomainInfo: boolean;
}) {
  const stage = getKolamProyekStepperStageState(detail.lifecycleStatus);
  const history = [...detail.lifecycleHistory].reverse();
  const targets = getKolamProyekHappyPathNext(detail.lifecycleStatus);

  return (
    <>
      <DetailSection title="Tahapan proyek">
        <Text style={styles.metaText}>
          Alur status, riwayat perubahan, dan transisi admin.
        </Text>

        {stage.isTerminal ? (
          <View style={styles.terminalBanner}>
            <Text style={styles.primaryText}>
              {detail.lifecycleStatus === 'cancelled'
                ? 'Proyek dibatalkan'
                : 'Dana dikembalikan'}
            </Text>
            <Text style={styles.metaText}>
              {detail.lifecycleStatus === 'cancelled'
                ? 'Data tersimpan untuk audit. Tidak ada aksi lanjutan.'
                : 'Proyek tidak dilanjutkan. Riwayat tersimpan sebagai hanya baca.'}
            </Text>
          </View>
        ) : (
          <View style={styles.stepRail}>
            {KOLAM_PROYEK_HAPPY_PATH.map((step, index) => {
              const isDone =
                stage.currentIndex >= 0 && index < stage.currentIndex;
              const isCurrent =
                stage.currentIndex >= 0 && index === stage.currentIndex;
              return (
                <View key={step} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepDot,
                      isDone ? styles.stepDotDone : null,
                      isCurrent ? styles.stepDotCurrent : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepDotText,
                        isCurrent ? styles.stepDotTextOnPrimary : null,
                      ]}
                    >
                      {isDone ? '✓' : String(index + 1)}
                    </Text>
                  </View>
                  <View style={styles.stepLabelBlock}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent || isDone ? styles.primaryText : null,
                      ]}
                    >
                      {formatKolamProyekLifecycleLabel(step)}
                    </Text>
                    {isCurrent && stage.isRevising ? (
                      <Text style={styles.warningText}>
                        Client minta revisi
                      </Text>
                    ) : null}
                    {isCurrent && !stage.isRevising ? (
                      <Text style={styles.metaText}>Tahap saat ini</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </DetailSection>

      {nextStepSlot}

      <DetailSection title="Riwayat tahapan">
        {history.length === 0 ? (
          <Text style={styles.metaText}>Belum ada perubahan status.</Text>
        ) : (
          <ScrollView
            contentContainerStyle={styles.historyListScroll}
            nestedScrollEnabled
            style={styles.historyListScrollView}
          >
            <View style={styles.historyTimeline}>
              {history.map((entry, index) => (
                <View
                  key={`${entry.at}-${entry.to}-${index}`}
                  style={styles.historyTimelineItem}
                >
                  <View
                    style={[
                      styles.historyTimelineDot,
                      entry.to === 'completed' || entry.to === 'dp_paid'
                        ? styles.historyTimelineDotSuccess
                        : entry.to === 'cancelled' || entry.to === 'refunded'
                          ? styles.historyTimelineDotDanger
                          : entry.to === 'revision_in_progress'
                            ? styles.historyTimelineDotWarning
                            : styles.historyTimelineDotPrimary,
                    ]}
                  />
                  <View style={styles.historyTimelineBody}>
                    <View style={styles.dpRowHeader}>
                      <KolamStatusBadge
                        intent={getKolamProyekLifecycleIntent(entry.from)}
                        label={
                          entry.from
                            ? formatKolamProyekLifecycleLabel(entry.from)
                            : '—'
                        }
                      />
                      <Text style={styles.metaText}>→</Text>
                      <KolamStatusBadge
                        intent={getKolamProyekLifecycleIntent(entry.to)}
                        label={formatKolamProyekLifecycleLabel(entry.to)}
                      />
                    </View>
                    <Text style={styles.metaText}>
                      {entry.at ? formatShortDateTime(entry.at) : '—'}
                    </Text>
                    {entry.note ? (
                      <Text style={styles.metaText}>{entry.note}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {showDomainInfo ? (
          <View style={styles.hintCard}>
            <Text style={styles.metaText}>
              {detail.lifecycleStatus === 'in_progress'
                ? 'Aksi di stage ini dikelola tombol domain: pakai “Kirim Desain ke Client” di Review Desain — status otomatis pindah.'
                : 'Menunggu client setujui / revisi / tolak dari marketplace — status otomatis pindah setelahnya.'}
            </Text>
          </View>
        ) : null}

        {canAdminLifecycle && targets.length === 1 ? (
          <View style={styles.progressEditor}>
            <KolamSettingsWebFieldLabel
              label={`Catatan untuk "${formatKolamProyekLifecycleTransitionLabel(
                targets[0],
                detail.lifecycleStatus,
              )}"`}
              required
            />
            <KolamFormTextField
              multiline
              onChangeText={onLifecycleNoteChange}
              placeholder="Minimal 5 karakter"
              value={lifecycleNote}
            />
            <KolamButton
              disabled={acting}
              label={
                acting
                  ? 'Memproses…'
                  : formatKolamProyekLifecycleTransitionLabel(
                      targets[0],
                      detail.lifecycleStatus,
                    )
              }
              onPress={() => {
                void onTransition(targets[0], lifecycleNote);
              }}
            />
          </View>
        ) : null}

        {canAdminLifecycle && targets.length >= 2 ? (
          <View style={styles.progressEditor}>
            <KolamSettingsWebFieldLabel label="Pilih aksi" required />
            <KolamDropdownSelect
              label={
                lifecycleTarget
                  ? formatKolamProyekLifecycleTransitionLabel(
                      lifecycleTarget,
                      detail.lifecycleStatus,
                    )
                  : 'Pilih aksi'
              }
              onChange={value =>
                onLifecycleTargetChange(
                  value as KolamProyekLifecycleStatus | '',
                )
              }
              options={targets.map(target => ({
                label: formatKolamProyekLifecycleTransitionLabel(
                  target,
                  detail.lifecycleStatus,
                ),
                value: target,
              }))}
              showLabelInTrigger={false}
              value={lifecycleTarget}
            />
            <KolamSettingsWebFieldLabel label="Catatan" required />
            <KolamFormTextField
              multiline
              onChangeText={onLifecycleNoteChange}
              placeholder="Minimal 5 karakter"
              value={lifecycleNote}
            />
            <KolamButton
              disabled={acting || !lifecycleTarget}
              label={acting ? 'Memproses…' : 'Lanjutkan'}
              onPress={() => {
                if (!lifecycleTarget) {
                  return;
                }
                void onTransition(lifecycleTarget, lifecycleNote);
              }}
            />
          </View>
        ) : null}
      </DetailSection>
    </>
  );
}

function ProyekNextStepHero({
  acting,
  config,
  onAction,
}: {
  acting: boolean;
  config: KolamProyekNextStepHero;
  onAction: (action: KolamProyekNextStepAction) => void;
}) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroHeader}>
        <View style={styles.heroTitleBlock}>
          <Text style={styles.heroEyebrow}>Langkah selanjutnya</Text>
          <Text style={styles.heroHeading}>{config.heading}</Text>
        </View>
        <KolamStatusBadge
          intent={config.badgeIntent}
          label={config.stageLabel}
        />
      </View>
      <Text style={styles.heroDescription}>{config.description}</Text>
      {config.primary || (config.secondary && config.secondary.length > 0) ? (
        <View style={styles.heroActions}>
          {config.primary ? (
            <KolamButton
              disabled={acting || Boolean(config.primary.disabled)}
              label={
                acting &&
                (config.primary.action === 'send_quotation' ||
                  config.primary.action === 'start_work' ||
                  config.primary.action === 'close_project' ||
                  config.primary.action === 'resend_quotation')
                  ? 'Memproses…'
                  : config.primary.label
              }
              onPress={() => onAction(config.primary!.action)}
            />
          ) : null}
          {(config.secondary ?? []).map(item => (
            <KolamButton
              key={item.label}
              disabled={acting}
              intent="outline"
              label={item.label}
              onPress={() => onAction(item.action)}
            />
          ))}
        </View>
      ) : null}
      {config.primary?.disabled && config.primary.disabledReason ? (
        <Text style={styles.metaText}>{config.primary.disabledReason}</Text>
      ) : null}
    </View>
  );
}

function ProyekHppMaterialsSection({
  acting,
  canEdit,
  detail,
  onSave,
  totalHppFallback,
}: {
  acting: boolean;
  canEdit: boolean;
  detail: KolamProyekDetail;
  onSave: (lines: KolamProyekHppMaterial[]) => Promise<boolean>;
  totalHppFallback: number;
}) {
  const materialsSyncKey = detail.hppMaterials
    .map(
      line =>
        `${line.id}:${line.quantity}:${line.unitCost}:${line.stockAppliedAt || ''}`,
    )
    .join('|');
  const [draft, setDraft] = useState(detail.hppMaterials);

  useEffect(() => {
    setDraft(detail.hppMaterials);
  }, [detail.id, materialsSyncKey]);

  const draftTotal = draft.reduce(
    (sum, line) =>
      sum + (Number(line.quantity) || 0) * (Number(line.unitCost) || 0),
    0,
  );

  const patchLine = (
    lineId: string,
    patch: Partial<Pick<KolamProyekHppMaterial, 'quantity' | 'unitCost'>>,
  ) => {
    setDraft(current =>
      current.map(line => {
        if (line.id !== lineId) {
          return line;
        }
        const quantity =
          patch.quantity != null ? patch.quantity : line.quantity;
        const unitCost =
          patch.unitCost != null ? patch.unitCost : line.unitCost;
        return {
          ...line,
          quantity,
          unitCost,
          subtotal: quantity * unitCost,
        };
      }),
    );
  };

  return (
    <DetailSection title="HPP / produk toko">
      {draft.length === 0 && detail.hppManual <= 0 ? (
        <Text style={styles.metaText}>Belum ada baris HPP.</Text>
      ) : (
        <>
          {draft.map(line => {
            const locked = Boolean(line.stockAppliedAt);
            const editableLine = canEdit && !locked;
            return (
              <View key={line.id} style={styles.listRow}>
                <View style={styles.dpRowHeader}>
                  <Text style={styles.primaryText}>{line.label}</Text>
                  {locked ? (
                    <Text style={styles.metaText}>Stok sudah diterapkan</Text>
                  ) : null}
                </View>
                {editableLine ? (
                  <View style={styles.hppEditRow}>
                    <View style={styles.hppField}>
                      <KolamSettingsWebFieldLabel label="Qty" required />
                      <KolamFormTextField
                        mode="numeric"
                        onChangeText={text => {
                          const quantity =
                            Number(String(text).replace(/[^\d.-]/g, '')) || 0;
                          patchLine(line.id, { quantity });
                        }}
                        value={String(line.quantity ?? 0)}
                      />
                    </View>
                    <View style={styles.hppField}>
                      <KolamSettingsWebFieldLabel label="Biaya/unit" required />
                      <KolamFormTextField
                        mode="numeric"
                        onChangeText={text => {
                          const unitCost =
                            Number(String(text).replace(/[^\d.-]/g, '')) || 0;
                          patchLine(line.id, { unitCost });
                        }}
                        value={String(line.unitCost ?? 0)}
                      />
                    </View>
                    <KolamButton
                      disabled={acting}
                      intent="outline"
                      label="Hapus"
                      onPress={() => {
                        setDraft(current =>
                          current.filter(item => item.id !== line.id),
                        );
                      }}
                    />
                  </View>
                ) : null}
                <Text style={styles.metaText}>
                  {line.quantity} × {formatRupiah(line.unitCost)} ={' '}
                  {formatRupiah(
                    (Number(line.quantity) || 0) * (Number(line.unitCost) || 0),
                  )}
                </Text>
              </View>
            );
          })}
          {detail.hppManual > 0 ? (
            <Text style={styles.metaText}>
              HPP manual: {formatRupiah(detail.hppManual)}
            </Text>
          ) : null}
          <Text style={styles.primaryText}>
            Total HPP:{' '}
            {formatRupiah(
              canEdit
                ? draftTotal + (Number(detail.hppManual) || 0)
                : detail.hppTotal || totalHppFallback,
            )}
          </Text>
        </>
      )}
      {canEdit ? (
        <View style={styles.dpActionRow}>
          <KolamButton
            disabled={acting}
            intent="outline"
            label={acting ? 'Menyimpan…' : 'Simpan Produk Toko'}
            onPress={() => {
              void onSave(draft);
            }}
          />
        </View>
      ) : null}
    </DetailSection>
  );
}

function isProyekReviewImageFile(file: KolamProyekReviewFile) {
  return (
    isKolamProyekImagePath(file.path) ||
    isKolamProyekImagePath(file.name) ||
    /^image\//i.test(String(file.mimeType || ''))
  );
}

function openProyekReviewFile(
  file: KolamProyekReviewFile,
  gallery: KolamProyekReviewFile[],
) {
  const url = getKolamFileUrl(file.path);
  if (!url) {
    return;
  }
  if (isProyekReviewImageFile(file)) {
    const imageFiles = gallery.filter(isProyekReviewImageFile);
    const items = imageFiles
      .map(item => {
        const itemUrl = getKolamFileUrl(item.path);
        if (!itemUrl) {
          return null;
        }
        return {
          title: item.name || item.path || 'Pratinjau',
          uri: itemUrl,
        };
      })
      .filter((item): item is { title: string; uri: string } => Boolean(item));
    openKolamImagePreview({
      items,
      title: file.name || file.path || 'Pratinjau',
      uri: url,
    });
    return;
  }
  void Linking.openURL(url);
}

function ReviewSubmissionCard({
  roundNumber,
  submission,
}: {
  roundNumber: number;
  submission: KolamProyekReviewSubmission;
}) {
  const gallery = [...submission.files, ...submission.clientAttachments];
  return (
    <View style={styles.listRow}>
      <View style={styles.dpRowHeader}>
        <Text style={styles.primaryText}>
          {submission.roundTitle || `Ronde ${roundNumber}`}
        </Text>
        <KolamStatusBadge
          intent={getKolamProyekReviewDecisionIntent(submission.clientDecision)}
          label={formatKolamProyekReviewDecisionLabel(submission.clientDecision)}
        />
      </View>
      <Text style={styles.metaText}>
        {submission.submittedAt
          ? formatShortDateTime(submission.submittedAt)
          : '—'}
        {submission.decidedAt
          ? ` · diputus ${formatShortDateTime(submission.decidedAt)}`
          : ''}
        {submission.deadline
          ? ` · tenggat ${formatShortDate(submission.deadline)}`
          : ''}
        {` · ${submission.files.length} file`}
        {submission.clientAttachments.length > 0
          ? ` · ${submission.clientAttachments.length} referensi klien`
          : ''}
      </Text>
      {submission.note ? (
        <Text style={styles.metaText}>{submission.note}</Text>
      ) : null}
      {submission.resolutionNote ? (
        <Text style={styles.metaText}>
          Resolusi: {submission.resolutionNote}
        </Text>
      ) : null}
      {submission.revisionNote ? (
        <Text style={styles.metaText}>
          Revisi klien: {submission.revisionNote}
        </Text>
      ) : null}
      {submission.rejectionReason ? (
        <Text style={styles.metaText}>
          Alasan tolak: {submission.rejectionReason}
        </Text>
      ) : null}
      {submission.files.length > 0 ? (
        <Text style={styles.metaText}>
          File desain ({submission.files.length})
        </Text>
      ) : null}
      {submission.files.map((file, index) => {
        const url = getKolamFileUrl(file.path);
        return (
          <Pressable
            key={`${file.path}-${index}`}
            disabled={!url}
            onPress={() => openProyekReviewFile(file, gallery)}
          >
            <Text style={url ? styles.linkText : styles.metaText}>
              • {file.name || file.path || `File ${index + 1}`}
            </Text>
          </Pressable>
        );
      })}
      {submission.clientAttachments.length > 0 ? (
        <Text style={styles.metaText}>
          Referensi dari client ({submission.clientAttachments.length})
        </Text>
      ) : null}
      {submission.clientAttachments.map((file, index) => {
        const url = getKolamFileUrl(file.path);
        return (
          <Pressable
            key={`client-${file.path}-${index}`}
            disabled={!url}
            onPress={() => openProyekReviewFile(file, gallery)}
          >
            <Text style={url ? styles.linkText : styles.metaText}>
              • {file.name || file.path || `Referensi ${index + 1}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Metric({
  hint,
  label,
  value,
}: {
  hint?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
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

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDateTime(value: string) {
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
  listCell: {
    justifyContent: 'center',
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
    gap: 14,
    paddingBottom: 28,
  },
  detailTop: {
    flexShrink: 0,
    gap: 12,
  },
  proyekMetaStripCard: {
    alignSelf: 'stretch',
    minWidth: '100%',
    overflow: 'hidden',
    paddingLeft: 12,
    paddingRight: 0,
    paddingVertical: 0,
    width: '100%',
  },
  proyekMetaStripRow: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
    minHeight: 72,
    width: '100%',
  },
  proyekMetaStripItem: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    gap: 4,
    justifyContent: 'center',
    minWidth: 0,
    paddingVertical: 12,
  },
  proyekMetaStripLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  detailFrame: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bodyRow: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  mainPane: {
    flex: 3,
    minHeight: 0,
    minWidth: 0,
    paddingRight: 16,
  },
  mainScroll: {
    flex: 1,
    minHeight: 0,
  },
  historyPane: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    maxWidth: 360,
    minHeight: 0,
    minWidth: 260,
    paddingLeft: 16,
  },
  historyScrollView: {
    flex: 1,
    minHeight: 0,
  },
  historyScroll: {
    gap: 14,
    paddingBottom: 16,
    paddingTop: 2,
  },
  /** Viewport ~5 timeline rows; scroll for the rest (sales/Layanan pattern). */
  historyListScrollView: {
    maxHeight: 240,
  },
  historyListScroll: {
    paddingBottom: 4,
    paddingTop: 2,
  },
  historyTimeline: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    gap: 14,
    paddingLeft: 12,
  },
  historyTimelineItem: {
    paddingLeft: 4,
    position: 'relative',
  },
  historyTimelineDot: {
    borderColor: V.colors.bg,
    borderRadius: 6,
    borderWidth: 2,
    height: 10,
    left: -18,
    position: 'absolute',
    top: 4,
    width: 10,
  },
  historyTimelineDotPrimary: {
    backgroundColor: V.colors.primary,
  },
  historyTimelineDotSuccess: {
    backgroundColor: V.colors.success,
  },
  historyTimelineDotDanger: {
    backgroundColor: V.colors.danger,
  },
  historyTimelineDotWarning: {
    backgroundColor: V.colors.warning,
  },
  historyTimelineBody: {
    gap: 2,
    minWidth: 0,
  },
  historyTimelineTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: V.colors.primarySoft,
    borderColor: '#b7e4c7',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    padding: 12,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  heroTitleBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  heroEyebrow: {
    color: V.colors.success,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroHeading: {
    color: '#14532d',
    fontSize: 16,
    fontWeight: '700',
  },
  heroDescription: {
    color: '#3f6b52',
    fontSize: 13,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepRail: {
    gap: 0,
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepDot: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  stepDotDone: {
    backgroundColor: V.colors.primarySoft ?? V.colors.primary,
    borderColor: V.colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  stepDotText: {
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '700',
  },
  stepDotTextOnPrimary: {
    color: V.colors.primaryFg,
  },
  stepLabelBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingBottom: 10,
  },
  stepLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  hintCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    padding: 10,
  },
  terminalBanner: {
    borderColor: V.colors.danger,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    padding: 10,
  },
  sectionSubtitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteBlock: {
    gap: 4,
    marginTop: 8,
  },
  warningText: {
    color: V.colors.warning,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 18,
  },
  listRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
  dpRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metricCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    minWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  metricHint: {
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 15,
  },
  historyBlock: {
    gap: 4,
    marginTop: 4,
  },
  dpActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  hppEditRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  hppField: {
    flexGrow: 1,
    gap: 4,
    minWidth: 120,
  },
  dpConfirmRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressEditor: {
    gap: 10,
    marginTop: 8,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  col: {
    flex: 1,
    gap: 6,
    minWidth: 160,
  },
  submitCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
    padding: 12,
  },
  gateBox: {
    gap: 6,
  },
  fileList: {
    gap: 6,
  },
  fileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  linkText: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  dialogOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dialogCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxWidth: '86%',
    padding: 18,
    width: 420,
  },
  dialogTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 17,
    fontWeight: '900',
  },
  dialogMessage: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
