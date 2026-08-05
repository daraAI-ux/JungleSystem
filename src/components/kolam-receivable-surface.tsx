import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamReceivableSourceLabel,
  formatKolamReceivableStatusLabel,
  getKolamReceivableStatusIntent,
  KOLAM_RECEIVABLE_SOURCE_OPTIONS,
  KOLAM_RECEIVABLE_STATUS_OPTIONS,
  type KolamReceivable,
  type KolamReceivableSourceModel,
  type KolamReceivableStatus,
} from '../domain/kolam-receivable';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamReceivableController,
  type KolamReceivableController,
} from '../hooks/use-kolam-receivable-controller';
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
  { id: 'source', label: 'Sumber', flex: 0.8 },
  { id: 'amount', label: 'Nominal', flex: 1 },
  { id: 'due', label: 'Jatuh tempo', flex: 1 },
  { id: 'status', label: 'Status', flex: 1 },
  { id: 'action', label: '', flex: 0.9 },
] as const;

export function KolamReceivableSurface({
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamReceivableController(route);

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

      <ReceivableSummaryCards controller={controller} />
      <ReceivableToolbar controller={controller} />
      <ReceivableList controller={controller} />
    </View>
  );
}

function ReceivableSummaryCards({
  controller,
}: {
  controller: KolamReceivableController;
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
      label: 'Piutang terbuka',
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

function ReceivableToolbar({
  controller,
}: {
  controller: KolamReceivableController;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const statusLabel =
    KOLAM_RECEIVABLE_STATUS_OPTIONS.find(
      option => option.value === controller.filters.status,
    )?.label ?? 'Status';
  const sourceLabel =
    KOLAM_RECEIVABLE_SOURCE_OPTIONS.find(
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
          options={KOLAM_RECEIVABLE_STATUS_OPTIONS}
          onSelect={value => {
            controller.onStatusChange(value as '' | KolamReceivableStatus);
            setStatusOpen(false);
          }}
        />
      ) : null}

      {sourceOpen ? (
        <FilterPanel
          onClose={() => setSourceOpen(false)}
          options={KOLAM_RECEIVABLE_SOURCE_OPTIONS}
          onSelect={value => {
            controller.onSourceModelChange(
              value as '' | KolamReceivableSourceModel,
            );
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
        <KolamButton
          key={option.value || 'all'}
          intent="secondary"
          label={option.label}
          onPress={() => onSelect(option.value)}
          style={styles.filterOptionButton}
        />
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

function ReceivableList({
  controller,
}: {
  controller: KolamReceivableController;
}) {
  const safePage = Math.max(1, controller.pagination.page);
  const pageCount = Math.max(1, controller.pagination.totalPages);

  const renderRow = useCallback(
    ({ item }: { item: KolamReceivable }) => {
      const canMarkRow =
        controller.canMarkPaid && item.status === 'open' && Boolean(item.id);
      return (
        <View style={styles.row}>
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
              {item.customerName}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.8 }]}>
            <Text style={styles.metaText}>
              {formatKolamReceivableSourceLabel(item.sourceModel)}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text style={styles.primaryText}>
              {formatRupiah(item.remainingAmount || item.amount)}
            </Text>
            {item.paidAmount > 0 && item.paidAmount < item.amount ? (
              <Text style={styles.metaText}>
                Dibayar {formatRupiah(item.paidAmount)}
              </Text>
            ) : null}
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text style={styles.metaText}>{formatShortDate(item.dueDate)}</Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <KolamStatusBadge
              intent={getKolamReceivableStatusIntent(item.status)}
              label={formatKolamReceivableStatusLabel(item.status)}
            />
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            {canMarkRow ? (
              <KolamButton
                intent="primary"
                label={controller.markingId === item.id ? '…' : 'Tandai dibayar'}
                onPress={() => {
                  void controller.onMarkPaid(item);
                }}
                style={styles.actionButton}
              />
            ) : null}
          </View>
        </View>
      );
    },
    [controller],
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
                title={controller.loading ? 'Memuat…' : 'Tidak ada piutang'}
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
    gap: 4,
    marginTop: 6,
    padding: 6,
  },
  filterOptionButton: {
    alignSelf: 'stretch',
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
});
