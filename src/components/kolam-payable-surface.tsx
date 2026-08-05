import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamPayableSourceLabel,
  formatKolamPayableStatusLabel,
  getKolamPayableStatusIntent,
  KOLAM_PAYABLE_INSTALLMENT_DUE_OPTIONS,
  KOLAM_PAYABLE_PERIOD_OPTIONS,
  KOLAM_PAYABLE_ROOT,
  KOLAM_PAYABLE_SOURCE_OPTIONS,
  KOLAM_PAYABLE_SORT_OPTIONS,
  KOLAM_PAYABLE_STATUS_OPTIONS,
  type KolamPayable,
  type KolamPayableInstallmentDueFilter,
  type KolamPayableInstallmentSummary,
  type KolamPayablePeriodFilter,
  type KolamPayableSourceModel,
  type KolamPayableSortOption,
  type KolamPayableStatus,
} from '../domain/kolam-payable';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamPayableController,
  type KolamPayableController,
} from '../hooks/use-kolam-payable-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDateField } from './kolam-date-field';
import { KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const LIST_COLUMNS = [
  { id: 'code', label: 'Kode', flex: 0.9 },
  { id: 'name', label: 'Nama', flex: 1.2 },
  { id: 'source', label: 'Sumber', flex: 0.7 },
  { id: 'amount', label: 'Nominal', flex: 1 },
  { id: 'due', label: 'Jatuh tempo', flex: 1 },
  { id: 'installments', label: 'Cicilan', flex: 1.15 },
  { id: 'status', label: 'Status', flex: 0.9 },
  { id: 'action', label: '', flex: 0.8 },
] as const;

const FILTER_PANEL_WIDTH = 220;

export function KolamPayableSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamPayableController(route);

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState compact title="Akses ditolak" />
      </View>
    );
  }

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
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      {controller.mode === 'list' ? (
        <>
          <PayableSummaryCards controller={controller} />
          <PayableToolbar controller={controller} />
          <PayableList
            controller={controller}
            onRouteChange={onRouteChange}
          />
        </>
      ) : null}

      {controller.mode === 'detail' ? (
        <PayableDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}
    </View>
  );
}

function PayableSummaryCards({
  controller,
}: {
  controller: KolamPayableController;
}) {
  const summary = controller.summary;
  const openCount = summary?.open.count ?? 0;
  const overdueCount = summary?.overdue.count ?? 0;
  const cards = [
    {
      id: 'overdue',
      label: 'Lewat jatuh tempo',
      value: summary?.overdue.totalAmount ?? 0,
      meta: `${overdueCount}/${openCount}`,
    },
    {
      id: 'open',
      label: 'Hutang terbuka',
      value: summary?.open.outstanding ?? 0,
      meta: `${openCount}`,
    },
    {
      id: 'total',
      label: 'Total nominal',
      value: summary?.open.totalAmount ?? 0,
      meta: '',
    },
  ];

  return (
    <View style={styles.cardsRow}>
      {cards.map(card => (
        <KolamCardFrame key={card.id} style={styles.card}>
          <Text style={styles.cardLabel}>{card.label}</Text>
          <Text style={styles.cardValue}>{formatRupiah(card.value)}</Text>
          {card.meta ? (
            <Text style={styles.cardMeta}>{card.meta}</Text>
          ) : null}
        </KolamCardFrame>
      ))}
    </View>
  );
}

function PayableToolbar({
  controller,
}: {
  controller: KolamPayableController;
}) {
  const toolbarRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const sourceTriggerRef = React.useRef<View>(null);
  const installmentTriggerRef = React.useRef<View>(null);
  const periodTriggerRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [panelAnchor, setPanelAnchor] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const statusLabel =
    controller.filters.status === ''
      ? 'Status'
      : (KOLAM_PAYABLE_STATUS_OPTIONS.find(
          option => option.value === controller.filters.status,
        )?.label ?? 'Status');
  const sourceLabel =
    controller.filters.sourceModel === ''
      ? 'Sumber'
      : (KOLAM_PAYABLE_SOURCE_OPTIONS.find(
          option => option.value === controller.filters.sourceModel,
        )?.label ?? 'Sumber');
  const installmentLabel =
    controller.filters.installmentDue === 'all'
      ? 'Cicilan'
      : (KOLAM_PAYABLE_INSTALLMENT_DUE_OPTIONS.find(
          option => option.value === controller.filters.installmentDue,
        )?.label ?? 'Cicilan');
  const periodLabel =
    controller.filters.period === 'all'
      ? 'Periode'
      : (KOLAM_PAYABLE_PERIOD_OPTIONS.find(
          option => option.value === controller.filters.period,
        )?.label ?? 'Periode');
  const sortLabel =
    controller.filters.sort === 'newest'
      ? 'Sort'
      : (KOLAM_PAYABLE_SORT_OPTIONS.find(
          option => option.value === controller.filters.sort,
        )?.label ?? 'Sort');
  const hasFilters =
    Boolean(controller.filters.search.trim()) ||
    controller.filters.status !== '' ||
    controller.filters.sourceModel !== '' ||
    controller.filters.overdue ||
    controller.filters.installmentDue !== 'all' ||
    controller.filters.period !== 'all' ||
    controller.filters.startDate !== '' ||
    controller.filters.endDate !== '' ||
    controller.filters.sort !== 'newest';
  const closePanels = () => {
    setStatusOpen(false);
    setSourceOpen(false);
    setInstallmentOpen(false);
    setPeriodOpen(false);
    setSortOpen(false);
    setPanelAnchor(null);
  };
  const togglePanel = (
    isOpen: boolean,
    triggerRef: React.RefObject<View | null>,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    closePanels();
    if (isOpen) {
      return;
    }
    setOpen(true);
    requestAnimationFrame(() => {
      const toolbar = toolbarRef.current;
      const trigger = triggerRef.current;
      if (!toolbar || !trigger) {
        setPanelAnchor({ left: 0, top: 42, width: FILTER_PANEL_WIDTH });
        return;
      }
      trigger.measureLayout(
        toolbar,
        (left, top, width, height) => {
          setPanelAnchor({
            left,
            top: top + height + 6,
            width: Math.max(FILTER_PANEL_WIDTH, Math.round(width)),
          });
        },
        () => setPanelAnchor({ left: 0, top: 42, width: FILTER_PANEL_WIDTH }),
      );
    });
  };

  return (
    <View ref={toolbarRef} style={styles.toolbarWrap}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
          <KolamFormTextField
            onChangeText={controller.onSearchChange}
            placeholder="Cari kode atau nama"
            style={kolamTableToolbarStyles.searchInput}
            value={controller.filters.search}
          />
          <View ref={statusTriggerRef} collapsable={false}>
            <KolamTableFilterTrigger
              active={statusOpen || Boolean(controller.filters.status)}
              label={statusLabel}
              onPress={() =>
                togglePanel(statusOpen, statusTriggerRef, setStatusOpen)
              }
              open={statusOpen}
              style={styles.filterTrigger}
              variant="quiet"
            />
          </View>
          <View ref={sourceTriggerRef} collapsable={false}>
            <KolamTableFilterTrigger
              active={sourceOpen || Boolean(controller.filters.sourceModel)}
              label={sourceLabel}
              onPress={() =>
                togglePanel(sourceOpen, sourceTriggerRef, setSourceOpen)
              }
              open={sourceOpen}
              style={styles.filterTrigger}
              variant="quiet"
            />
          </View>
          <View ref={installmentTriggerRef} collapsable={false}>
            <KolamTableFilterTrigger
              active={
                installmentOpen || controller.filters.installmentDue !== 'all'
              }
              label={installmentLabel}
              onPress={() =>
                togglePanel(
                  installmentOpen,
                  installmentTriggerRef,
                  setInstallmentOpen,
                )
              }
              open={installmentOpen}
              style={styles.filterTrigger}
              variant="quiet"
            />
          </View>
          <View ref={periodTriggerRef} collapsable={false}>
            <KolamTableFilterTrigger
              active={periodOpen || controller.filters.period !== 'all'}
              label={periodLabel}
              onPress={() =>
                togglePanel(periodOpen, periodTriggerRef, setPeriodOpen)
              }
              open={periodOpen}
              style={styles.filterTrigger}
              variant="quiet"
            />
          </View>
          <KolamButton
            intent={controller.filters.overdue ? 'primary' : 'secondary'}
            label="Jatuh tempo"
            onPress={controller.onOverdueToggle}
            style={styles.filterTrigger}
          />
          <View ref={sortTriggerRef} collapsable={false}>
            <KolamTableFilterTrigger
              active={sortOpen || controller.filters.sort !== 'newest'}
              label={sortLabel}
              onPress={() => togglePanel(sortOpen, sortTriggerRef, setSortOpen)}
              open={sortOpen}
              style={styles.filterTrigger}
              variant="quiet"
            />
          </View>
          {controller.filters.period === 'custom' ? (
            <>
              <KolamDateField
                accessibilityLabel="Tanggal dari"
                label="Dari"
                onChange={controller.onStartDateChange}
                placeholder="Dari"
                showLabelInTrigger={false}
                style={styles.dateField}
                triggerStyle={styles.dateFieldTrigger}
                value={controller.filters.startDate}
              />
              <KolamDateField
                accessibilityLabel="Tanggal sampai"
                label="Sampai"
                onChange={controller.onEndDateChange}
                placeholder="Sampai"
                showLabelInTrigger={false}
                style={styles.dateField}
                triggerStyle={styles.dateFieldTrigger}
                value={controller.filters.endDate}
              />
            </>
          ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
          {hasFilters ? (
            <KolamButton
              intent="secondary"
              label="Reset"
              onPress={() => {
                closePanels();
                controller.onClearFilters();
              }}
              style={styles.filterTrigger}
            />
          ) : null}
          <KolamRefreshButton
            accessibilityLabel="Muat ulang"
            intent="secondary"

            onPress={() => {
              void controller.onRefresh();
            }}
            style={styles.filterTrigger}
          />
          </View>
        </View>
      </View>

      {statusOpen && panelAnchor ? (
        <FilterPanel
          activeValue={controller.filters.status}
          anchor={panelAnchor}
          onClose={() => setStatusOpen(false)}
          options={KOLAM_PAYABLE_STATUS_OPTIONS}
          onSelect={value => {
            controller.onStatusChange(value as '' | KolamPayableStatus);
            setStatusOpen(false);
          }}
        />
      ) : null}

      {sourceOpen && panelAnchor ? (
        <FilterPanel
          activeValue={controller.filters.sourceModel}
          anchor={panelAnchor}
          onClose={() => setSourceOpen(false)}
          options={KOLAM_PAYABLE_SOURCE_OPTIONS}
          onSelect={value => {
            controller.onSourceModelChange(value as '' | KolamPayableSourceModel);
            setSourceOpen(false);
          }}
        />
      ) : null}

      {installmentOpen && panelAnchor ? (
        <FilterPanel
          activeValue={controller.filters.installmentDue}
          anchor={panelAnchor}
          onClose={() => setInstallmentOpen(false)}
          options={KOLAM_PAYABLE_INSTALLMENT_DUE_OPTIONS}
          onSelect={value => {
            controller.onInstallmentDueChange(
              value as KolamPayableInstallmentDueFilter,
            );
            setInstallmentOpen(false);
          }}
        />
      ) : null}

      {periodOpen && panelAnchor ? (
        <FilterPanel
          activeValue={controller.filters.period}
          anchor={panelAnchor}
          onClose={() => setPeriodOpen(false)}
          options={KOLAM_PAYABLE_PERIOD_OPTIONS}
          onSelect={value => {
            controller.onPeriodChange(value as KolamPayablePeriodFilter);
            setPeriodOpen(false);
          }}
        />
      ) : null}

      {sortOpen && panelAnchor ? (
        <FilterPanel
          activeValue={controller.filters.sort}
          anchor={panelAnchor}
          onClose={() => setSortOpen(false)}
          options={KOLAM_PAYABLE_SORT_OPTIONS}
          onSelect={value => {
            controller.onSortChange(value as KolamPayableSortOption);
            setSortOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

function FilterPanel<T extends string>({
  activeValue,
  anchor,
  options,
  onSelect,
  onClose,
}: {
  activeValue: T;
  anchor: { left: number; top: number; width: number };
  options: Array<{ label: string; value: T }>;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <View
      style={[
        styles.filterOverlayPanel,
        { left: anchor.left, top: anchor.top, width: anchor.width },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.filterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.filterPanelScroll}
      >
        {options.map(option => (
          <KolamButton
            intent={option.value === activeValue ? 'primary' : 'plain'}
            key={option.value || 'all'}
            label={option.label}
            onPress={() => onSelect(option.value)}
            style={styles.filterPanelOption}
          />
        ))}
      </ScrollView>
      <View style={styles.filterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function PayableList({
  controller,
  onRouteChange,
}: {
  controller: KolamPayableController;
  onRouteChange?: (route: string) => void;
}) {
  const safePage = Math.max(1, controller.pagination.page);
  const pageCount = Math.max(1, controller.pagination.totalPages);

  const renderRow = React.useCallback(
    (item: KolamPayable) => {
      const canPayRow =
        controller.canPay && item.status === 'open' && Boolean(item.id);
      const due = getPayableDueTone(item.status, item.dueDate);
      return (
        <Pressable
          onPress={() =>
            onRouteChange?.(
              `${KOLAM_PAYABLE_ROOT}/${encodeURIComponent(item.id)}`,
            )
          }
          style={styles.row}
        >
          <View style={[styles.cell, { flex: 0.9 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.code || '—'}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1.2 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.name || '—'}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.vendorName}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.7 }]}>
            <Text style={styles.metaText}>
              {formatKolamPayableSourceLabel(item.sourceModel)}
            </Text>
            {item.sourceLabel &&
            item.sourceModel === 'PurchaseOrder' &&
            item.sourceLabel !== 'PO' ? (
              <Text numberOfLines={1} style={styles.metaText}>
                {item.sourceLabel}
              </Text>
            ) : null}
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text style={styles.primaryText}>
              {formatRupiah(item.amount)}
            </Text>
            {item.paidAmount > 0 && item.paidAmount < item.amount ? (
              <Text style={styles.metaText}>
                Dibayar {formatRupiah(item.paidAmount)}
              </Text>
            ) : null}
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text style={[styles.metaText, due.textStyle]}>
              {formatShortDate(item.dueDate)}
            </Text>
            {due.label ? (
              <Text style={[styles.dueMetaText, due.textStyle]}>
                {due.label}
              </Text>
            ) : null}
          </View>
          <View style={[styles.cell, { flex: 1.15 }]}>
            <PayableInstallmentSummaryCell
              summary={item.installmentSummary}
            />
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            <KolamStatusBadge
              intent={getKolamPayableStatusIntent(item.status)}
              label={formatKolamPayableStatusLabel(item.status)}
            />
          </View>
          <View style={[styles.cell, { flex: 0.8 }]}>
            {canPayRow ? (
              <KolamButton
                intent="primary"
                label={controller.payingId === item.id ? '…' : 'Lunasi'}
                onPress={() => {
                  void controller.onPayFull(item);
                }}
                style={styles.actionButton}
              />
            ) : null}
          </View>
        </Pressable>
      );
    },
    [controller, onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={safePage}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  disabled={safePage <= 1 || controller.loading}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onPageChange(Math.max(1, safePage - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {safePage} / {pageCount}
                </Text>
                <KolamButton
                  disabled={safePage >= pageCount || controller.loading}
                  label="Berikutnya"
                  onPress={() =>
                    controller.onPageChange(Math.min(pageCount, safePage + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        style={styles.tableFrame}
      >
        <View style={styles.headerRow}>
          {LIST_COLUMNS.map(column => (
            <View
              key={column.id}
              style={[styles.cell, { flex: column.flex }]}
            >
              <Text style={styles.headerCellText}>{column.label}</Text>
            </View>
          ))}
        </View>
        {controller.items.length ? (
          controller.items.map(item => (
            <React.Fragment key={item.id}>{renderRow(item)}</React.Fragment>
          ))
        ) : (
          <View style={styles.listContent}>
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={controller.loading ? 'Memuat...' : 'Tidak ada hutang'}
              />
            </View>
          </View>
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function PayableDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamPayableController;
  onRouteChange?: (route: string) => void;
}) {
  const item = useMemo(
    () =>
      controller.detailItem ??
      controller.items.find(row => row.id === controller.documentId) ??
      null,
    [controller.detailItem, controller.documentId, controller.items],
  );
  const isLumpSum = item ? controller.installments.length === 0 : false;
  const paidAmount = item?.paidAmount ?? 0;
  const remaining = item ? Math.max(0, item.amount - paidAmount) : 0;
  const progress =
    item && item.amount > 0
      ? Math.min(100, Math.round((paidAmount / item.amount) * 100))
      : 0;
  const due = item ? getPayableDueTone(item.status, item.dueDate) : null;
  const payment = item?.paymentTransaction ?? null;
  const firstPendingInstallmentId =
    controller.installments.find(installment => installment.status === 'pending')
      ?.id ?? '';
  const overdueInstallments = controller.installments.filter(installment => {
    const days = getDaysUntilDue(installment.dueDate);
    return installment.status === 'pending' && days != null && days < 0;
  }).length;
  const hasPaymentHistory =
    Boolean(item) &&
    isLumpSum &&
    (item?.status === 'paid' || Boolean(payment) || paidAmount > 0);

  return (
    <View style={styles.detailRoot}>
      <View style={styles.detailHeader}>
        <View style={styles.detailHeaderCopy}>
          {item ? (
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitle}>{item.code || '-'}</Text>
              <KolamStatusBadge
                intent={getKolamPayableStatusIntent(item.status)}
                label={formatKolamPayableStatusLabel(item.status)}
              />
            </View>
          ) : null}
          {item ? <Text style={styles.primaryText}>{item.name || '-'}</Text> : null}
        </View>
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={() => onRouteChange?.(KOLAM_PAYABLE_ROOT)}
          style={styles.backButton}
        />
      </View>
      {item ? (
        <>
          <View style={styles.detailSummaryRow}>
            <KolamCardFrame style={styles.detailSummaryCard}>
              <View style={styles.detailGrid}>
                <DetailField label="Vendor" value={item.vendorName} />
                <DetailField
                  label="Total Hutang"
                  value={formatRupiah(item.amount)}
                />
                <DetailField
                  label="Jatuh Tempo"
                  value={formatShortDate(item.dueDate)}
                />
                <DetailField label="Dibayar" value={formatRupiah(paidAmount)} />
              </View>
            </KolamCardFrame>
            <KolamCardFrame style={styles.progressCard}>
              <Text style={styles.cardLabel}>Progress Pembayaran</Text>
              <Text style={styles.progressValue}>{progress}%</Text>
              <Text style={styles.metaText}>
                {formatRupiah(paidAmount)} / {formatRupiah(item.amount)}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {width: `${progress}%` as `${number}%`},
                  ]}
                />
              </View>
            </KolamCardFrame>
          </View>

          {isLumpSum && item.status === 'open' && due?.label ? (
            <KolamStatusBadge
              intent={
                due.textStyle === styles.dueDangerText ? 'danger' : 'warning'
              }
              label={`${due.label} (${formatShortDate(item.dueDate)})`}
              numberOfLines={2}
              style={styles.dueBanner}
            />
          ) : null}

          {isLumpSum && item.status === 'open' && remaining > 0 ? (
            <KolamCardFrame style={styles.payFullCard}>
              <View>
                <Text style={styles.cardLabel}>Sisa Pembayaran</Text>
                <Text style={styles.payFullAmount}>
                  {formatRupiah(remaining)}
                </Text>
                <Text style={styles.metaText}>
                  Wallet: {item.walletName || '-'}
                </Text>
              </View>
              <KolamButton
                disabled={controller.payingId === item.id}
                intent="primary"
                label={
                  controller.payingId === item.id
                    ? 'Memproses...'
                    : `Bayar Penuh ${formatRupiah(remaining)}`
                }
                onPress={() => {
                  void controller.onPayFull(item);
                }}
              />
            </KolamCardFrame>
          ) : null}

          {hasPaymentHistory ? (
            <KolamCardFrame style={styles.paymentHistoryCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Riwayat Pembayaran</Text>
                <KolamStatusBadge intent="success" label="Lunas" />
              </View>
              <View style={styles.detailGrid}>
                <DetailField
                  label="Dibayar"
                  value={formatDateTime(item.paidAt || payment?.createdAt || '')}
                />
                <DetailField
                  label="Wallet"
                  value={payment?.walletName || item.walletName || '-'}
                />
                <DetailField
                  label="Oleh"
                  value={item.paidByName || payment?.createdByName || '-'}
                />
                <DetailField
                  label="Catatan transaksi"
                  value={payment?.note || '-'}
                />
              </View>
              {payment?.proofs.length ? (
                <View style={styles.proofList}>
                  {payment.proofs.map((proof, index) => (
                    <View key={`${proof.path}-${index}`} style={styles.proofItem}>
                      <Text style={styles.proofName} numberOfLines={1}>
                        Bukti {index + 1}
                      </Text>
                      <Text style={styles.metaText} numberOfLines={1}>
                        {proof.uploadedAt
                          ? formatDateTime(proof.uploadedAt)
                          : proof.path}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <KolamButton
                disabled={controller.uploadingProof}
                intent="secondary"
                label={
                  controller.uploadingProof
                    ? 'Mengunggah...'
                    : payment?.proofs.length
                    ? 'Tambah Bukti'
                    : 'Upload Bukti'
                }
                onPress={() => {
                  void controller.onUploadPayableProof(item);
                }}
                style={styles.uploadProofButton}
              />
            </KolamCardFrame>
          ) : null}
        </>
      ) : (
        <KolamEmptyState
          compact
          title={controller.detailLoading ? 'Memuat detail...' : 'Detail tidak ada'}
        />
      )}

      {item && !isLumpSum ? (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Cicilan</Text>
            {overdueInstallments > 0 ? (
              <KolamStatusBadge
                intent="danger"
                label={`${overdueInstallments} lewat jatuh tempo`}
              />
            ) : null}
          </View>
          {controller.installmentsLoading ? (
            <Text style={styles.metaText}>Memuat...</Text>
          ) : controller.installments.length === 0 ? (
            <Text style={styles.metaText}>Tidak ada cicilan</Text>
          ) : (
            <View style={styles.installmentCards}>
              {controller.installments.map(installment => (
                <InstallmentDetailCard
                  key={installment.id}
                  canPay={controller.canPay}
                  installment={installment}
                  isFirstPending={
                    !firstPendingInstallmentId ||
                    firstPendingInstallmentId === installment.id
                  }
                  item={item}
                  onPay={controller.onPayInstallment}
                  onUploadProof={controller.onUploadInstallmentProof}
                  payingId={controller.payingInstallmentId}
                  uploadingProofId={controller.uploadingInstallmentProofId}
                />
              ))}
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.primaryText}>{value}</Text>
    </View>
  );
}

function InstallmentDetailCard({
  canPay,
  installment,
  isFirstPending,
  item,
  onPay,
  onUploadProof,
  payingId,
  uploadingProofId,
}: {
  canPay: boolean;
  installment: KolamPayableController['installments'][number];
  isFirstPending: boolean;
  item: KolamPayable;
  onPay: KolamPayableController['onPayInstallment'];
  onUploadProof: KolamPayableController['onUploadInstallmentProof'];
  payingId: string | null;
  uploadingProofId: string | null;
}) {
  const due = getPayableDueTone(
    installment.status === 'pending' ? 'open' : installment.status,
    installment.dueDate,
  );
  const isPending = installment.status === 'pending';
  const isPaid = installment.status === 'paid';
  const isPaying = payingId === installment.id;
  const isUploading = uploadingProofId === installment.id;
  const paidAt = installment.paidAt || '';
  const paidAmount = installment.paidAmount || (isPaid ? installment.amount : 0);

  return (
    <KolamCardFrame style={styles.installmentCard}>
      <View style={styles.installmentCardHeader}>
        <View style={styles.installmentTitleBlock}>
          <Text style={styles.installmentTitle}>
            Cicilan #{installment.installmentNumber}
          </Text>
          <Text style={styles.metaText}>
            Jatuh tempo {formatShortDate(installment.dueDate)}
          </Text>
        </View>
        <View style={styles.installmentBadgeRow}>
          {due.label && isPending ? (
            <KolamStatusBadge
              intent={due.textStyle === styles.dueDangerText ? 'danger' : 'warning'}
              label={due.label}
            />
          ) : null}
          <KolamStatusBadge
            intent={getInstallmentStatusIntent(installment.status)}
            label={formatInstallmentStatusLabel(installment.status)}
          />
        </View>
      </View>

      <View style={styles.installmentMetaGrid}>
        <DetailField label="Jumlah" value={formatRupiah(installment.amount)} />
        <DetailField label="Dibayar" value={formatRupiah(paidAmount)} />
        <DetailField
          label="Tanggal bayar"
          value={paidAt ? formatDateTime(paidAt) : '-'}
        />
        <DetailField label="Wallet" value={installment.walletName || '-'} />
        <DetailField label="Oleh" value={installment.paidByName || '-'} />
        <DetailField label="Catatan" value={installment.walletNote || '-'} />
      </View>

      {installment.proofs.length ? (
        <View style={styles.proofList}>
          {installment.proofs.map((proof, index) => (
            <View key={`${proof.path}-${index}`} style={styles.proofItem}>
              <Text style={styles.proofName} numberOfLines={1}>
                Bukti {index + 1}
              </Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {proof.uploadedAt ? formatDateTime(proof.uploadedAt) : proof.path}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {isPending && !isFirstPending ? (
        <Text style={styles.installmentBlockedText}>
          Bayar cicilan sebelumnya dulu
        </Text>
      ) : null}

      <View style={styles.installmentActions}>
        {isPending ? (
          <>
            <KolamButton
              disabled={!canPay || !isFirstPending || isPaying}
              intent="primary"
              label={isPaying ? 'Memproses...' : 'Bayar'}
              onPress={() => {
                void onPay(item, installment);
              }}
            />
            <KolamButton
              disabled={!canPay || !isFirstPending || isPaying}
              intent="secondary"
              label={isPaying ? 'Memproses...' : 'Bayar + Bukti'}
              onPress={() => {
                void onPay(item, installment, true);
              }}
            />
          </>
        ) : null}
        {isPaid ? (
          <KolamButton
            disabled={!canPay || isUploading}
            intent="secondary"
            label={
              isUploading
                ? 'Mengunggah...'
                : installment.proofs.length
                ? 'Tambah Bukti'
                : 'Upload Bukti'
            }
            onPress={() => {
              void onUploadProof(item, installment);
            }}
          />
        ) : null}
      </View>
    </KolamCardFrame>
  );
}

function PayableInstallmentSummaryCell({
  summary,
}: {
  summary: KolamPayableInstallmentSummary | null;
}) {
  const total = summary?.totalCount ?? 0;
  if (total <= 0) {
    return <Text style={styles.installmentTypeText}>Sekali bayar</Text>;
  }

  const paid = Math.max(0, summary?.paidCount ?? 0);
  const segments = Math.min(total, 8);
  const filled = Math.round((paid / Math.max(1, total)) * segments);
  const next = summary?.nextInstallment;

  return (
    <View style={styles.installmentSummary}>
      <Text style={styles.installmentProgressText}>
        {paid}/{total} lunas
      </Text>
      <View style={styles.installmentSegments}>
        {Array.from({ length: segments }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.installmentSegment,
              index < filled ? styles.installmentSegmentFilled : null,
            ]}
          />
        ))}
      </View>
      {next ? (
        <Text numberOfLines={1} style={styles.installmentNextText}>
          Berikutnya: #{next.installmentNumber} - {formatShortDate(next.dueDate)}
        </Text>
      ) : (
        <Text style={styles.installmentNextText}>Semua cicilan lunas</Text>
      )}
    </View>
  );
}

function getPayableDueTone(status: string, dueDate: string) {
  const days = getDaysUntilDue(dueDate);
  if (status !== 'open' || days == null) {
    return { label: '', textStyle: null };
  }
  if (days < 0) {
    return {
      label: `Lewat ${Math.abs(days)} hari`,
      textStyle: styles.dueDangerText,
    };
  }
  if (days === 0) {
    return { label: 'Hari ini', textStyle: styles.dueDangerText };
  }
  if (days <= 7) {
    return {
      label: `${days} hari lagi`,
      textStyle: styles.dueWarningText,
    };
  }
  return { label: `${days} hari lagi`, textStyle: styles.dueNormalText };
}

function formatInstallmentStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return 'Lunas';
    case 'canceled':
    case 'cancelled':
      return 'Dibatalkan';
    case 'pending':
      return 'Menunggu';
    default:
      return status || '-';
  }
}

function getInstallmentStatusIntent(status: string) {
  switch (status) {
    case 'paid':
      return 'success';
    case 'canceled':
    case 'cancelled':
      return 'danger';
    default:
      return 'warning';
  }
}

function getDaysUntilDue(value: string): number | null {
  if (!value) {
    return null;
  }
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) {
    return null;
  }
  const now = new Date();
  const dueMs = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  ).getTime();
  const nowMs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.floor((dueMs - nowMs) / 86400000);
}

function formatShortDate(value: string): string {
  if (!value) {
    return '—';
  }
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

function formatDateTime(value: string): string {
  if (!value) {
    return '-';
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
    gap: 10,
    minHeight: 0,
  },
  banner: {
    alignSelf: 'stretch',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    flexBasis: 160,
    flexGrow: 1,
    minWidth: 140,
    padding: 12,
  },
  cardLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginBottom: 4,
  },
  cardValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: 4,
  },
  filterTrigger: {
    flexGrow: 0,
    flexShrink: 0,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  dateField: {
    flexGrow: 0,
    flexShrink: 0,
    width: 116,
  },
  dateFieldTrigger: {
    minWidth: 0,
    paddingHorizontal: 8,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1001,
    maxHeight: 280,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 100001,
  },
  filterPanelScroll: {
    maxHeight: 224,
  },
  filterPanelContent: {
    gap: 4,
    padding: 6,
  },
  filterPanelOption: {
    alignSelf: 'stretch',
  },
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 6,
  },
  listRoot: {
    flexGrow: 0,
    gap: 8,
    minHeight: 240,
  },
  tableFrame: {
    minHeight: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: 8,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cell: {
    paddingHorizontal: 4,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  dueMetaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  dueDangerText: {
    color: V.colors.danger,
  },
  dueWarningText: {
    color: V.colors.warning,
  },
  dueNormalText: {
    color: V.colors.fg,
  },
  installmentSummary: {
    gap: 4,
    minWidth: 0,
  },
  installmentTypeText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  installmentProgressText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  installmentSegments: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 2,
    height: 6,
    overflow: 'hidden',
  },
  installmentSegment: {
    flex: 1,
  },
  installmentSegmentFilled: {
    backgroundColor: V.colors.success,
  },
  installmentNextText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  detailRoot: {
    flex: 1,
    gap: 10,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailHeaderCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  detailCard: {
    gap: 6,
    padding: 12,
  },
  detailTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  detailSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailSummaryCard: {
    flex: 1,
    minWidth: 360,
    padding: 12,
  },
  progressCard: {
    gap: 6,
    minWidth: 220,
    padding: 12,
    width: 260,
  },
  progressValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: 8,
  },
  dueBanner: {
    alignSelf: 'stretch',
  },
  payFullCard: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  payFullAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  paymentHistoryCard: {
    gap: 10,
    padding: 12,
  },
  proofList: {
    gap: 6,
  },
  proofItem: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  proofName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  uploadProofButton: {
    alignSelf: 'flex-start',
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  detailField: {
    minWidth: 120,
  },
  sectionLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  installmentCards: {
    gap: 8,
  },
  installmentCard: {
    gap: 10,
    padding: 12,
  },
  installmentCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  installmentTitleBlock: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  installmentTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  installmentBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  installmentMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  installmentBlockedText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  installmentActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
