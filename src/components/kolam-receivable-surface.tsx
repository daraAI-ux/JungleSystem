import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamListTableComposition } from './kolam-list-table-composition';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
  const columns = React.useMemo(
    () => [
      {
        id: 'code',
        label: 'Kode',
        flex: 0.9,
        render: (item: KolamReceivable) => (
          <Text numberOfLines={1} style={styles.primaryText}>
            {item.code || '—'}
          </Text>
        ),
      },
      {
        id: 'name',
        label: 'Nama',
        flex: 1.2,
        render: (item: KolamReceivable) => (
          <View>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.name || '—'}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.customerName}
            </Text>
          </View>
        ),
      },
      {
        id: 'source',
        label: 'Sumber',
        flex: 0.8,
        render: (item: KolamReceivable) => (
          <Text style={styles.metaText}>
            {formatKolamReceivableSourceLabel(item.sourceModel)}
          </Text>
        ),
      },
      {
        id: 'amount',
        label: 'Nominal',
        flex: 1,
        render: (item: KolamReceivable) => (
          <View>
            <Text style={styles.primaryText}>
              {formatRupiah(item.remainingAmount || item.amount)}
            </Text>
            {item.paidAmount > 0 && item.paidAmount < item.amount ? (
              <Text style={styles.metaText}>
                Dibayar {formatRupiah(item.paidAmount)}
              </Text>
            ) : null}
          </View>
        ),
      },
      {
        id: 'due',
        label: 'Jatuh tempo',
        flex: 1,
        render: (item: KolamReceivable) => (
          <Text style={styles.metaText}>{formatShortDate(item.dueDate)}</Text>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        flex: 1,
        render: (item: KolamReceivable) => (
          <KolamStatusBadge
            intent={getKolamReceivableStatusIntent(item.status)}
            label={formatKolamReceivableStatusLabel(item.status)}
          />
        ),
      },
      {
        id: 'action',
        label: '',
        flex: 0.9,
        render: (item: KolamReceivable) => {
          const canMarkRow =
            controller.canMarkPaid &&
            item.status === 'open' &&
            Boolean(item.id);
          return canMarkRow ? (
            <KolamButton
              intent="primary"
              label={controller.markingId === item.id ? '…' : 'Tandai dibayar'}
              onPress={() => {
                void controller.onMarkPaid(item);
              }}
              style={styles.actionButton}
            />
          ) : null;
        },
      },
    ],
    [controller],
  );

  return (
    <View style={styles.listRoot}>
      <KolamListTableComposition
        columns={columns}
        emptyTitle="Tidak ada piutang"
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total,
        }}
        rows={controller.items}
        style={styles.tableFrame}
      />
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
});
