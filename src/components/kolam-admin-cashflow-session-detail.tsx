import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  formatAdminCashflowOpenedBy,
  formatAdminCashflowSourceLabel,
  formatAdminCashflowStatusLabel,
  formatAdminCashflowWindowLabel,
  formatDepositStatusLabel,
  formatInvoiceConfirmStatusLabel,
  getAdminCashflowStatusIntent,
  getDepositStatusIntent,
  getInvoiceConfirmStatusIntent,
  isCashInvoiceGroup,
  isConfirmableCashflowSource,
  KOLAM_ADMIN_CASHFLOW_SESSION_ROOT,
  type KolamAdminCashflowDeposit,
  type KolamAdminCashflowDetailTab,
  type KolamAdminCashflowInvoiceGroup,
  type KolamAdminCashflowInvoiceReviewFilter,
} from '../domain/kolam-admin-cashflow-session';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  buildDepositDraftFromCandidates,
  useKolamAdminCashflowSessionDetailController,
  type KolamAdminCashflowDepositDraftAllocation,
  type KolamAdminCashflowSessionDetailController,
} from '../hooks/use-kolam-admin-cashflow-session-detail-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamControlTabList } from './kolam-control-tab-list';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamStatusBadge } from './kolam-status-badge';

const DETAIL_TABS: Array<{ id: KolamAdminCashflowDetailTab; label: string }> = [
  { id: 'overview', label: 'Ringkasan' },
  { id: 'review', label: 'Tinjauan' },
  { id: 'deposits', label: 'Setoran' },
];

const INVOICE_FILTERS: Array<{
  id: KolamAdminCashflowInvoiceReviewFilter;
  label: string;
}> = [
  { id: 'pending', label: 'Menunggu' },
  { id: 'confirmed', label: 'Dikonfirmasi' },
  { id: 'rejected', label: 'Ditolak' },
  { id: 'all', label: 'Semua' },
];

const INVOICE_FILTER_EMPTY_LABEL: Record<
  KolamAdminCashflowInvoiceReviewFilter,
  string
> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  rejected: 'Ditolak',
  all: 'Semua',
};

/**
 * Admin cashflow session detail — FE `/cashflow-session/[id]`.
 * Tabs: Overview + lifecycle, by-invoice review, deposits.
 */
export function KolamAdminCashflowSessionDetail({
  documentId,
  onRouteChange,
}: {
  documentId: string | null;
  onRouteChange?: (route: string) => void;
}) {
  const controller = useKolamAdminCashflowSessionDetailController(documentId);
  const [closeOpen, setCloseOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [rejectTarget, setRejectTarget] =
    useState<KolamAdminCashflowInvoiceGroup | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  return (
    <View style={styles.root}>
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

      <DetailHeader
        controller={controller}
        onBack={() => onRouteChange?.(KOLAM_ADMIN_CASHFLOW_SESSION_ROOT)}
        onClose={() => setCloseOpen(true)}
        onRecheck={() => {
          void controller.onRecheckSession();
        }}
        onVoid={() => setVoidOpen(true)}
      />

      <KolamControlTabList
        accessibilityLabel="Tab detail sesi tunai"
        items={DETAIL_TABS.map(tab => ({
          id: tab.id,
          label: tab.label,
          count:
            tab.id === 'review'
              ? controller.reviewSummary.unconfirmedCount
              : tab.id === 'deposits'
                ? controller.deposits.length
                : undefined,
        }))}
        onSelect={id =>
          controller.setActiveTab(id as KolamAdminCashflowDetailTab)
        }
        selectedId={controller.activeTab}
      />

      {controller.loading && !controller.session ? (
        <KolamEmptyState
          message="Memuat detail sesi…"
          title="Memuat"
        />
      ) : null}

      {!controller.loading && !controller.session ? (
        <KolamEmptyState
          message="Sesi tidak ditemukan atau gagal dimuat."
          title="Tidak ada sesi"
        />
      ) : null}

      {controller.session && controller.activeTab === 'overview' ? (
        <OverviewTab controller={controller} />
      ) : null}

      {controller.session && controller.activeTab === 'review' ? (
        <ReviewTab
          controller={controller}
          expandedSaleId={expandedSaleId}
          onExpandSale={setExpandedSaleId}
          onOpenDeposit={() => setDepositOpen(true)}
          onReject={group => {
            setRejectTarget(group);
            setRejectNote('');
          }}
        />
      ) : null}

      {controller.session && controller.activeTab === 'deposits' ? (
        <DepositsTab controller={controller} />
      ) : null}

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel={controller.acting ? 'Menutup…' : 'Tutup sesi'}
        message="Sesi akan dikunci. Penjualan baru di jendela ini tidak lagi masuk sesi ini."
        onCancel={() => setCloseOpen(false)}
        onConfirm={() => {
          void controller.onCloseSession().then(ok => {
            if (ok) {
              setCloseOpen(false);
            }
          });
        }}
        title="Tutup sesi tunai?"
        visible={closeOpen}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setVoidOpen(false)}
        transparent
        visible={voidOpen}
      >
        <View style={styles.modalOverlay}>
          <KolamModalBackdrop onPress={() => setVoidOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Batalkan sesi</Text>
            <Text style={styles.modalHint}>
              Semua entri yang belum dikonfirmasi akan ditolak otomatis. Saldo
              dompet tidak berubah. Tindakan ini tidak bisa dibatalkan.
            </Text>
            <KolamFormTextField
              multiline
              numberOfLines={4}
              onChangeText={setVoidReason}
              placeholder="Alasan pembatalan (min 10 karakter)"
              style={styles.multiline}
              value={voidReason}
            />
            <Text style={styles.metaText}>
              {voidReason.trim().length}/10 karakter
            </Text>
            <View style={styles.modalActions}>
              <KolamCancelButton
                muted
                onPress={() => {
                  setVoidOpen(false);
                  setVoidReason('');
                }}
              />
              <KolamButton
                disabled={
                  controller.acting || voidReason.trim().length < 10
                }
                intent="danger"
                label={controller.acting ? 'Memproses…' : 'Konfirmasi pembatalan'}
                onPress={() => {
                  void controller.onVoidSession(voidReason).then(ok => {
                    if (ok) {
                      setVoidOpen(false);
                      setVoidReason('');
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
        onRequestClose={() => setRejectTarget(null)}
        transparent
        visible={Boolean(rejectTarget)}
      >
        <View style={styles.modalOverlay}>
          <KolamModalBackdrop onPress={() => setRejectTarget(null)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Tolak {rejectTarget?.invoiceCode || 'invoice'}
            </Text>
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setRejectNote}
              placeholder="Catatan wajib"
              style={styles.multiline}
              value={rejectNote}
            />
            <View style={styles.modalActions}>
              <KolamCancelButton
                muted
                onPress={() => setRejectTarget(null)}
              />
              <KolamButton
                disabled={controller.acting || !rejectNote.trim()}
                intent="danger"
                label={controller.acting ? 'Memproses…' : 'Tolak'}
                onPress={() => {
                  if (!rejectTarget?.saleId) {
                    return;
                  }
                  void controller
                    .onRejectInvoice(rejectTarget.saleId, rejectNote)
                    .then(ok => {
                      if (ok) {
                        setRejectTarget(null);
                        setRejectNote('');
                      }
                    });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <DepositSubmitModal
        controller={controller}
        onClose={() => setDepositOpen(false)}
        visible={depositOpen}
      />
    </View>
  );
}

function DetailHeader({
  controller,
  onBack,
  onClose,
  onRecheck,
  onVoid,
}: {
  controller: KolamAdminCashflowSessionDetailController;
  onBack: () => void;
  onClose: () => void;
  onRecheck: () => void;
  onVoid: () => void;
}) {
  const session = controller.session;
  return (
    <KolamCardFrame style={styles.headerCard} variant="compact">
      <View style={styles.headerTop}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {session?.name || 'Detail sesi tunai'}
          </Text>
          {session ? (
            <View style={styles.headerMetaRow}>
              <KolamStatusBadge
                intent={getAdminCashflowStatusIntent(session.status)}
                label={formatAdminCashflowStatusLabel(session.status)}
              />
              <Text style={styles.metaText}>
                {formatAdminCashflowWindowLabel(session)}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.headerActions}>
          <KolamDaftarButton muted onPress={onBack} />
          <KolamRefreshButton
            accessibilityLabel="Muat ulang"
            disabled={controller.loading || controller.acting}

            onPress={() => {
              void controller.onRefresh();
            }}
          />
          {controller.canClose ? (
            <KolamButton
              disabled={controller.acting}
              intent="primary"
              label="Tutup"
              onPress={onClose}
            />
          ) : null}
          {controller.canRecheck ? (
            <KolamButton
              disabled={controller.acting}
              label="Periksa ulang"
              onPress={onRecheck}
            />
          ) : null}
          {controller.canVoid ? (
            <KolamButton
              disabled={controller.acting}
              intent="danger"
              label="Batalkan"
              onPress={onVoid}
            />
          ) : null}
        </View>
      </View>
    </KolamCardFrame>
  );
}

function OverviewTab({
  controller,
}: {
  controller: KolamAdminCashflowSessionDetailController;
}) {
  const session = controller.session;
  if (!session) {
    return null;
  }
  const summary = controller.reviewSummary;
  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.tabBody}>
      <View style={styles.overviewGrid}>
        <KolamCardFrame style={styles.infoCard} variant="compact">
          <Text style={styles.sectionTitle}>Informasi sesi</Text>
          <InfoRow
            label="Status"
            value={formatAdminCashflowStatusLabel(session.status)}
          />
          <InfoRow
            label="Sumber"
            value={formatAdminCashflowSourceLabel(session.source)}
          />
          <InfoRow
            label="Dibuka oleh"
            value={formatAdminCashflowOpenedBy(
              session.openedBy,
              session.source,
            )}
          />
          <InfoRow
            label="Jendela"
            value={formatAdminCashflowWindowLabel(session)}
          />
          {session.snapshot ? (
            <>
              <InfoRow
                label="Total penjualan"
                value={String(session.snapshot.totalSalesCount)}
              />
              <InfoRow
                label="Total nominal"
                value={formatRupiah(session.snapshot.totalSalesAmount)}
              />
            </>
          ) : null}
        </KolamCardFrame>

        <KolamCardFrame style={styles.infoCard} variant="compact">
          <Text style={styles.sectionTitle}>Ringkasan belum dikonfirmasi</Text>
          <InfoRow
            label="Entri"
            value={String(summary.unconfirmedCount)}
          />
          <InfoRow label="Tunai" value={formatRupiah(summary.cashTotal)} />
          <InfoRow
            label="Non-tunai"
            value={formatRupiah(summary.nonCashTotal)}
          />
          <InfoRow
            label="Total"
            value={formatRupiah(summary.totalUnconfirmed)}
          />
        </KolamCardFrame>
      </View>
    </KolamDetailScrollSurface>
  );
}

function ReviewTab({
  controller,
  expandedSaleId,
  onExpandSale,
  onOpenDeposit,
  onReject,
}: {
  controller: KolamAdminCashflowSessionDetailController;
  expandedSaleId: string | null;
  onExpandSale: (saleId: string | null) => void;
  onOpenDeposit: () => void;
  onReject: (group: KolamAdminCashflowInvoiceGroup) => void;
}) {
  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.tabBody}>
      <View style={styles.reviewToolbar}>
        <Text style={styles.sectionTitle}>
          Tinjauan per invoice · {controller.reviewSummary.unconfirmedCount}{' '}
          belum dikonfirmasi
        </Text>
        <View style={styles.headerActions}>
          {controller.canConfirmAll ? (
            <KolamButton
              disabled={controller.acting}
              label="Konfirmasi semua non-tunai"
              onPress={() => {
                void controller.onConfirmAllNonCash();
              }}
            />
          ) : null}
          {controller.canSubmitDeposit ? (
            <KolamButton
              disabled={controller.acting}
              intent="primary"
              label="Kirim setoran"
              onPress={onOpenDeposit}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.filterChips}>
        {INVOICE_FILTERS.map(filter => (
          <KolamButton
            intent={
              controller.invoiceFilter === filter.id ? 'primary' : 'outline'
            }
            key={filter.id}
            label={`${filter.label} (${controller.invoiceFilterCounts[filter.id]})`}
            onPress={() => controller.setInvoiceFilter(filter.id)}
            style={styles.chipButton}
          />
        ))}
      </View>

      {controller.filteredInvoiceGroups.length === 0 ? (
        <KolamEmptyState
          message={`Tidak ada invoice di filter "${INVOICE_FILTER_EMPTY_LABEL[controller.invoiceFilter]}".`}
          title="Kosong"
        />
      ) : (
        controller.filteredInvoiceGroups.map((group, index) => {
          const key = group.saleId || `unlinked-${index}`;
          const expanded = expandedSaleId === group.saleId;
          const isCash = isCashInvoiceGroup(group);
          const isPending =
            group.confirmStatus === 'unconfirmed' ||
            group.confirmStatus === 'partial';
          const canAct =
            !controller.readOnlyReview &&
            Boolean(group.saleId) &&
            isPending &&
            !isCash;

          return (
            <KolamCardFrame
              key={key}
              style={styles.invoiceCard}
              variant="compact"
            >
              <Pressable
                onPress={() =>
                  onExpandSale(expanded ? null : group.saleId)
                }
              >
                <View style={styles.invoiceHeader}>
                  <View style={styles.headerText}>
                    <Text style={styles.invoiceCode}>
                      {group.invoiceCode || '(tanpa kode)'}
                    </Text>
                    <Text style={styles.metaText}>
                      {isCash ? 'Tunai' : 'Non-tunai'} · bersih{' '}
                      {formatRupiah(group.netAmount)}
                    </Text>
                  </View>
                  <KolamStatusBadge
                    intent={getInvoiceConfirmStatusIntent(group.confirmStatus)}
                    label={formatInvoiceConfirmStatusLabel(group.confirmStatus)}
                  />
                </View>
              </Pressable>

              {canAct ? (
                <View style={styles.invoiceActions}>
                  <KolamButton
                    disabled={controller.acting}
                    intent="primary"
                    label="Setujui"
                    onPress={() => {
                      if (group.saleId) {
                        void controller.onConfirmInvoice(group.saleId);
                      }
                    }}
                  />
                  <KolamButton
                    disabled={controller.acting}
                    intent="danger"
                    label="Tolak"
                    onPress={() => onReject(group)}
                  />
                </View>
              ) : null}

              {isCash && isPending && !controller.readOnlyReview ? (
                <Text style={styles.metaText}>
                  Invoice tunai diselesaikan lewat Kirim setoran.
                </Text>
              ) : null}

              {expanded ? (
                <View style={styles.entryList}>
                  {group.entries.map(entry => (
                    <View key={entry.id} style={styles.entryRow}>
                      <Text style={styles.entryMain}>
                        {entry.type === 'credit' ? 'kredit' : 'debit'} ·{' '}
                        {entry.source} · {formatRupiah(entry.amount)}
                      </Text>
                      <Text style={styles.metaText}>
                        {entry.walletName} ·{' '}
                        {formatInvoiceConfirmStatusLabel(entry.confirmStatus)}
                        {!isConfirmableCashflowSource(entry.source)
                          ? ' · komisi (dikecualikan)'
                          : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </KolamCardFrame>
          );
        })
      )}
    </KolamDetailScrollSurface>
  );
}

function DepositsTab({
  controller,
}: {
  controller: KolamAdminCashflowSessionDetailController;
}) {
  if (controller.deposits.length === 0) {
    return (
      <View style={styles.tabBody}>
        <KolamEmptyState
          message="Belum ada setoran untuk sesi ini."
          title="Tidak ada setoran"
        />
      </View>
    );
  }

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.tabBody}>
      {controller.deposits.map(deposit => (
        <DepositCard
          acting={controller.acting}
          deposit={deposit}
          key={deposit.id}
          onVerify={() => {
            void controller.onVerifyDeposit(deposit);
          }}
          sessionLocked={controller.session?.status === 'locked'}
        />
      ))}
    </KolamDetailScrollSurface>
  );
}

function DepositCard({
  acting,
  deposit,
  onVerify,
  sessionLocked,
}: {
  acting: boolean;
  deposit: KolamAdminCashflowDeposit;
  onVerify: () => void;
  sessionLocked: boolean;
}) {
  const canVerify =
    (deposit.status === 'submitted' || deposit.status === 'in-review') &&
    (deposit.source === 'pos' || sessionLocked);

  return (
    <KolamCardFrame style={styles.depositCard} variant="compact">
      <View style={styles.invoiceHeader}>
        <View style={styles.headerText}>
          <Text style={styles.metaText}>
            {deposit.source === 'pos' ? 'Setoran POS' : 'Setoran tunai'}
          </Text>
          <Text style={styles.depositAmount}>
            {formatRupiah(deposit.headlineAmount)}
          </Text>
          {deposit.fromWalletName || deposit.toWalletName ? (
            <Text style={styles.metaText}>
              {deposit.fromWalletName || '—'} → {deposit.toWalletName || '—'}
            </Text>
          ) : null}
        </View>
        <KolamStatusBadge
          intent={getDepositStatusIntent(deposit.status)}
          label={formatDepositStatusLabel(deposit.status)}
        />
      </View>
      {deposit.allocationCount > 0 ? (
        <Text style={styles.metaText}>
          {deposit.allocationCount} invoice · selisih kurang{' '}
          {formatRupiah(deposit.totalShortageIdr)}
        </Text>
      ) : null}
      {deposit.note ? (
        <Text style={styles.metaText}>“{deposit.note}”</Text>
      ) : null}
      {canVerify ? (
        <KolamButton
          disabled={acting}
          intent="primary"
          label="Verifikasi"
          onPress={onVerify}
        />
      ) : null}
    </KolamCardFrame>
  );
}

function DepositSubmitModal({
  controller,
  onClose,
  visible,
}: {
  controller: KolamAdminCashflowSessionDetailController;
  onClose: () => void;
  visible: boolean;
}) {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [note, setNote] = useState('');
  const [allocations, setAllocations] = useState<
    KolamAdminCashflowDepositDraftAllocation[]
  >([]);

  React.useEffect(() => {
    if (!visible) {
      return;
    }
    setAllocations(
      buildDepositDraftFromCandidates(controller.cashInvoiceCandidates),
    );
    setFromWallet(controller.cashWallets[0]?.id || '');
    setToWallet(controller.nonCashWallets[0]?.id || '');
    setNote('');
  }, [
    controller.cashInvoiceCandidates,
    controller.cashWallets,
    controller.nonCashWallets,
    visible,
  ]);

  const cashOptions = useMemo(
    () =>
      controller.cashWallets.map(wallet => ({
        label: wallet.name,
        value: wallet.id,
      })),
    [controller.cashWallets],
  );
  const nonCashOptions = useMemo(
    () =>
      controller.nonCashWallets.map(wallet => ({
        label: wallet.name,
        value: wallet.id,
      })),
    [controller.nonCashWallets],
  );

  const toggleAllocation = (saleId: string) => {
    setAllocations(current => {
      const exists = current.some(item => item.saleId === saleId);
      if (exists) {
        return current.filter(item => item.saleId !== saleId);
      }
      const candidate = controller.cashInvoiceCandidates.find(
        group => group.saleId === saleId,
      );
      if (!candidate?.saleId) {
        return current;
      }
      const draft = buildDepositDraftFromCandidates([candidate])[0];
      return draft ? [...current, draft] : current;
    });
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <KolamModalBackdrop onPress={onClose} />
        <View style={[styles.modalCard, styles.depositModalCard]}>
          <ScrollView>
            <Text style={styles.modalTitle}>Kirim setoran tunai</Text>
            <Text style={styles.modalHint}>
              Pilih invoice tunai, isi nominal aktual, lalu kirim setoran.
            </Text>

            {cashOptions.length > 0 ? (
              <KolamDropdownSelect
                label="Dari (tunai)"
                onChange={setFromWallet}
                options={cashOptions}
                value={fromWallet || cashOptions[0]?.value || ''}
              />
            ) : (
              <Text style={styles.metaText}>Tidak ada dompet tunai.</Text>
            )}

            {nonCashOptions.length > 0 ? (
              <KolamDropdownSelect
                label="Ke (non-tunai)"
                onChange={setToWallet}
                options={nonCashOptions}
                value={toWallet || nonCashOptions[0]?.value || ''}
              />
            ) : (
              <Text style={styles.metaText}>Tidak ada dompet non-tunai.</Text>
            )}

            <Text style={styles.fieldLabel}>Invoice tunai</Text>
            {controller.cashInvoiceCandidates.length === 0 ? (
              <Text style={styles.metaText}>
                Tidak ada invoice tunai yang menunggu.
              </Text>
            ) : (
              controller.cashInvoiceCandidates.map(group => {
                const selected = allocations.some(
                  item => item.saleId === group.saleId,
                );
                const draft = allocations.find(
                  item => item.saleId === group.saleId,
                );
                return (
                  <View
                    key={group.saleId || group.invoiceCode}
                    style={styles.allocRow}
                  >
                    <KolamButton
                      intent={selected ? 'primary' : 'outline'}
                      label={
                        selected
                          ? `✓ ${group.invoiceCode || group.saleId}`
                          : group.invoiceCode || group.saleId || 'Invoice'
                      }
                      onPress={() => {
                        if (group.saleId) {
                          toggleAllocation(group.saleId);
                        }
                      }}
                    />
                    {selected && draft ? (
                      <KolamFormTextField
                        mode="numeric"
                        onChangeText={value => {
                          setAllocations(current =>
                            current.map(item =>
                              item.saleId === draft.saleId
                                ? { ...item, actualAmountIdr: value }
                                : item,
                            ),
                          );
                        }}
                        placeholder="Nominal aktual"
                        value={draft.actualAmountIdr}
                      />
                    ) : null}
                  </View>
                );
              })
            )}

            <KolamFormTextField
              multiline
              numberOfLines={2}
              onChangeText={setNote}
              placeholder="Catatan (opsional)"
              style={styles.multiline}
              value={note}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <KolamCancelButton muted onPress={onClose} />
            <KolamButton
              disabled={
                controller.acting ||
                !fromWallet ||
                !toWallet ||
                allocations.length === 0
              }
              intent="primary"
              label={controller.acting ? 'Mengirim…' : 'Kirim setoran'}
              onPress={() => {
                void controller
                  .onSubmitDirectDeposit({
                    fromWallet,
                    toWallet,
                    note: note.trim() || undefined,
                    allocations: allocations.map(item => ({
                      saleId: item.saleId,
                      actualAmountIdr: Number(item.actualAmountIdr) || 0,
                      note: item.note || undefined,
                    })),
                  })
                  .then(ok => {
                    if (ok) {
                      onClose();
                    }
                  });
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.metaText}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  banner: {
    alignSelf: 'flex-start',
  },
  headerCard: {
    gap: 8,
    padding: 12,
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  headerTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
  },
  headerMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tabBody: {
    gap: 12,
    paddingBottom: 24,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: 280,
    gap: 8,
    padding: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoValue: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipButton: {
    minHeight: 32,
    paddingHorizontal: 10,
  },
  invoiceCard: {
    gap: 8,
    padding: 12,
  },
  invoiceHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  invoiceCode: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 6,
  },
  entryList: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
    paddingTop: 8,
  },
  entryRow: {
    gap: 2,
  },
  entryMain: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
  },
  depositCard: {
    gap: 8,
    padding: 12,
  },
  depositAmount: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxHeight: '86%',
    maxWidth: '92%',
    padding: 16,
    width: 480,
  },
  depositModalCard: {
    width: 560,
  },
  modalTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
  },
  modalHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  allocRow: {
    gap: 6,
    marginBottom: 8,
  },
});
