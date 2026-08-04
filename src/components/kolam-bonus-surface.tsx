import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  getKolamBonusStatusIntent,
  KOLAM_BONUS_MONTH_OPTIONS,
  type KolamBonusListRow,
} from '../domain/kolam-bonus';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamBonusListController,
  type KolamBonusListController,
} from '../hooks/use-kolam-bonus-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const BONUS_COLUMNS = [
  { id: 'code', label: 'Kode', flex: 0.9 },
  { id: 'employee', label: 'Karyawan', flex: 1.2 },
  { id: 'amount', label: 'Jumlah', flex: 1 },
  { id: 'status', label: 'Status', flex: 0.9 },
  { id: 'reason', label: 'Alasan', flex: 1.2 },
] as const;

export function KolamBonusSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamBonusListController(route, onRouteChange);

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
      <BonusToolbar controller={controller} />
      <BonusList controller={controller} />
    </View>
  );
}

function BonusToolbar({
  controller,
}: {
  controller: KolamBonusListController;
}) {
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1].map(value => ({
      label: String(value),
      value: String(value),
    }));
  }, []);

  const monthOptions = KOLAM_BONUS_MONTH_OPTIONS.map(option => ({
    label: option.label,
    value: String(option.value),
  }));

  return (
    <View style={kolamTableToolbarStyles.shell}>
      <View style={kolamTableToolbarStyles.row}>
        <View style={kolamTableToolbarStyles.filters}>
          <KolamDropdownSelect
            label="Tahun"
            onChange={value =>
              controller.onYearChange(Number(value) || new Date().getFullYear())
            }
            options={yearOptions}
            value={String(controller.filters.year)}
          />
          <KolamDropdownSelect
            label="Bulan"
            onChange={value =>
              controller.onMonthChange(Number(value) || 1)
            }
            options={monthOptions}
            value={String(controller.filters.month)}
          />
        </View>
        <View style={kolamTableToolbarStyles.actions}>
          <KolamButton
            intent="secondary"
            label={controller.loading ? 'Memuat…' : 'Muat ulang'}
            onPress={() => {
              void controller.onRefresh();
            }}
            style={styles.toolbarButton}
          />
        </View>
      </View>
    </View>
  );
}

function BonusList({ controller }: { controller: KolamBonusListController }) {
  const renderRow = ({ item }: { item: KolamBonusListRow }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 0.9 }]}>
        <Text style={styles.primaryText}>{item.code || item.name || '—'}</Text>
      </View>
      <View style={[styles.cell, { flex: 1.2 }]}>
        <Text style={styles.primaryText}>{item.employeeLabel}</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={styles.primaryText}>{formatRupiah(item.amount)}</Text>
      </View>
      <View style={[styles.cell, { flex: 0.9 }]}>
        <KolamStatusBadge
          intent={getKolamBonusStatusIntent(item.status)}
          label={item.statusLabel}
        />
      </View>
      <View style={[styles.cell, { flex: 1.2 }]}>
        <Text numberOfLines={2} style={styles.metaText}>
          {item.reason || '—'}
        </Text>
      </View>
    </View>
  );

  return (
    <KolamCatalogListTableShell footer={null} style={styles.tableFrame}>
      <FlatList
        data={controller.rows}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              title={controller.loading ? 'Memuat…' : 'Belum ada bonus'}
            />
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerRow}>
            {BONUS_COLUMNS.map(column => (
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
      />
    </KolamCatalogListTableShell>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    padding: 12,
  },
  banner: {
    alignSelf: 'stretch',
  },
  toolbarButton: {
    minWidth: 96,
  },
  tableFrame: {
    flex: 1,
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
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
