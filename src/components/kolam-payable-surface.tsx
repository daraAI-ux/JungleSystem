import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamPayableSourceLabel,
  formatKolamPayableStatusLabel,
  getKolamPayableStatusIntent,
  KOLAM_PAYABLE_ROOT,
  KOLAM_PAYABLE_SOURCE_OPTIONS,
  KOLAM_PAYABLE_STATUS_OPTIONS,
  type KolamPayable,
  type KolamPayableInstallmentSummary,
  type KolamPayableSourceModel,
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
import { KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamStatusBadge } from './kolam-status-badge';
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
  const [statusOpen, setStatusOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const statusLabel =
    KOLAM_PAYABLE_STATUS_OPTIONS.find(
      option => option.value === controller.filters.status,
    )?.label ?? 'Status';
  const sourceLabel =
    KOLAM_PAYABLE_SOURCE_OPTIONS.find(
      option => option.value === controller.filters.sourceModel,
    )?.label ?? 'Sumber';

  return (
    <View style={kolamTableToolbarStyles.shell}>
      <View style={kolamTableToolbarStyles.row}>
        <View style={kolamTableToolbarStyles.filters}>
          <KolamFormTextField
            onChangeText={controller.onSearchChange}
            placeholder="Cari kode atau nama"
            style={kolamTableToolbarStyles.searchInput}
            value={controller.filters.search}
          />
          <KolamButton
            intent={
              statusOpen || controller.filters.status
                ? 'primary'
                : 'secondary'
            }
            label={statusLabel}
            onPress={() => {
              setSourceOpen(false);
              setStatusOpen(current => !current);
            }}
            style={styles.filterTrigger}
          />
          <KolamButton
            intent={
              sourceOpen || controller.filters.sourceModel
                ? 'primary'
                : 'secondary'
            }
            label={sourceLabel}
            onPress={() => {
              setStatusOpen(false);
              setSourceOpen(current => !current);
            }}
            style={styles.filterTrigger}
          />
          <KolamButton
            intent={controller.filters.overdue ? 'primary' : 'secondary'}
            label="Jatuh tempo"
            onPress={controller.onOverdueToggle}
            style={styles.filterTrigger}
          />
        </View>
        <View style={kolamTableToolbarStyles.actions}>
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

      {statusOpen ? (
        <FilterPanel
          onClose={() => setStatusOpen(false)}
          options={KOLAM_PAYABLE_STATUS_OPTIONS}
          onSelect={value => {
            controller.onStatusChange(value as '' | KolamPayableStatus);
            setStatusOpen(false);
          }}
        />
      ) : null}

      {sourceOpen ? (
        <FilterPanel
          onClose={() => setSourceOpen(false)}
          options={KOLAM_PAYABLE_SOURCE_OPTIONS}
          onSelect={value => {
            controller.onSourceModelChange(value as '' | KolamPayableSourceModel);
            setSourceOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

function FilterPanel<T extends string>({
  options,
  onSelect,
  onClose,
}: {
  options: Array<{ label: string; value: T }>;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.filterPanel}>
      {options.map(option => (
        <Pressable
          key={option.value || 'all'}
          onPress={() => onSelect(option.value)}
          style={styles.filterOption}
        >
          <Text style={styles.filterOptionText}>{option.label}</Text>
        </Pressable>
      ))}
      <KolamButton
        intent="secondary"
        label="Tutup"
        onPress={onClose}
        style={styles.filterClose}
      />
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
    ({ item }: { item: KolamPayable }) => {
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
        <FlatList
          contentContainerStyle={styles.listContent}
          data={controller.items}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={controller.loading ? 'Memuat…' : 'Tidak ada utang'}
              />
            </View>
          }
          ListHeaderComponent={
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
          }
          renderItem={renderRow}
          style={styles.list}
        />
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
    () => controller.items.find(row => row.id === controller.documentId) ?? null,
    [controller.documentId, controller.items],
  );

  return (
    <View style={styles.detailRoot}>
      <KolamButton
        intent="secondary"
        label="Kembali"
        onPress={() => onRouteChange?.(KOLAM_PAYABLE_ROOT)}
        style={styles.backButton}
      />
      {item ? (
        <KolamCardFrame style={styles.detailCard}>
          <Text style={styles.detailTitle}>{item.code}</Text>
          <Text style={styles.primaryText}>{item.name}</Text>
          <Text style={styles.metaText}>{item.vendorName}</Text>
          <View style={styles.detailGrid}>
            <DetailField label="Nominal" value={formatRupiah(item.amount)} />
            <DetailField
              label="Sisa"
              value={formatRupiah(item.remainingAmount)}
            />
            <DetailField
              label="Jatuh tempo"
              value={formatShortDate(item.dueDate)}
            />
            <DetailField
              label="Status"
              value={formatKolamPayableStatusLabel(item.status)}
            />
          </View>
        </KolamCardFrame>
      ) : (
        <KolamEmptyState compact title="Memuat detail…" />
      )}

      <Text style={styles.sectionLabel}>Cicilan</Text>
      {controller.installmentsLoading ? (
        <Text style={styles.metaText}>Memuat…</Text>
      ) : controller.installments.length === 0 ? (
        <Text style={styles.metaText}>Tidak ada cicilan</Text>
      ) : (
        controller.installments.map(installment => (
          <View key={installment.id} style={styles.installmentRow}>
            <Text style={styles.primaryText}>
              #{installment.installmentNumber}
            </Text>
            <Text style={styles.metaText}>
              {formatShortDate(installment.dueDate)}
            </Text>
            <Text style={styles.primaryText}>
              {formatRupiah(installment.amount)}
            </Text>
            <Text style={styles.metaText}>{installment.status}</Text>
          </View>
        ))
      )}
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
  filterPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    marginTop: 6,
    padding: 6,
  },
  filterOption: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterOptionText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  filterClose: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  listRoot: {
    flex: 1,
    gap: 8,
    minHeight: 240,
  },
  tableFrame: {
    flex: 1,
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
  detailField: {
    minWidth: 120,
  },
  sectionLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  installmentRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
});
