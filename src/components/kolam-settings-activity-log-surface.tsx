import React from 'react';
import type {
  SettingsActivityLogDetailField,
  SettingsActivityLogFilterControl,
  SettingsActivityLogFilterState,
  SettingsActivityLogPagination,
  SettingsActivityLogRow,
  SettingsActivityLogStatsCard,
  SettingsActivityLogTableColumn,
} from '../domain/settings-surface';
import {KolamDetailPanel} from './kolam-detail-panel';
import {KolamFilterBar} from './kolam-filter-bar';
import {KolamPaginationFooter} from './kolam-pagination-footer';
import {KolamSettingsActivityLogTable} from './kolam-settings-activity-widgets';
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
      <KolamSettingsActivityLogTable
        columns={columns}
        rows={rows}
        selectedRowId={selectedActivityLogId}
        onSelectRow={onSelectActivityLog}
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
      <KolamPaginationFooter
        accessibilityLabel="components/ui/pagination.tsx mapped to native Activity Log"
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </>
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
