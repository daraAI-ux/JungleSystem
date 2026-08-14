import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Path, SvgXml} from 'react-native-svg';
import {KOLAM_DETAIL_BUTTON_ICON_SVG} from '../assets/icons/detail-button-icon-svg';
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
import {KolamButton} from './kolam-button';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamDetailPanelBody} from './kolam-detail-panel-body';
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
import {KolamModalDialog} from './kolam-modal-dialog';

const ACTIVITY_LOG_FILTER_PANEL_WIDTH = 240;

export function KolamSettingsActivityLogSurface({
  blockIpTarget = '',
  columns,
  deleteAllOpen = false,
  deletingAll = false,
  filterControls,
  filterValues = emptyActivityLogFilterValues,
  message = '',
  onBlockActivityLogIp = noopBlockActivityLogIp,
  onCancelBlockActivityLogIp = noopRefresh,
  onCancelDeleteAllActivityLogs = noopRefresh,
  onConfirmBlockActivityLogIp = noopRefresh,
  onConfirmDeleteAllActivityLogs = noopRefresh,
  onPageChange,
  onFilterChange = noopFilterChange,
  onRefresh: _onRefresh = noopRefresh,
  onRequestDeleteAllActivityLogs = noopRefresh,
  onSelectActivityLog,
  pagination,
  rows,
  selectedActivityLog,
  selectedActivityLogFields,
  selectedActivityLogId,
  statsCards,
}: {
  blockIpTarget?: string;
  columns: SettingsActivityLogTableColumn[];
  deleteAllOpen?: boolean;
  deletingAll?: boolean;
  filterControls: SettingsActivityLogFilterControl[];
  filterValues?: SettingsActivityLogFilterState;
  message?: string;
  onBlockActivityLogIp?: (ip: string) => void;
  onCancelBlockActivityLogIp?: () => void;
  onCancelDeleteAllActivityLogs?: () => void;
  onConfirmBlockActivityLogIp?: () => void;
  onConfirmDeleteAllActivityLogs?: () => void;
  onPageChange: (page: number) => void;
  onFilterChange?: (
    key: keyof SettingsActivityLogFilterState,
    value: string,
  ) => void;
  onRefresh?: () => void;
  onRequestDeleteAllActivityLogs?: () => void;
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
            column.id === 'method' ||
            column.id === 'ip' ||
            column.id === 'status' ||
            column.id === 'duration'
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
              <ActivityLogIconButton
                accessibilityLabel="Hapus semua log"
                icon="trash"
                onPress={onRequestDeleteAllActivityLogs}
                tone="danger"
              />
            </View>
          </View>
        </View>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
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
          <View style={styles.actionIconsRow}>
            {row.ip && row.ip !== '-' ? (
              <ActivityLogIconButton
                accessibilityLabel="Blokir IP"
                icon="shield"
                onPress={() => onBlockActivityLogIp(row.ip)}
              />
            ) : null}
            <ActivityLogIconButton
              accessibilityLabel="Lihat detail"
              active={selectedActivityLogId === row.id}
              icon="detail"
              onPress={() => onSelectActivityLog(row.id)}
            />
          </View>
        )}
        rows={rows}
        style={styles.tableShell}
      />
      <KolamModalDialog
        description={selectedActivityLog?.path}
        footer={
          <KolamButton label="Tutup" onPress={() => onSelectActivityLog('')} />
        }
        maxHeight="84%"
        onClose={() => onSelectActivityLog('')}
        title="Detail Log"
        visible={Boolean(selectedActivityLog)}
        width={620}>
        {selectedActivityLog ? (
          <KolamDetailPanelBody
            fields={selectedActivityLogFields}
            warningFlags={selectedActivityLog.suspicious}
            warningTitle="Flag mencurigakan"
          />
        ) : null}
      </KolamModalDialog>
      <KolamConfirmDialog
        confirmLabel="Blokir"
        destructive
        message={`Blokir IP ${blockIpTarget} selama 60 menit?`}
        onCancel={onCancelBlockActivityLogIp}
        onConfirm={onConfirmBlockActivityLogIp}
        title="Blokir IP"
        visible={Boolean(blockIpTarget)}
      />
      <KolamConfirmDialog
        confirmLabel={deletingAll ? 'Menghapus...' : 'Hapus semua'}
        destructive
        message="Semua catatan activity log akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
        onCancel={onCancelDeleteAllActivityLogs}
        onConfirm={onConfirmDeleteAllActivityLogs}
        title="Hapus semua log?"
        visible={deleteAllOpen}
      />
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
        isCenteredActivityLogColumn(column.id) ? styles.bodyCellCenter : null,
        column.id === 'method' ? styles.monoCell : null,
        column.id === 'ip' ? styles.monoCell : null,
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
  if (column.id === 'timestamp') return 0.9;
  if (column.id === 'user') return 1.1;
  if (column.id === 'source') return 0.72;
  if (column.id === 'type') return 0.58;
  if (column.id === 'method') return 0.56;
  if (column.id === 'ip') return 0.72;
  if (column.id === 'status') return 0.62;
  if (column.id === 'duration') return 0.62;
  return 1;
}

function isCenteredActivityLogColumn(columnId: SettingsActivityLogTableColumn['id']) {
  return (
    columnId === 'method' ||
    columnId === 'ip' ||
    columnId === 'status' ||
    columnId === 'duration'
  );
}

function getActivityLogStatusStyle(row: SettingsActivityLogRow) {
  if (row.tone === 'success') return styles.statusSuccess;
  if (row.tone === 'warning') return styles.statusWarning;
  return styles.statusMuted;
}

function ActivityLogIconButton({
  accessibilityLabel,
  active = false,
  icon,
  onPress,
  tone = 'default',
}: {
  accessibilityLabel: string;
  active?: boolean;
  icon: 'detail' | 'shield' | 'trash';
  onPress: () => void;
  tone?: 'default' | 'danger';
}) {
  const color = active
    ? V.colors.primary
    : tone === 'danger'
    ? V.colors.danger
    : V.colors.fg;

  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      selected={active}
      style={styles.actionIconButton}
    >
      {icon === 'shield' ? (
        <ActivityLogShieldIcon color={color} />
      ) : icon === 'trash' ? (
        <ActivityLogTrashIcon color={color} />
      ) : (
        <ActivityLogDetailIcon color={color} />
      )}
    </KolamInteractionFrame>
  );
}

function ActivityLogShieldIcon({color}: {color: string}) {
  return (
    <Svg height={17} viewBox="0 0 24 24" width={17}>
      <Path
        d="M12 3.2 5.2 5.8v5.2c0 4.3 2.8 8.2 6.8 9.8 4-1.6 6.8-5.5 6.8-9.8V5.8L12 3.2Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="m9.2 12 1.9 1.9 3.9-4.1"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function ActivityLogDetailIcon({color}: {color: string}) {
  return (
    <SvgXml
      height={17}
      width={17}
      xml={KOLAM_DETAIL_BUTTON_ICON_SVG.replace(/#000000/g, color)}
    />
  );
}

function ActivityLogTrashIcon({color}: {color: string}) {
  return (
    <Svg height={17} viewBox="0 0 24 24" width={17}>
      <Path
        d="M4 7h16"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d="M9 7V5.4C9 4.6 9.6 4 10.4 4h3.2c.8 0 1.4.6 1.4 1.4V7"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="M6.5 7.5 7.4 19c.1.7.7 1 1.3 1h6.6c.7 0 1.2-.4 1.3-1l.9-11.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="M10 11v5M14 11v5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
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

function noopBlockActivityLogIp(_ip: string) {}

const styles = StyleSheet.create({
  toolbarWrap: {
    zIndex: 100000,
  },
  messageText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 8,
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
  bodyCellCenter: {
    textAlign: 'center',
    width: '100%',
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
    color: V.colors.fg,
    fontWeight: '800',
  },
  statusSuccess: {
    color: '#065f46',
    fontWeight: '900',
  },
  statusWarning: {
    color: '#92400e',
    fontWeight: '900',
  },
  actionIconsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
  },
  actionIconButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 0,
    height: 24,
    justifyContent: 'center',
    padding: 0,
    width: 24,
  },
});
