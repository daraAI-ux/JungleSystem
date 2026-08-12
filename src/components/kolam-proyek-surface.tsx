import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from 'react-native';
import {
  buildKolamProyekActivityEntries,
  computeKolamProyekCommissionPreview,
  computeKolamProyekOutstanding,
  formatKolamProyekComplaintWindowLabel,
  formatKolamProyekDpRowStatusLabel,
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
  type KolamProyekLinkedUnexpectedExpense,
  type KolamProyekListItem,
  type KolamProyekNextStepAction,
  type KolamProyekNextStepHero,
  type KolamProyekReviewFile,
  type KolamProyekReviewSubmission,
  type KolamProyekSubmitRoundInput,
} from '../domain/kolam-proyek';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import {
  useKolamProyekController,
  type KolamProyekController,
} from '../hooks/use-kolam-proyek-controller';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamDateField } from './kolam-date-field';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import { kolamDetailMetaStripStyles } from './kolam-detail-meta-strip';
import {
  KolamDropdownSelect,
  KolamTableRowActionMenu,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamExportXlsButton } from './kolam-export-xls-button';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRupiahField } from './kolam-rupiah-field';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { openKolamImagePreview } from './kolam-image-preview-dialog';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import {KolamNotesField} from './kolam-notes-field';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamProyekQuotationForm } from './kolam-proyek-quotation-form';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import {
  pickNativeAssetFile,
  pickNativeImageFile,
} from '../services/native-file-picker';

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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const columns = useMemo(
    () =>
      buildProyekListColumns({
        onOpen: item => controller.onOpenItem(item),
      }),
    [controller],
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
            <KolamExportXlsButton
              label="Export XLSX"
              onPress={() => setExportDialogOpen(true)}
            />
            {controller.canCreate ? (
              <KolamButton
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle={controller.loading ? 'Memuat' : 'Kosong'}
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSetPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={item => {
          const label = item.quotationNumber || item.id;
          return (
            <KolamTableRowActionMenu
              accessibilityLabel={`Menu ${label}`}
              actions={[{ label: 'Lihat', onPress: () => controller.onOpenItem(item) }]}
            />
          );
        }}
        rows={controller.items}
      />

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

function buildProyekListColumns({
  onOpen,
}: {
  onOpen: (item: KolamProyekListItem) => void;
}): Array<KolamListTableColumn<KolamProyekListItem>> {
  return [
    {
      flex: 1.3,
      id: 'primary',
      label: 'Penawaran',
      render: item => {
        const label = item.quotationNumber || item.id;
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpen(item)}
            style={styles.cellPressable}
          >
            <Text numberOfLines={1} style={styles.cellPrimary}>
              {label}
            </Text>
          </Pressable>
        );
      },
    },
    {
      flex: 1.2,
      id: 'meta',
      label: 'Pelanggan',
      render: item => (
        <Text numberOfLines={1} style={styles.cellMeta}>
          {item.clientName || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: item => (
        <KolamStatusBadge
          intent={getKolamProyekLifecycleIntent(item.lifecycleStatus)}
          label={formatKolamProyekLifecycleLabel(item.lifecycleStatus)}
          style={styles.centerBadge}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.6,
      id: 'notes',
      label: 'Progress',
      render: item => (
        <Text numberOfLines={1} style={styles.cellMetaCenter}>
          {Math.round(item.progressPercent)}%
        </Text>
      ),
    },
    {
      align: 'right',
      flex: 1,
      id: 'amount',
      label: 'Nilai kontrak',
      render: item => (
        <Text numberOfLines={1} style={styles.cellAmount}>
          {formatRupiah(item.contractValue || item.dealAmount)}
        </Text>
      ),
    },
  ];
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
  const detailId = detail?.id;
  const detailLifecycleStatus = detail?.lifecycleStatus;
  const detailProgressNote = detail?.progressNote;
  const detailProgressPercent = detail?.progressPercent;

  useEffect(() => {
    if (!detailId || !detailLifecycleStatus) {
      return;
    }
    setProgressPercentText(String(Math.round(detailProgressPercent || 0)));
    setProgressNoteText(detailProgressNote || '');
    const nextTargets = getKolamProyekHappyPathNext(detailLifecycleStatus);
    setLifecycleTarget(nextTargets[0] ?? '');
    setLifecycleNote('');
  }, [detailId, detailLifecycleStatus, detailProgressNote, detailProgressPercent]);

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
  const showFinance = showCommission || showDp;
  const financeFields = (() => {
    const fields: Array<{ id: string; label: string; value: string }> = [];
    if (showDp) {
      fields.push(
        {
          id: 'received',
          label: 'Diterima',
          value: formatRupiah(receivedTotal),
        },
        {
          id: 'contract-pay',
          label: 'Nilai kontrak',
          value: formatRupiah(cost.contractValue),
        },
        {
          id: 'outstanding',
          label: 'Sisa',
          value: formatRupiah(outstanding),
        },
      );
      if (detail.dpAmount > 0) {
        fields.push({
          id: 'dp-awal',
          label: 'DP awal',
          value: formatRupiah(detail.dpAmount),
        });
      }
    }
    if (showCommission) {
      if (detail.commissionConfig) {
        const daRate =
          detail.commissionConfig.daType === 'percentage'
            ? `${detail.commissionConfig.daValue}%`
            : formatRupiah(detail.commissionConfig.daValue);
        const picRate =
          detail.commissionConfig.designerType === 'percentage'
            ? `${detail.commissionConfig.designerValue}%`
            : formatRupiah(detail.commissionConfig.designerValue);
        fields.push(
          {
            id: 'komisi-da',
            label: 'Komisi Dunia Anura',
            value: commissionPreview
              ? `${daRate} → ${formatRupiah(commissionPreview.daAmount)}`
              : daRate,
          },
          {
            id: 'komisi-pic',
            label: 'Komisi PIC',
            value: commissionPreview
              ? `${picRate} → ${formatRupiah(commissionPreview.designerAmount)}`
              : picRate,
          },
        );
        if (commissionPreview) {
          fields.push({
            id: 'basis-var',
            label: 'Basis VAR',
            value: formatRupiah(commissionPreview.basis),
          });
        }
      } else {
        fields.push({
          id: 'komisi-empty',
          label: 'Komisi',
          value: 'Konfigurasi belum diisi',
        });
      }
    }
    return fields;
  })();
  const nextStep = resolveKolamProyekNextStepHero(detail);
  const activityEntries = buildKolamProyekActivityEntries(detail);
  const progressNow = Math.round(
    detail.linkedTask?.workProgressPercent != null
      ? detail.linkedTask.workProgressPercent
      : detail.progressPercent || 0,
  );
  const progressBarWidth = `${Math.min(100, Math.max(0, progressNow))}%` as DimensionValue;
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
              <KolamEditButton onPress={controller.onEdit} />
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
              <KolamDeleteButton
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
            <KolamDetailScrollSurface
              contentContainerStyle={styles.detailContent}
              ref={detailScrollRef}
              style={styles.mainScroll}
            >
        <KolamDetailSummaryCard
          body={
            detail.progressNote || detail.designReferenceEmbedUrl ? (
              <View style={styles.summaryBodyStack}>
                {detail.progressNote ? (
                  containsHtmlMarkup(detail.progressNote) ? (
                    <KolamHtmlContent html={detail.progressNote} />
                  ) : (
                    <Text style={styles.metaText}>{detail.progressNote}</Text>
                  )
                ) : null}
                {detail.designReferenceEmbedUrl ? (
                  <Pressable
                    onPress={() => {
                      const url = getKolamFileUrl(
                        detail.designReferenceEmbedUrl,
                      );
                      if (url) {
                        void Linking.openURL(url);
                      }
                    }}
                  >
                    <Text style={styles.linkText}>Buka referensi desain</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : undefined
          }
          bodyTitle={
            detail.progressNote || detail.designReferenceEmbedUrl
              ? 'Deskripsi proyek'
              : undefined
          }
          description="Identitas kontrak dan keputusan penawaran."
          fields={[
            {
              id: 'client',
              label: 'Klien',
              value: (
                <View style={styles.summaryFieldStack}>
                  <Text style={styles.summaryFieldPrimary}>
                    {detail.clientName || '—'}
                  </Text>
                  {clientContact ? (
                    <Text style={styles.summaryFieldSecondary}>
                      {clientContact}
                    </Text>
                  ) : null}
                </View>
              ),
            },
            {
              id: 'pic',
              label: 'PIC',
              value: detail.designerName || '—',
            },
            {
              id: 'complaint',
              label: 'Jendela komplain',
              value: complaintWindow,
            },
            {
              id: 'decision',
              label: 'Keputusan penawaran',
              value: detail.quotationDecision || '—',
            },
            ...(detail.maxWorkDays != null
              ? [
                  {
                    id: 'maxWorkDays',
                    label: 'Lama pengerjaan',
                    value: `${detail.maxWorkDays} hari`,
                  },
                ]
              : []),
            ...(detail.targetCompletionDate
              ? [
                  {
                    id: 'target',
                    label: 'Target selesai',
                    value: formatShortDate(detail.targetCompletionDate),
                  },
                ]
              : []),
          ]}
          title="Ringkasan kontrak"
        />

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

        <ProyekBahanTambahanSection
          expenses={detail.linkedUnexpectedExpenses}
          onOpenExpense={id => onRouteChange?.(`/unexpected-expense/${id}`)}
          onCreateExpense={() =>
            onRouteChange?.(
              `/unexpected-expense/create?projectId=${encodeURIComponent(detail.id)}`,
            )
          }
        />

        {showHpp ? (
          <ProyekHppMaterialsSection
            acting={controller.acting}
            canEdit={controller.canEditHpp}
            detail={detail}
            onSave={controller.onSaveHppMaterials}
            totalHppFallback={cost.totalHpp}
          />
        ) : null}

        {showFinance ? (
          <View onLayout={showDp ? markSection('dp') : undefined}>
            <KolamDetailSummaryCard
              description="Pembayaran dan komisi untuk kontrak ini."
              fields={financeFields}
              sections={[
                ...(showCommission &&
                (commissionPreview || detail.commissionAccruals.length > 0)
                  ? [
                      {
                        id: 'komisi-catatan',
                        title: 'Catatan komisi',
                        content: (
                          <View style={styles.summaryBodyStack}>
                            {commissionPreview ? (
                              <Text style={styles.metaText}>
                                {detail.lifecycleStatus === 'completed'
                                  ? `Tercatat saat proyek ditutup · VAR ${formatRupiah(commissionPreview.basis)}`
                                  : `Pratinjau dari VAR ${formatRupiah(commissionPreview.basis)} — final saat proyek selesai`}
                              </Text>
                            ) : null}
                            {detail.commissionAccruals.map(accrual => (
                              <Text key={accrual.id} style={styles.metaText}>
                                Akru {accrual.party}:{' '}
                                {formatRupiah(accrual.amount)}
                                {accrual.status
                                  ? ` · ${accrual.status}`
                                  : ''}
                              </Text>
                            ))}
                          </View>
                        ),
                      },
                    ]
                  : []),
                ...(showDp
                  ? [
                      {
                        id: 'jadwal-dp',
                        title: 'Jadwal pembayaran',
                        content: (
                          <View style={styles.summaryBodyStack}>
                            {detail.dpSchedule.map(row => {
                              const rowOutstanding =
                                getKolamProyekDpRowOutstanding(row);
                              const rowActive = !row.paidAt;
                              const canUploadRow =
                                controller.canUploadDpProof && rowActive;
                              const canConfirmRow =
                                controller.canConfirmDp &&
                                rowActive &&
                                rowOutstanding > 0;
                              return (
                                <View
                                  key={`dp-${row.index}`}
                                  style={styles.listRow}
                                >
                                  <View style={styles.dpRowHeader}>
                                    <Text style={styles.primaryText}>
                                      {row.name} · {formatRupiah(row.amount)}
                                    </Text>
                                    <KolamStatusBadge
                                      intent={getKolamProyekDpRowStatusIntent(
                                        row,
                                      )}
                                      label={formatKolamProyekDpRowStatusLabel(
                                        row,
                                      )}
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
                                      {controller.canDownloadKwitansi &&
                                      row.paidAt ? (
                                        <KolamPdfDownloadButton
                                          disabled={controller.acting}
                                          intent="outline"
                                          label="Buka kwitansi"
                                          loading={controller.acting}
                                          loadingLabel="Mengunduh…"
                                          onPress={() => {
                                            void controller.onDownloadKwitansi(
                                              row.index,
                                            );
                                          }}
                                          size="sm"
                                        />
                                      ) : null}
                                    </View>
                                  ) : null}
                                  {row.paymentProofs.length > 0 ? (
                                    <View style={styles.historyBlock}>
                                      <Text style={styles.metaText}>
                                        {row.paymentProofs.length} bukti
                                        pembayaran
                                      </Text>
                                      {row.paymentProofs.map(
                                        (proof, proofIndex) => {
                                          const url = getKolamFileUrl(
                                            proof.path,
                                          );
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
                                                style={
                                                  url
                                                    ? styles.linkText
                                                    : styles.metaText
                                                }
                                              >
                                                Bukti {proofIndex + 1}
                                                {proof.uploadedAt
                                                  ? ` · ${formatShortDateTime(proof.uploadedAt)}`
                                                  : ''}
                                                {proof.note
                                                  ? ` — ${proof.note}`
                                                  : ''}
                                              </Text>
                                            </Pressable>
                                          );
                                        },
                                      )}
                                    </View>
                                  ) : null}
                                  {row.paymentConfirmations.length > 0 ? (
                                    <View style={styles.historyBlock}>
                                      <Text style={styles.metaText}>
                                        Riwayat konfirmasi:
                                      </Text>
                                      {row.paymentConfirmations.map(conf => (
                                        <View
                                          key={`${row.index}-conf-${conf.index}`}
                                          style={styles.dpConfirmRow}
                                        >
                                          <KolamStatusBadge
                                            intent={
                                              conf.reversedAt
                                                ? 'secondary'
                                                : 'success'
                                            }
                                            label={
                                              conf.reversedAt
                                                ? 'Dibatalkan'
                                                : 'Dikonfirmasi'
                                            }
                                          />
                                          <Text style={styles.metaText}>
                                            {formatRupiah(conf.amount)}
                                            {conf.confirmedAt
                                              ? ` · ${formatShortDateTime(conf.confirmedAt)}`
                                              : ''}
                                            {conf.note
                                              ? ` · ${conf.note}`
                                              : ''}
                                            {conf.reversedAt &&
                                            conf.reversalReason
                                              ? ` — ${conf.reversalReason}`
                                              : ''}
                                          </Text>
                                          {controller.canReverseDp &&
                                          !conf.reversedAt ? (
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
                                              : 'Unggah bukti'
                                          }
                                          onPress={() => {
                                            void (async () => {
                                              const picked =
                                                await pickNativeAssetFile().catch(
                                                  () => null,
                                                );
                                              if (
                                                !picked ||
                                                picked.cancelled ||
                                                !picked.uri
                                              ) {
                                                return;
                                              }
                                              await controller.onUploadDpProofs(
                                                row.index,
                                                [
                                                  {
                                                    uri: picked.uri,
                                                    name: picked.name,
                                                    mimeType: picked.mimeType,
                                                  },
                                                ],
                                              );
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
                                            setConfirmDpAmount(
                                              String(rowOutstanding),
                                            );
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
                          </View>
                        ),
                      },
                    ]
                  : []),
              ]}
              title="Ringkasan keuangan"
            />
          </View>
        ) : null}

        {showProgress ? (
          <KolamCardFrame style={styles.progressCard} variant="compact">
            <Text style={styles.progressTitle}>Perbarui progress</Text>
            <Text style={styles.progressCurrent}>
              Saat ini: {progressNow}%
              {detail.linkedTask ? ' · dari tugas' : ''}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.min(100, Math.max(0, progressNow)),
              }}
              style={styles.progressTrack}
            >
              <View
                style={[styles.progressFill, { width: progressBarWidth }]}
              />
            </View>

            {controller.canUpdateProgress ? (
              <View style={styles.progressEditor}>
                <View style={styles.progressInputRow}>
                  <View style={styles.progressPercentField}>
                    <KolamSettingsWebFieldLabel label="Progress %" required />
                    <KolamFormTextField
                      mode="numeric"
                      onChangeText={setProgressPercentText}
                      placeholder={`${Math.round(detail.progressPercent || 0)}–100`}
                      value={progressPercentText}
                    />
                  </View>
                  <View style={styles.progressNoteField}>
                    <KolamNotesField
                      label="Catatan"
                      onChangeText={setProgressNoteText}
                      placeholder="Catatan"
                      value={progressNoteText}
                    />
                  </View>
                  <KolamSaveButton
                    disabled={controller.acting}
                    label={controller.acting ? 'Menyimpan…' : 'Simpan'}
                    onPress={() => {
                      const next =
                        Number(
                          String(progressPercentText).replace(/[^\d.-]/g, ''),
                        ) || 0;
                      void controller.onUpdateProgress(
                        next,
                        progressNoteText,
                      );
                    }}
                  />
                </View>
              </View>
            ) : null}

            {detail.progressHistory.length > 0 ? (
              <ScrollView
                contentContainerStyle={styles.progressHistoryScroll}
                nestedScrollEnabled
                style={styles.progressHistoryScrollView}
              >
                {[...detail.progressHistory].reverse().map((entry, index) => (
                  <View
                    key={`${entry.at}-${entry.progressPercent}-${index}`}
                    style={styles.progressHistoryRow}
                  >
                    <Text style={styles.progressHistoryPercent}>
                      {entry.progressPercent}%
                    </Text>
                    {entry.progressNote ? (
                      <Text style={styles.progressHistoryNote}>
                        {entry.progressNote}
                      </Text>
                    ) : null}
                    {entry.at ? (
                      <Text style={styles.progressHistoryAt}>
                        {formatShortDateTime(entry.at)}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </KolamCardFrame>
        ) : null}

        {showDesign || showDelivery ? (
          <KolamCardFrame
            accessibilityLabel="Review desain dan bukti pengerjaan"
            style={styles.reviewTwinCard}
            variant="compact"
          >
            <View style={styles.reviewTwinHeader}>
              <Text style={styles.reviewTwinTitle}>
                Review desain & bukti pengerjaan
              </Text>
              <Text style={styles.reviewTwinDescription}>
                Kiriman desain dan bukti hasil kerja ditampilkan berdampingan.
              </Text>
            </View>
            <View style={styles.reviewTwinRow}>
              {showDesign ? (
                <View
                  onLayout={markSection('design')}
                  style={styles.reviewTwinPane}
                >
                  <Text style={styles.reviewTwinPaneTitle}>Review desain</Text>
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
                      Menunggu keputusan klien untuk “
                      {latestDesign.roundTitle}”.
                    </Text>
                  ) : null}
                  {detail.designSubmissions.length === 0 ? (
                    <Text style={styles.metaText}>
                      Belum ada kiriman desain.
                    </Text>
                  ) : (
                    detail.designSubmissions
                      .slice()
                      .reverse()
                      .map((submission, index) => (
                        <ReviewSubmissionCard
                          key={submission.id}
                          filesLabel="File desain"
                          roundNumber={
                            detail.designSubmissions.length - index
                          }
                          submission={submission}
                        />
                      ))
                  )}
                </View>
              ) : null}
              {showDelivery ? (
                <View
                  onLayout={markSection('delivery')}
                  style={styles.reviewTwinPane}
                >
                  <Text style={styles.reviewTwinPaneTitle}>
                    Bukti pengerjaan
                  </Text>
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
                      Menunggu approve bukti “{latestDelivery.roundTitle}” dari
                      klien.
                    </Text>
                  ) : null}
                  {detail.deliverySubmissions.length === 0 ? (
                    <Text style={styles.metaText}>
                      Belum ada bukti pengerjaan. Kirim foto/video/PDF hasil
                      kerja.
                    </Text>
                  ) : (
                    detail.deliverySubmissions
                      .slice()
                      .reverse()
                      .map((submission, index) => (
                        <ReviewSubmissionCard
                          key={submission.id}
                          filesLabel="File bukti"
                          roundNumber={
                            detail.deliverySubmissions.length - index
                          }
                          submission={submission}
                        />
                      ))
                  )}
                </View>
              ) : null}
            </View>
          </KolamCardFrame>
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
            </KolamDetailScrollSurface>
          </View>

          <View style={styles.historyPane}>
            <ScrollView
              contentContainerStyle={styles.historyScroll}
              style={styles.historyScrollView}
            >
              <ProyekNextStepHero
                acting={controller.acting}
                config={nextStep}
                onAction={runNextStepAction}
              />

              <ProyekLifecycleTimeline
                acting={controller.acting}
                canAdminLifecycle={controller.canAdminLifecycle}
                detail={detail}
                lifecycleNote={lifecycleNote}
                lifecycleTarget={lifecycleTarget}
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
                      <KolamDeleteButton
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
            <KolamSettingsWebFieldLabel label="Jumlah diterima" required />
            <KolamRupiahField
              onChangeValue={value => setConfirmDpAmount(String(value))}
              placeholder="0"
              value={Number(confirmDpAmount) || 0}
            />
            <KolamNotesField
              label="Catatan"
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
            <KolamNotesField
              label="Catatan"
              required
              onChangeText={setStartWorkNote}
              placeholder="Min. 5 karakter"
              value={startWorkNote}
            />
            <View style={styles.dialogActions}>
              <KolamCancelButton
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
            <KolamNotesField
              label="Catatan resolusi"
              onChangeText={setResendNote}
              placeholder="Opsional"
              value={resendNote}
            />
            <View style={styles.dialogActions}>
              <KolamCancelButton
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
            <KolamNotesField
              label="Catatan refund"
              required
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
              <KolamDeleteButton
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

function ProyekBahanTambahanSection({
  expenses,
  onCreateExpense,
  onOpenExpense,
}: {
  expenses: KolamProyekLinkedUnexpectedExpense[];
  onCreateExpense: () => void;
  onOpenExpense: (id: string) => void;
}) {
  return (
    <KolamCardFrame style={styles.bahanCard} variant="compact">
      <View style={styles.bahanHeader}>
        <View style={styles.bahanHeaderCopy}>
          <Text style={styles.bahanTitle}>Bahan tambahan</Text>
          <Text style={styles.bahanDescription}>
            Pembelian di luar toko — dari Unexpected Expense ter-link ke proyek
            ini.
          </Text>
        </View>
        <KolamButton
          intent="outline"
          label="Catat pembelian"
          onPress={onCreateExpense}
        />
      </View>

      {expenses.length === 0 ? (
        <Text style={styles.metaText}>Belum ada pembelian luar tercatat.</Text>
      ) : (
        <View style={styles.bahanList}>
          {expenses.map(expense => {
            const verified = expense.status === 'verified';
            return (
              <View key={expense.id} style={styles.bahanItemCard}>
                <View style={styles.bahanItemTop}>
                  <View style={styles.bahanItemTitleBlock}>
                    <Pressable onPress={() => onOpenExpense(expense.id)}>
                      <Text style={styles.linkText} numberOfLines={1}>
                        {expense.code || expense.id}
                      </Text>
                    </Pressable>
                    {expense.vendorName ? (
                      <Text style={styles.bahanSubMeta} numberOfLines={1}>
                        {expense.vendorName}
                      </Text>
                    ) : null}
                  </View>
                  <KolamStatusBadge
                    intent={verified ? 'success' : 'warning'}
                    label={verified ? 'Verified' : 'Belum verified'}
                  />
                </View>

                <View style={styles.bahanItemMetaRow}>
                  <View style={styles.bahanItemMeta}>
                    <Text style={styles.bahanMetaLabel}>Jumlah</Text>
                    <Text style={[styles.bahanMetaValue, styles.tabular]}>
                      {formatRupiah(expense.amount)}
                    </Text>
                  </View>
                  <View style={styles.bahanItemMeta}>
                    <Text style={styles.bahanMetaLabel}>Tanggal</Text>
                    <Text style={styles.bahanMetaValue}>
                      {expense.executedAt
                        ? formatShortDate(expense.executedAt)
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.bahanItemMeta}>
                    <Text style={styles.bahanMetaLabel}>Ongkir</Text>
                    <Text style={[styles.bahanMetaValue, styles.tabular]}>
                      {expense.shippingAmount > 0
                        ? formatRupiah(expense.shippingAmount)
                        : '—'}
                    </Text>
                  </View>
                </View>

                {expense.allocationLabels.length > 0 ? (
                  <View style={styles.bahanAllocBlock}>
                    <Text style={styles.bahanMetaLabel}>Alokasi</Text>
                    {expense.allocationLabels.map((label, index) => (
                      <Text
                        key={`${expense.id}-alloc-${index}`}
                        style={styles.bahanAllocLine}
                      >
                        {label}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </KolamCardFrame>
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
      <KolamSettingsWebFieldLabel label="Tenggat" required={false} />
      <KolamDateField
        label="Tenggat"
        onChange={setDeadline}
        placeholder="Opsional"
        showLabelInTrigger={false}
        value={deadline}
      />
      <KolamNotesField
        label="Catatan"
        onChangeText={setNote}
        placeholder="Opsional"
        value={note}
      />
      {showResolutionNote ? (
        <>
          <KolamNotesField
            label="Catatan resolusi revisi"
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
        <View style={styles.reviewFileBlock}>
          <View style={styles.reviewThumbGrid}>
            {files.map((file, index) => {
              const name =
                file.name ||
                file.uri.split(/[/\\]/).pop() ||
                `File ${index + 1}`;
              const isImage =
                /^image\//i.test(String(file.mimeType || '')) ||
                isKolamProyekImagePath(file.name) ||
                isKolamProyekImagePath(file.uri);
              return (
                <View
                  key={`${file.uri}-${index}`}
                  style={styles.reviewPickThumbWrap}
                >
                  {isImage ? (
                    <KolamRemoteImage
                      accessibilityLabel={name}
                      sourceUri={file.uri}
                      style={styles.reviewThumbImage}
                    />
                  ) : (
                    <View style={styles.reviewThumbFile}>
                      <Text style={styles.reviewThumbFileKind}>
                        {/pdf/i.test(String(file.mimeType || '')) ||
                        /\.pdf$/i.test(name)
                          ? 'PDF'
                          : 'Berkas'}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={styles.reviewThumbFileName}
                      >
                        {name}
                      </Text>
                    </View>
                  )}
                  <KolamDeleteButton
                    intent="outline"
                    label="Hapus"
                    onPress={() =>
                      setFiles(prev => prev.filter((_, i) => i !== index))
                    }
                    size="sm"
                  />
                </View>
              );
            })}
          </View>
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
            <KolamNotesField
              label={`Catatan untuk "${formatKolamProyekLifecycleTransitionLabel(
                targets[0],
                detail.lifecycleStatus,
              )}"`}
              required
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
            <KolamNotesField
              label="Catatan"
              required
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
  }, [detail.id, detail.hppMaterials, materialsSyncKey]);

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
    <KolamCardFrame style={styles.hppCard} variant="compact">
      <View style={styles.hppHeader}>
        <View style={styles.hppHeaderCopy}>
          <Text style={styles.hppTitle}>HPP / produk toko</Text>
          <Text style={styles.hppDescription}>
            Harga dari katalog. Stok disesuaikan saat proyek dalam proses.
          </Text>
        </View>
        {canEdit ? (
          <KolamButton
            disabled={acting}
            intent="outline"
            label={acting ? 'Menyimpan…' : 'Simpan Produk Toko'}
            onPress={() => {
              void onSave(draft);
            }}
          />
        ) : null}
      </View>

      {draft.length === 0 && detail.hppManual <= 0 ? (
        <Text style={styles.metaText}>Belum ada baris HPP.</Text>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hppTable}>
              <View style={[styles.hppTableRow, styles.hppTableHead]}>
                <Text style={[styles.hppTh, styles.hppColProduct]}>Produk</Text>
                <Text style={[styles.hppTh, styles.hppColQty]}>Qty</Text>
                <Text style={[styles.hppTh, styles.hppColCost]}>Biaya/unit</Text>
                <Text style={[styles.hppTh, styles.hppColSub]}>Subtotal</Text>
                {canEdit ? (
                  <Text style={[styles.hppTh, styles.hppColAction]}>Aksi</Text>
                ) : null}
              </View>
              {draft.map(line => {
                const locked = Boolean(line.stockAppliedAt);
                const editableLine = canEdit && !locked;
                const subtotal =
                  (Number(line.quantity) || 0) * (Number(line.unitCost) || 0);
                return (
                  <View key={line.id} style={styles.hppTableRow}>
                    <View style={styles.hppColProduct}>
                      <Text style={styles.hppProductName} numberOfLines={2}>
                        {line.label}
                      </Text>
                      {locked ? (
                        <Text style={styles.hppLockedHint}>
                          Stok sudah diterapkan
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.hppColQty}>
                      {editableLine ? (
                        <KolamFormTextField
                          mode="numeric"
                          onChangeText={text => {
                            const quantity =
                              Number(String(text).replace(/[^\d.-]/g, '')) ||
                              0;
                            patchLine(line.id, { quantity });
                          }}
                          value={String(line.quantity ?? 0)}
                        />
                      ) : (
                        <Text style={[styles.hppTd, styles.tabular]}>
                          {line.quantity}
                        </Text>
                      )}
                    </View>
                    <View style={styles.hppColCost}>
                      {editableLine ? (
                        <KolamFormTextField
                          mode="numeric"
                          onChangeText={text => {
                            const unitCost =
                              Number(String(text).replace(/[^\d.-]/g, '')) ||
                              0;
                            patchLine(line.id, { unitCost });
                          }}
                          value={String(line.unitCost ?? 0)}
                        />
                      ) : (
                        <Text style={[styles.hppTd, styles.tabular]}>
                          {formatRupiah(line.unitCost)}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[styles.hppTd, styles.hppColSub, styles.tabular]}
                    >
                      {formatRupiah(subtotal)}
                    </Text>
                    {canEdit ? (
                      <View style={styles.hppColAction}>
                        {editableLine ? (
                          <KolamDeleteButton
                            disabled={acting}
                            intent="outline"
                            label="Hapus"
                            onPress={() => {
                              setDraft(current =>
                                current.filter(item => item.id !== line.id),
                              );
                            }}
                          />
                        ) : (
                          <Text style={styles.metaText}>—</Text>
                        )}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          {detail.hppManual > 0 ? (
            <Text style={styles.metaText}>
              HPP manual: {formatRupiah(detail.hppManual)}
            </Text>
          ) : null}
          <Text style={styles.hppTotal}>
            Total HPP:{' '}
            {formatRupiah(
              canEdit
                ? draftTotal + (Number(detail.hppManual) || 0)
                : detail.hppTotal || totalHppFallback,
            )}
          </Text>
        </>
      )}
    </KolamCardFrame>
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

function isProyekReviewPdfFile(file: KolamProyekReviewFile) {
  return (
    /pdf/i.test(String(file.mimeType || '')) ||
    /\.pdf$/i.test(String(file.path || '')) ||
    /\.pdf$/i.test(String(file.name || ''))
  );
}

function ReviewFileThumbGrid({
  files,
  filesLabel,
  gallery,
}: {
  files: KolamProyekReviewFile[];
  filesLabel: string;
  gallery: KolamProyekReviewFile[];
}) {
  if (files.length === 0) {
    return null;
  }

  const imagePreviewItems = gallery
    .filter(isProyekReviewImageFile)
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

  return (
    <View style={styles.reviewFileBlock}>
      <Text style={styles.metaText}>
        {filesLabel} ({files.length})
      </Text>
      <View style={styles.reviewThumbGrid}>
        {files.map((file, index) => {
          const url = getKolamFileUrl(file.path);
          const name = file.name || file.path || `Berkas ${index + 1}`;
          const isImage = isProyekReviewImageFile(file);
          if (isImage && url) {
            const previewIndex = imagePreviewItems.findIndex(
              item => item.uri === url,
            );
            return (
              <KolamRemoteImage
                key={`${file.path}-${index}`}
                accessibilityLabel={name}
                previewIndex={previewIndex >= 0 ? previewIndex : undefined}
                previewItems={imagePreviewItems}
                scope="proyek-review"
                sourceUri={url}
                style={styles.reviewThumbImage}
              />
            );
          }
          return (
            <Pressable
              key={`${file.path}-${index}`}
              disabled={!url}
              onPress={() => openProyekReviewFile(file, gallery)}
              style={styles.reviewThumbFile}
            >
              <Text style={styles.reviewThumbFileKind}>
                {isProyekReviewPdfFile(file) ? 'PDF' : 'Berkas'}
              </Text>
              <Text numberOfLines={2} style={styles.reviewThumbFileName}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ReviewSubmissionCard({
  filesLabel = 'File',
  roundNumber,
  submission,
}: {
  filesLabel?: string;
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
      <ReviewFileThumbGrid
        files={submission.files}
        filesLabel={filesLabel}
        gallery={gallery}
      />
      <ReviewFileThumbGrid
        files={submission.clientAttachments}
        filesLabel="Referensi dari client"
        gallery={gallery}
      />
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
    minHeight: 0,
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
  cellPressable: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
  },
  centerBadge: {
    alignSelf: 'center',
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
  cellMetaCenter: {
    color: V.colors.mutedFg,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
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
    alignItems: 'stretch',
    gap: 14,
    paddingBottom: 28,
    width: '100%',
  },
  summaryBodyStack: {
    gap: 8,
  },
  reviewTwinCard: {
    alignSelf: 'stretch',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: '100%',
  },
  reviewTwinHeader: {
    gap: 4,
  },
  reviewTwinTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  reviewTwinDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  reviewTwinRow: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  reviewTwinPane: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: 10,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  reviewTwinPaneTitle: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  reviewFileBlock: {
    gap: 6,
  },
  reviewThumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewThumbImage: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 88,
    width: 88,
  },
  reviewThumbFile: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    height: 88,
    justifyContent: 'center',
    paddingHorizontal: 6,
    width: 88,
  },
  reviewThumbFileKind: {
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '700',
  },
  reviewThumbFileName: {
    color: V.colors.mutedFg,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  reviewPickThumbWrap: {
    gap: 6,
    width: 88,
  },
  summaryFieldStack: {
    gap: 2,
  },
  summaryFieldPrimary: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  summaryFieldSecondary: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  bahanCard: {
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  bahanHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  bahanHeaderCopy: {
    flex: 1,
    gap: 4,
    minWidth: 180,
  },
  bahanTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  bahanDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  bahanList: {
    gap: 10,
  },
  bahanItemCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bahanItemTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  bahanItemTitleBlock: {
    flex: 1,
    gap: 2,
    minWidth: 140,
  },
  bahanSubMeta: {
    color: V.colors.mutedFg,
    fontSize: 11,
    marginTop: 2,
  },
  bahanItemMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bahanItemMeta: {
    flexGrow: 1,
    gap: 2,
    minWidth: 96,
  },
  bahanMetaLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  bahanMetaValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  bahanAllocBlock: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingTop: 8,
  },
  bahanAllocLine: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
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
    alignSelf: 'stretch',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },
  bodyRow: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    width: '100%',
  },
  mainPane: {
    flex: 2,
    flexBasis: 420,
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
    flexBasis: 280,
    minHeight: 0,
    minWidth: 240,
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
  hppCard: {
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  hppHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  hppHeaderCopy: {
    flex: 1,
    gap: 4,
    minWidth: 180,
  },
  hppTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  hppDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  hppTable: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 640,
    overflow: 'hidden',
  },
  hppTableHead: {
    backgroundColor: V.colors.mutedSoft,
  },
  hppTableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  hppTh: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  hppTd: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  hppProductName: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  hppLockedHint: {
    color: V.colors.mutedFg,
    fontSize: 11,
    marginTop: 2,
  },
  hppColProduct: {
    minWidth: 180,
    width: 220,
  },
  hppColQty: {
    minWidth: 72,
    width: 88,
  },
  hppColCost: {
    minWidth: 110,
    width: 130,
  },
  hppColSub: {
    minWidth: 110,
    textAlign: 'right',
    width: 120,
  },
  hppColAction: {
    minWidth: 88,
    width: 96,
  },
  hppTotal: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  dpConfirmRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressEditor: {
    gap: 10,
    marginTop: 4,
  },
  progressCard: {
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  progressTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  progressCurrent: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  progressTrack: {
    backgroundColor: V.colors.border,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  progressInputRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressPercentField: {
    gap: 4,
    minWidth: 96,
    width: 110,
  },
  progressNoteField: {
    flexGrow: 1,
    gap: 4,
    minWidth: 160,
  },
  progressHistoryScrollView: {
    maxHeight: 128,
  },
  progressHistoryScroll: {
    gap: 6,
    paddingTop: 4,
  },
  progressHistoryRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressHistoryPercent: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  progressHistoryNote: {
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontSize: 13,
  },
  progressHistoryAt: {
    color: V.colors.mutedFg,
    fontSize: 11,
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
