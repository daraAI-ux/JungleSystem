import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {KolamDaraTaxDashboard} from '../domain/kolam-dara-tax';
import type {KolamDaraTaxPeriod} from '../domain/kolam-finance-tax';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {createKolamDaraTaxReportDraft} from '../services/kolam-dara-tax-api';
import {KolamButton} from './kolam-button';
import {KolamStatusBadge} from './kolam-status-badge';

/** FE `TaxIntelligenceDashboard` tab Laporan. */
export function KolamDaraTaxLaporanBody({
  canDraft,
  dashboard,
  loading,
  onRefresh,
  period,
  taxEnabled,
}: {
  canDraft: boolean;
  dashboard: KolamDaraTaxDashboard | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  period: KolamDaraTaxPeriod;
  taxEnabled: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const reports = dashboard?.draftReports ?? [];

  if (!taxEnabled) {
    return null;
  }

  const onCreate = async () => {
    setCreating(true);
    setNotice('');
    try {
      await createKolamDaraTaxReportDraft({
        reportType: 'monthly_summary',
        period,
      });
      setNotice('Draf laporan dibuat');
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal membuat draf',
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      {loading && !dashboard ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.sectionTitle}>Draf laporan pajak</Text>
            {canDraft ? (
              <KolamButton
                disabled={creating}
                intent="secondary"
                label={creating ? 'Membuat…' : 'Buat draf ringkasan'}
                onPress={() => {
                  void onCreate();
                }}
                size="sm"
              />
            ) : null}
          </View>
          <Text style={styles.meta}>Ringkasan estimasi periode terpilih.</Text>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {reports.length === 0 ? (
            <Text style={styles.meta}>Belum ada draf laporan.</Text>
          ) : (
            reports.map(row => (
              <View key={row.id} style={styles.row}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <KolamStatusBadge
                  intent="secondary"
                  label={formatReportStatusLabel(row.status)}
                />
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

function formatReportStatusLabel(status: string) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'draft') {
    return 'Draf';
  }
  if (normalized === 'approved') {
    return 'Disetujui';
  }
  if (normalized === 'rejected') {
    return 'Ditolak';
  }
  if (normalized === 'submitted') {
    return 'Dikirim';
  }
  return status || '—';
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
