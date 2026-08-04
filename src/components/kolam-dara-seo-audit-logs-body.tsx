import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoAuditLogsController} from '../hooks/use-kolam-dara-seo-audit-logs-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamDaraSeoAuditLogsBody({
  controller,
}: {
  controller: KolamDaraSeoAuditLogsController;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.toolbar}>
        <KolamButton
          disabled={controller.loading}
          label={controller.loading ? 'Memuat…' : 'Refresh'}
          onPress={() => {
            void controller.onRefresh();
          }}
        />
      </View>

      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {!controller.loading && !controller.error && !controller.rows.length ? (
        <KolamEmptyState title="Belum ada entri audit." />
      ) : null}

      {controller.rows.length ? (
        <View style={styles.table}>
          <View style={styles.headRow}>
            <Text style={[styles.headCell, styles.colAction]}>Aksi</Text>
            <Text style={[styles.headCell, styles.colProduct]}>Produk</Text>
            <Text style={[styles.headCell, styles.colTime]}>Waktu</Text>
          </View>
          {controller.rows.map(row => (
            <View key={row.id} style={styles.bodyRow}>
              <Text style={[styles.bodyCell, styles.colAction]}>
                {row.action}
              </Text>
              <Text style={[styles.bodyCell, styles.colProduct]}>
                {row.productId ? row.productId.slice(-8) : '—'}
              </Text>
              <Text style={[styles.bodyCell, styles.colTime]}>
                {row.createdAt
                  ? new Date(row.createdAt).toLocaleString('id-ID')
                  : '—'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  toolbar: {alignItems: 'flex-end'},
  table: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headRow: {
    backgroundColor: V.colors.muted,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headCell: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  bodyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bodyCell: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  colAction: {flex: 2},
  colProduct: {flex: 1},
  colTime: {flex: 1},
});
