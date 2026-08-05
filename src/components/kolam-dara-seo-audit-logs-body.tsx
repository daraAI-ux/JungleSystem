import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoAuditLogsController} from '../hooks/use-kolam-dara-seo-audit-logs-controller';
import {KolamButton} from './kolam-button';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamEmptyState} from './kolam-empty-state';

/**
 * FE parity table chrome: same 10/page + KolamCatalogListTableShell as Mentions/Social.
 */
export function KolamDaraSeoAuditLogsBody({
  controller,
}: {
  controller: KolamDaraSeoAuditLogsController;
}) {
  const showTable = controller.pagedItems.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.toolbar}>
        <KolamRefreshButton
          accessibilityLabel="Refresh"
          disabled={controller.loading}

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

      {showTable ? (
        <KolamCatalogListTableShell
          footer={
            <View style={styles.pager}>
              <KolamButton
                disabled={controller.page <= 1}
                label="Sebelumnya"
                onPress={() => controller.onSetPage(controller.page - 1)}
              />
              <Text style={styles.pageLabel}>
                {`${controller.page} / ${controller.totalPages} · ${controller.total}`}
              </Text>
              <KolamButton
                disabled={controller.page >= controller.totalPages}
                label="Berikutnya"
                onPress={() => controller.onSetPage(controller.page + 1)}
              />
            </View>
          }
          style={styles.tableShell}>
          <View style={styles.table}>
            <View style={styles.headRow}>
              <Text style={[styles.headCell, styles.colAction]}>Aksi</Text>
              <Text style={[styles.headCell, styles.colProduct]}>Produk</Text>
              <Text style={[styles.headCell, styles.colTime]}>Waktu</Text>
            </View>
            {controller.pagedItems.map(row => (
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
        </KolamCatalogListTableShell>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  toolbar: {alignItems: 'flex-end'},
  tableShell: {
    alignSelf: 'stretch',
    width: '100%',
  },
  table: {
    alignSelf: 'stretch',
    width: '100%',
  },
  headRow: {
    backgroundColor: V.colors.muted,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
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
    width: '100%',
  },
  bodyCell: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  colAction: {flex: 2},
  colProduct: {flex: 1},
  colTime: {flex: 1},
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
