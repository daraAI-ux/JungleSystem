import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  formatKolamKpiDatetime,
  type KolamKpiChatReviewRow,
} from '../domain/kolam-kpi';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamKpiChatReviewsController} from '../hooks/use-kolam-kpi-chat-reviews-controller';
import {KolamButton} from './kolam-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamStatusBadge} from './kolam-status-badge';

/** FE `KpiChatReviewsSection`. */
export function KolamKpiChatReviewsBody({enabled}: {enabled: boolean}) {
  const controller = useKolamKpiChatReviewsController({enabled});

  const columns = useMemo(
    () => [
      {
        id: 'reviewedAt',
        label: 'Tgl review',
        flex: 1,
        render: (row: KolamKpiChatReviewRow) => (
          <Text style={styles.meta}>
            {formatKolamKpiDatetime(row.reviewedAt)}
          </Text>
        ),
      },
      {
        id: 'contact',
        label: 'Kontak',
        flex: 1.2,
        render: (row: KolamKpiChatReviewRow) => (
          <View style={styles.stack}>
            <Text style={styles.cellText}>{row.contactLabel || '—'}</Text>
            <Text style={styles.meta}>{row.platform}</Text>
          </View>
        ),
      },
      {
        id: 'chatAt',
        label: 'Tgl chat',
        flex: 1,
        render: (row: KolamKpiChatReviewRow) => (
          <Text style={styles.meta}>
            {formatKolamKpiDatetime(row.conversationStartedAt)}
          </Text>
        ),
      },
      {
        id: 'rating',
        label: '★',
        flex: 0.4,
        render: (row: KolamKpiChatReviewRow) => (
          <Text style={styles.cellText}>{row.rating}</Text>
        ),
      },
      {
        id: 'notes',
        label: 'Catatan',
        flex: 1.4,
        render: (row: KolamKpiChatReviewRow) => (
          <Text style={styles.meta}>{row.reviewNotes || '—'}</Text>
        ),
      },
    ],
    [],
  );

  if (!enabled) {
    return (
      <Text style={styles.meta}>
        Gagal memuat data KPI tim. Periksa izin user:view_by_admin lalu refresh
        halaman.
      </Text>
    );
  }

  return (
    <KolamCardFrame>
      <Text style={styles.sectionTitle}>Review Chat CS</Text>
      <Text style={styles.meta}>Rating 1–3 + catatan review selesai</Text>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
        />
      ) : null}

      <KolamListTableComposition
        columns={columns}
        emptyTitle="Belum ada log review chat."
        getRowKey={row => row.id}
        loading={controller.loading}
        rows={controller.rows}
        showFooter={false}
      />

      {controller.total > controller.limit ? (
        <View style={styles.pager}>
          <KolamButton
            disabled={controller.page <= 1 || controller.loading}
            intent="outline"
            label="← Sebelumnya"
            onPress={() =>
              controller.setPage(page => Math.max(1, page - 1))
            }
            size="sm"
          />
          <Text style={styles.meta}>
            {controller.page} / {controller.totalPages}
          </Text>
          <KolamButton
            disabled={
              controller.page * controller.limit >= controller.total ||
              controller.loading
            }
            intent="outline"
            label="Berikutnya →"
            onPress={() => controller.setPage(page => page + 1)}
            size="sm"
          />
        </View>
      ) : null}
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  stack: {
    gap: 2,
  },
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
});
