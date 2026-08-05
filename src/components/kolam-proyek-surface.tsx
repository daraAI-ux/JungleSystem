import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamProyekDpRowStatusLabel,
  formatKolamProyekItemTypeLabel,
  formatKolamProyekLifecycleLabel,
  formatKolamProyekPaymentModeLabel,
  getKolamProyekDpRowOutstanding,
  getKolamProyekDpRowStatusIntent,
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
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import {
  KolamDetailMetaStrip,
  KolamDetailMetaStripItem,
  kolamDetailMetaStripStyles,
} from './kolam-detail-meta-strip';
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
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamProyekQuotationForm } from './kolam-proyek-quotation-form';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
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
  const [startWorkOpen, setStartWorkOpen] = useState(false);
  const [startWorkNote, setStartWorkNote] = useState('Mulai pengerjaan');
  const [confirmDpIndex, setConfirmDpIndex] = useState<number | null>(null);
  const [confirmDpAmount, setConfirmDpAmount] = useState('');
  const [confirmDpNote, setConfirmDpNote] = useState('');

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
  const dpActionsActive = controller.canConfirmDp;
  const showProgress =
    getKolamProyekSectionVisibility(
      detail.lifecycleStatus,
      'progressUpdate',
    ) !== 'hidden';
  const cost = detail.costBreakdown;
  const clientContact = [detail.clientEmail, detail.clientPhone]
    .filter(Boolean)
    .join(' · ');
  const confirmDpRow =
    confirmDpIndex == null
      ? null
      : detail.dpSchedule.find(row => row.index === confirmDpIndex) ?? null;

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
            {controller.canCancel ? (
              <KolamButton
                disabled={controller.acting}
                intent="outline"
                label="Batalkan"
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

      <ScrollView contentContainerStyle={styles.detailContent}>
        <KolamDetailMetaStrip>
          <KolamDetailMetaStripItem label="Status">
            <KolamStatusBadge
              intent={getKolamProyekLifecycleIntent(detail.lifecycleStatus)}
              label={formatKolamProyekLifecycleLabel(detail.lifecycleStatus)}
            />
          </KolamDetailMetaStripItem>
          <KolamDetailMetaStripItem label="Pelanggan">
            <Text style={kolamDetailMetaStripStyles.stripValue}>
              {detail.clientName}
            </Text>
          </KolamDetailMetaStripItem>
          <KolamDetailMetaStripItem label="PIC">
            <Text style={kolamDetailMetaStripStyles.stripValue}>
              {detail.designerName}
            </Text>
          </KolamDetailMetaStripItem>
          <KolamDetailMetaStripItem label="Pembayaran">
            <Text style={kolamDetailMetaStripStyles.stripValue}>
              {formatKolamProyekPaymentModeLabel(detail.paymentMode)}
            </Text>
          </KolamDetailMetaStripItem>
          <KolamDetailMetaStripItem label="Nilai kontrak">
            <Text
              style={[
                kolamDetailMetaStripStyles.stripValue,
                styles.tabular,
              ]}
            >
              {formatRupiah(cost.contractValue)}
            </Text>
          </KolamDetailMetaStripItem>
          {showProgress ? (
            <KolamDetailMetaStripItem label="Progress">
              <Text
                style={[
                  kolamDetailMetaStripStyles.stripValue,
                  styles.tabular,
                ]}
              >
                {Math.round(detail.progressPercent)}%
              </Text>
            </KolamDetailMetaStripItem>
          ) : null}
        </KolamDetailMetaStrip>

        <DetailSection title="Ringkasan kontrak">
          <Text style={styles.metaText}>
            Klien: {detail.clientName}
            {clientContact ? ` · ${clientContact}` : ''}
          </Text>
          <Text style={styles.metaText}>PIC: {detail.designerName}</Text>
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
          <View style={styles.metricGrid}>
            <Metric label="Nilai kontrak" value={formatRupiah(cost.contractValue)} />
            <Metric label="Produk toko" value={formatRupiah(cost.produkToko)} />
            <Metric
              label="UE / bahan"
              value={formatRupiah(cost.bahanTambahan + cost.ongkir)}
            />
            <Metric label="VAR" value={formatRupiah(cost.varAmount)} />
          </View>
        </DetailSection>

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

        {showHpp ? (
          <DetailSection title="HPP / produk toko">
            {detail.hppMaterials.length === 0 && detail.hppManual <= 0 ? (
              <Text style={styles.metaText}>Belum ada baris HPP.</Text>
            ) : (
              <>
                {detail.hppMaterials.map(line => (
                  <View key={line.id} style={styles.listRow}>
                    <Text style={styles.primaryText}>{line.label}</Text>
                    <Text style={styles.metaText}>
                      {line.quantity} × {formatRupiah(line.unitCost)} ={' '}
                      {formatRupiah(line.subtotal)}
                    </Text>
                  </View>
                ))}
                {detail.hppManual > 0 ? (
                  <Text style={styles.metaText}>
                    HPP manual: {formatRupiah(detail.hppManual)}
                  </Text>
                ) : null}
                <Text style={styles.primaryText}>
                  Total HPP: {formatRupiah(detail.hppTotal || cost.totalHpp)}
                </Text>
              </>
            )}
          </DetailSection>
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
                </Text>
                <Text style={styles.metaText}>
                  PIC: {detail.commissionConfig.designerType}{' '}
                  {detail.commissionConfig.designerType === 'percentage'
                    ? `${detail.commissionConfig.designerValue}%`
                    : formatRupiah(detail.commissionConfig.designerValue)}
                </Text>
              </>
            ) : (
              <Text style={styles.metaText}>Konfigurasi komisi belum diisi.</Text>
            )}
          </DetailSection>
        ) : null}

        {showDp ? (
          <DetailSection title="Jadwal DP">
            {detail.dpAmount > 0 ? (
              <Text style={styles.metaText}>
                DP awal: {formatRupiah(detail.dpAmount)}
              </Text>
            ) : null}
            {detail.dpSchedule.map(row => {
              const outstanding = getKolamProyekDpRowOutstanding(row);
              const canConfirmRow =
                dpActionsActive && !row.paidAt && outstanding > 0;
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
                    {outstanding > 0 && !row.paidAt
                      ? ` · sisa ${formatRupiah(outstanding)}`
                      : ''}
                    {row.paidAt
                      ? ` · lunas ${formatShortDate(row.paidAt)}`
                      : row.dueAt
                        ? ` · jatuh tempo ${formatShortDate(row.dueAt)}`
                        : ''}
                  </Text>
                  {row.kwitansiNumber ? (
                    <Text style={styles.metaText}>
                      Kwitansi: {row.kwitansiNumber}
                    </Text>
                  ) : null}
                  {canConfirmRow ? (
                    <KolamButton
                      disabled={controller.acting}
                      label="Konfirmasi dana masuk"
                      onPress={() => {
                        setConfirmDpIndex(row.index);
                        setConfirmDpAmount(String(outstanding));
                        setConfirmDpNote('');
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
          </DetailSection>
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

        <DetailSection title="Tautan terkait">
          {detail.linkedTask ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                onRouteChange?.(`/task-manager/${detail.linkedTask!.id}`)
              }
            >
              <Text style={styles.linkText}>
                Tugas: {detail.linkedTask.title} · {detail.linkedTask.status}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.metaText}>Belum ada tugas operasional.</Text>
          )}
          {detail.saleId ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => onRouteChange?.(`/sales/${detail.saleId}`)}
            >
              <Text style={styles.linkText}>
                Penjualan: {detail.saleInvoiceCode || detail.saleId}
                {detail.saleStatus ? ` · ${detail.saleStatus}` : ''}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.metaText}>
              Penjualan final belum dibuat (setelah close).
            </Text>
          )}
        </DetailSection>

        <Text style={styles.hintText}>
          Mutasi desain / delivery / close dilanjutkan di batch P4.
        </Text>
      </ScrollView>

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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
  rowPress: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
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
    gap: 14,
    paddingBottom: 28,
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
  historyBlock: {
    gap: 4,
    marginTop: 4,
  },
  linkText: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  hintText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    marginTop: 4,
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
