import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {
  SettingsActivityLogDetailField,
  SettingsActivityLogFilterControl,
  SettingsActivityLogFilterState,
  SettingsActivityLogPagination,
  SettingsActivityLogRow,
  SettingsActivityLogStatsCard,
  SettingsActivityLogTableColumn,
} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamDetailPanel} from './kolam-detail-panel';
import {KolamFilterBar} from './kolam-filter-bar';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';

export function KolamSettingsActivityLogSurface({
  columns,
  filterControls,
  filterValues = emptyActivityLogFilterValues,
  onPageChange,
  onFilterChange = noopFilterChange,
  onRefresh = noopRefresh,
  onSelectActivityLog,
  pagination,
  rows,
  selectedActivityLog,
  selectedActivityLogFields,
  selectedActivityLogId,
  statsCards,
}: {
  columns: SettingsActivityLogTableColumn[];
  filterControls: SettingsActivityLogFilterControl[];
  filterValues?: SettingsActivityLogFilterState;
  onPageChange: (page: number) => void;
  onFilterChange?: (
    key: keyof SettingsActivityLogFilterState,
    value: string,
  ) => void;
  onRefresh?: () => void;
  onSelectActivityLog: (activityLogId: string) => void;
  pagination: SettingsActivityLogPagination;
  rows: SettingsActivityLogRow[];
  selectedActivityLog: SettingsActivityLogRow | null;
  selectedActivityLogFields: SettingsActivityLogDetailField[];
  selectedActivityLogId: string;
  statsCards: SettingsActivityLogStatsCard[];
}) {
  const tableColumns = React.useMemo(
    () =>
      columns
        .filter(column => column.id !== 'detail')
        .map(column => ({
          align:
            column.id === 'status' || column.id === 'duration'
              ? ('center' as const)
              : ('left' as const),
          flex: getActivityLogTableColumnFlex(column),
          id: column.id,
          label: column.label,
          render: (row: SettingsActivityLogRow) => (
            <ActivityLogTableCell column={column} row={row} />
          ),
        })),
    [columns],
  );

  return (
    <>
      <KolamFilterBar
        controls={filterControls}
        values={{...filterValues}}
        onChange={(key, value) =>
          onFilterChange(key as keyof SettingsActivityLogFilterState, value)
        }
        onRefresh={onRefresh}
        accessibilityLabel="settings/activity-log/activity-log-list.tsx filters mapped to native controls"
      />
      <KolamStatsCardStrip cards={statsCards} />
      <KolamListTableComposition
        actionsColumn
        columns={tableColumns}
        emptyTitle="Tidak ada log"
        getRowKey={row => row.id}
        pagination={{
          onPageChange,
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        renderActions={row => (
          <KolamActionControlButton
            intent={selectedActivityLogId === row.id ? 'primary' : undefined}
            label="Detail"
            onPress={() => onSelectActivityLog(row.id)}
          />
        )}
        rows={rows}
        style={styles.tableShell}
      />
      {selectedActivityLog ? (
        <KolamDetailPanel
          title="Detail Log"
          subtitle={selectedActivityLog.path}
          fields={selectedActivityLogFields}
          warningFlags={selectedActivityLog.suspicious}
          onClose={() => onSelectActivityLog('')}
        />
      ) : null}
    </>
  );
}

function ActivityLogTableCell({
  column,
  row,
}: {
  column: SettingsActivityLogTableColumn;
  row: SettingsActivityLogRow;
}) {
  if (column.id === 'path') {
    return (
      <View style={styles.pathCell}>
        <Text numberOfLines={1} style={styles.primaryCell}>
          {row.path || '-'}
        </Text>
        <Text numberOfLines={1} style={styles.secondaryCell}>
          {row.event || '-'}
        </Text>
      </View>
    );
  }

  return (
    <Text
      numberOfLines={1}
      style={[
        styles.bodyCell,
        column.id === 'method' ? styles.monoCell : null,
        column.id === 'status' ? getActivityLogStatusStyle(row) : null,
      ]}
    >
      {getActivityLogTableCellValue(column, row)}
    </Text>
  );
}

function getActivityLogTableCellValue(
  column: SettingsActivityLogTableColumn,
  row: SettingsActivityLogRow,
) {
  if (column.id === 'timestamp') return row.timestamp;
  if (column.id === 'user') return row.user || '-';
  if (column.id === 'source') return row.source || '-';
  if (column.id === 'type') return row.type;
  if (column.id === 'method') return row.method;
  if (column.id === 'ip') return row.ip || '-';
  if (column.id === 'status') return row.statusCode || row.status || '-';
  if (column.id === 'duration') return row.duration || '-';
  return '';
}

function getActivityLogTableColumnFlex(column: SettingsActivityLogTableColumn) {
  if (column.width === 'flex') return 2.4;
  if (column.id === 'timestamp') return 1;
  if (column.id === 'user') return 1.1;
  if (column.id === 'source') return 0.85;
  if (column.id === 'type') return 0.7;
  if (column.id === 'method') return 0.7;
  if (column.id === 'ip') return 0.9;
  if (column.id === 'status') return 0.75;
  if (column.id === 'duration') return 0.75;
  return 1;
}

function getActivityLogStatusStyle(row: SettingsActivityLogRow) {
  if (row.tone === 'success') return styles.statusSuccess;
  if (row.tone === 'warning') return styles.statusWarning;
  return styles.statusMuted;
}

const emptyActivityLogFilterValues: SettingsActivityLogFilterState = {
  search: '',
  type: '',
  status: '',
  method: '',
  source: '',
  suspicious: '',
};

function noopFilterChange() {}

function noopRefresh() {}

const styles = StyleSheet.create({
  tableShell: {
    alignSelf: 'stretch',
    width: '100%',
  },
  bodyCell: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  monoCell: {
    fontFamily: 'Consolas',
  },
  pathCell: {
    gap: 2,
    minWidth: 0,
  },
  primaryCell: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryCell: {
    color: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  statusMuted: {
    color: V.colors.muted,
    fontWeight: '700',
  },
  statusSuccess: {
    color: '#047857',
    fontWeight: '800',
  },
  statusWarning: {
    color: '#b45309',
    fontWeight: '800',
  },
});
