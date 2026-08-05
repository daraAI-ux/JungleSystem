import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  formatCrossSyncObservabilityAge,
  type KolamCrossSyncObservabilityReport,
} from '../domain/kolam-cross-sync-observability';
import { KOLAM_STOCK_TRANSACTION_ROOT } from '../domain/kolam-stock-transaction';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamStatusBadge } from './kolam-status-badge';

export function KolamStockCrossSyncObservabilityPanel({
  errorMessage,
  fetching,
  loading,
  onRefresh,
  onRouteChange,
  report,
}: {
  errorMessage?: string;
  fetching: boolean;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onRouteChange?: (route: string) => void;
  report: KolamCrossSyncObservabilityReport | null;
}) {
  if (loading && !report) {
    return (
      <KolamCardFrame style={styles.frame} variant="compact">
        <Text style={styles.muted}>Memuat observability cross-sync…</Text>
      </KolamCardFrame>
    );
  }

  if ((errorMessage || !report) && !loading) {
    return (
      <KolamCardFrame style={styles.frame} variant="compact">
        <Text style={styles.title}>Observability sync AM</Text>
        <Text style={styles.muted}>
          Observability cross-sync tidak tersedia
        </Text>
        <Text style={styles.muted}>
          {errorMessage || 'Gagal memuat laporan'}
        </Text>
        <KolamRefreshButton
          accessibilityLabel="Refresh"
          disabled={fetching}
          onPress={() => {
            void onRefresh();
          }}
        />
      </KolamCardFrame>
    );
  }

  if (!report) {
    return null;
  }

  const doubles = report.doubleTaskAlerts.slice(0, 5);
  const races = report.raceTargetStockAlerts.slice(0, 5);
  const stuck = report.stuckPending.slice(0, 5);
  const orphans = report.orphanAmTasks.slice(0, 5);

  return (
    <KolamCardFrame style={styles.frame} variant="compact">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Observability sync AM</Text>
            <KolamStatusBadge
              intent={report.healthy ? 'success' : 'warning'}
              label={report.healthy ? 'Sehat' : `${report.alertCount} alert`}
            />
          </View>
        </View>
        <KolamRefreshButton
          accessibilityLabel="Refresh"
          disabled={fetching}
          onPress={() => {
            void onRefresh();
          }}
        />
      </View>

      <View style={styles.countsRow}>
        <Text style={styles.countText}>
          Audit tx: {report.counts.transactionsWithAudit}
        </Text>
        <Text style={styles.countText}>
          Pending taskId Kolam: {report.counts.kolamPendingTaskIds}
        </Text>
        <Text style={styles.countText}>
          AM in-flight: {report.counts.amInFlightStockSync}
        </Text>
        <Text style={styles.countText}>
          Coalesce groups: {report.coalesceGroups.length}
        </Text>
        {report.amError ? (
          <Text style={styles.dangerText}>AM: {report.amError}</Text>
        ) : null}
      </View>

      {!report.healthy ? (
        <View style={styles.alerts}>
          {doubles.map(row => (
            <AlertRow
              key={`d-${row.sku}-${row.platform}-${row.distinctTaskIds.join(
                ',',
              )}`}
              body={`${row.sku} → ${row.platform}: ${row.distinctTaskIds.join(
                ', ',
              )}`}
              intent="danger"
              label="Double task"
              onRouteChange={onRouteChange}
              txIds={row.stockTxIds}
            />
          ))}
          {races.map(row => (
            <AlertRow
              key={`r-${row.sku}-${row.platform}-${row.targetStocks.join('/')}`}
              body={`${row.sku} → ${
                row.platform
              }: targetStock ${row.targetStocks.join(' / ')}`}
              intent="warning"
              label="Race stock"
              onRouteChange={onRouteChange}
              txIds={row.stockTxIds}
            />
          ))}
          {stuck.map(row => (
            <AlertRow
              key={`s-${row.stockTxId || row.taskId}-${row.platform}`}
              body={`${row.sku || '?'} → ${
                row.platform
              } · ${formatCrossSyncObservabilityAge(row.ageMs)} · task ${
                row.taskId || '—'
              }`}
              intent="warning"
              label="Stuck pending"
              onRouteChange={onRouteChange}
              txIds={row.stockTxId ? [row.stockTxId] : row.stockTxIds}
            />
          ))}
          {orphans.map(row => (
            <AlertRow
              key={`o-${row.taskId}`}
              body={`task ${row.taskId} (${
                row.platform || '?'
              }) — tidak ada pending di Kolam`}
              intent="warning"
              label="Orphan AM"
              onRouteChange={onRouteChange}
            />
          ))}
        </View>
      ) : null}
    </KolamCardFrame>
  );
}

function AlertRow({
  body,
  intent,
  label,
  onRouteChange,
  txIds,
}: {
  body: string;
  intent: 'danger' | 'warning';
  label: string;
  onRouteChange?: (route: string) => void;
  txIds?: string[];
}) {
  const firstTx = txIds?.[0];
  return (
    <View style={styles.alertRow}>
      <KolamStatusBadge intent={intent} label={label} />
      <Text style={styles.alertBody}>{body}</Text>
      {firstTx ? (
        <KolamButton
          label="Lihat tx"
          onPress={() =>
            onRouteChange?.(`${KOLAM_STOCK_TRANSACTION_ROOT}/${firstTx}`)
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: V.colors.primarySoft,
    borderColor: '#b7e4c7',
    gap: 6,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerCopy: {
    flex: 1,
    minWidth: 220,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#14532d',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  muted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 15,
  },
  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 3,
  },
  countText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 14,
  },
  dangerText: {
    color: V.colors.danger,
    fontSize: 11,
    lineHeight: 14,
  },
  alerts: {
    gap: 5,
  },
  alertRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  alertBody: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 160,
    color: V.colors.fg,
    fontSize: 11,
    lineHeight: 14,
  },
});
