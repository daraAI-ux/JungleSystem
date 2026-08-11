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
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamSearchField} from './kolam-search-field';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

const ACTIVITY_LOG_FILTER_PANEL_WIDTH = 240;

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
  const toolbarRef = React.useRef<View | null>(null);
  const filterTriggerRefs = React.useRef<
    Partial<Record<keyof SettingsActivityLogFilterState, View | null>>
  >({});
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<keyof SettingsActivityLogFilterState | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
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
  const searchControl = filterControls.find(control => control.id === 'search');
  const selectControls = filterControls.filter(
    control => control.control === 'select',
  );
  const activeFilterControl = activeFilterPanel
    ? selectControls.find(control => control.id === activeFilterPanel)
    : null;
  const anchorFilterPanel = React.useCallback(
    (panel: keyof SettingsActivityLogFilterState) => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        filterTriggerRefs.current[panel],
        ACTIVITY_LOG_FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    },
    [],
  );
  const openFilterPanel = React.useCallback(
    (panel: keyof SettingsActivityLogFilterState) => {
      if (activeFilterPanel === panel) {
        setActiveFilterPanel(null);
        setPanelAnchor(null);
        return;
      }
      anchorFilterPanel(panel);
      setActiveFilterPanel(panel);
    },
    [activeFilterPanel, anchorFilterPanel],
  );

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  return (
    <>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                accessibilityLabel="Cari activity log"
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={value => onFilterChange('search', value)}
                placeholder={searchControl?.placeholder ?? 'Cari...'}
                value={filterValues.search}
              />
              {selectControls.map(control => {
                const selectedValue = filterValues[control.id] ?? '';
                return (
                  <View
                    collapsable={false}
                    key={control.id}
                    ref={node => {
                      filterTriggerRefs.current[control.id] = node;
                    }}
                  >
                    <KolamTableFilterTrigger
                      active={Boolean(selectedValue)}
                      label={getActivityLogFilterLabel(control, selectedValue)}
                      onPress={() => openFilterPanel(control.id)}
                      open={activeFilterPanel === control.id}
                      variant="quiet"
                    />
                  </View>
                );
              })}
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamActionControlButton label="Refresh" onPress={onRefresh} />
            </View>
          </View>
        </View>
        {activeFilterControl && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: ACTIVITY_LOG_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {(activeFilterControl.options ?? []).map(option => {
              const selected =
                (filterValues[activeFilterControl.id] ?? '') === option.id;
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterControl.id}-${option.id || 'all'}`}
                  onPress={() => {
                    onFilterChange(activeFilterControl.id, option.id);
                    setActiveFilterPanel(null);
                    setPanelAnchor(null);
                  }}
                  selected={selected}
                  style={[
                    styles.filterMenuItem,
                    selected ? styles.filterMenuItemSelected : null,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.filterMenuItemLabel,
                      selected ? styles.filterMenuItemLabelSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </KolamInteractionFrame>
              );
            })}
          </View>
        ) : null}
      </View>
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

function getActivityLogFilterLabel(
  control: SettingsActivityLogFilterControl,
  value: string,
) {
  return (
    control.options?.find(option => option.id === value)?.label ??
    control.options?.[0]?.label ??
    control.label
  );
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
  toolbarWrap: {
    zIndex: 100000,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1200,
    gap: 2,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 18,
    zIndex: 120000,
  },
  filterMenuItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterMenuItemSelected: {
    backgroundColor: V.colors.primarySoft,
  },
  filterMenuItemLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  filterMenuItemLabelSelected: {
    color: V.colors.primary,
    fontWeight: '800',
  },
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
