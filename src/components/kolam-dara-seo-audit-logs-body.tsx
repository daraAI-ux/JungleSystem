import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {KOLAM_DARA_SEO_AUDIT_LOGS_PAGE_SIZE} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoAuditLogsController} from '../hooks/use-kolam-dara-seo-audit-logs-controller';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamListTableComposition} from './kolam-list-table-composition';

/**
 * FE parity table chrome: same 10/page + KolamListTableComposition as SEO tables.
 */
export function KolamDaraSeoAuditLogsBody({
  controller,
}: {
  controller: KolamDaraSeoAuditLogsController;
}) {
  const showTable = controller.pagedItems.length > 0;

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.content} style={styles.scroll}>
      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {!controller.loading && !controller.error && !controller.rows.length ? (
        <KolamEmptyState title="Belum ada entri audit." />
      ) : null}

      {showTable ? (
        <KolamListTableComposition
          columns={[
            {
              flex: 2,
              id: 'action',
              label: 'Aksi',
              render: row => <Text style={styles.bodyCell}>{row.action}</Text>,
            },
            {
              flex: 1,
              id: 'product',
              label: 'Produk',
              render: row => (
                <Text style={styles.bodyCell}>
                  {row.productId ? row.productId.slice(-8) : '—'}
                </Text>
              ),
            },
            {
              flex: 1,
              id: 'time',
              label: 'Waktu',
              render: row => (
                <Text style={styles.bodyCell}>
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleString('id-ID')
                    : '—'}
                </Text>
              ),
            },
          ]}
          getRowKey={row => row.id}
          pagination={{
            onPageChange: controller.onSetPage,
            page: controller.page,
            pageSize: KOLAM_DARA_SEO_AUDIT_LOGS_PAGE_SIZE,
            total: controller.total,
          }}
          rows={controller.pagedItems}
          style={styles.tableShell}
        />
      ) : null}
    </KolamDetailScrollSurface>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  tableShell: {
    alignSelf: 'stretch',
    width: '100%',
  },
  bodyCell: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
