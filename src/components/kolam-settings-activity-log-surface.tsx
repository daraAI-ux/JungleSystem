import React from 'react';
import type {
  SettingsActivityLogDetailField,
  SettingsActivityLogFilterControl,
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
  onPageChange,
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
  onPageChange: (page: number) => void;
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
