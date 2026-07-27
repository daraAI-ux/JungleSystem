import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  KOLAM_STOCK_OPNAME_ROOT,
  stockOpnameUserDisplayName,
} from '../domain/kolam-stock-opname';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamStockOpnameController } from '../hooks/use-kolam-stock-opname-controller';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';

/**
 * Fondasi surface: route wiring + list fetch smoke.
 * UI list/new/detail lengkap = batch berikutnya (sama perilaku FE).
 */
export function KolamStockOpnameSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamStockOpnameController(route);

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}

      {controller.mode === 'list' ? (
        <View style={styles.listRoot}>
          <View style={styles.headerActions}>
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() =>
                onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/new`)
              }
            />
          </View>

          {controller.loading && controller.items.length === 0 ? (
            <Text style={styles.muted}>Memuat dokumen stock opname…</Text>
          ) : null}

          {!controller.loading && controller.items.length === 0 ? (
            <KolamEmptyState
              title="Belum ada dokumen"
              message="Buat draf baru atau impor Excel (UI impor di batch berikutnya)."
            />
          ) : null}

          {controller.items.map(item => (
            <KolamCardFrame
              key={item.id}
              style={styles.rowCard}
              variant="compact"
            >
              <View style={styles.rowHeader}>
                <Text style={styles.docNumber}>{item.documentNumber}</Text>
                <KolamStatusBadge
                  intent={statusIntent(item.status)}
                  label={item.statusLabel}
                />
              </View>
              <Text style={styles.muted}>
                {item.createdAt || '—'} · PIC{' '}
                {stockOpnameUserDisplayName(item.owner) || '—'}
              </Text>
              <KolamButton
                label="Buka"
                onPress={() =>
                  onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/${item.id}`)
                }
              />
            </KolamCardFrame>
          ))}

          {controller.pagination.totalPages > 1 ? (
            <View style={styles.headerActions}>
              <KolamButton
                disabled={controller.loading || controller.filters.page <= 1}
                label="Sebelumnya"
                onPress={() =>
                  controller.onChangeFilters({
                    page: Math.max(1, controller.filters.page - 1),
                  })
                }
              />
              <Text style={styles.muted}>
                Halaman {controller.pagination.page}/
                {controller.pagination.totalPages} · {controller.pagination.total}{' '}
                dokumen
              </Text>
              <KolamButton
                disabled={
                  controller.loading ||
                  controller.filters.page >= controller.pagination.totalPages
                }
                label="Berikutnya"
                onPress={() =>
                  controller.onChangeFilters({
                    page: controller.filters.page + 1,
                  })
                }
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {controller.mode === 'new' ? (
        <KolamCardFrame style={styles.placeholderCard} variant="compact">
          <Text style={styles.sectionTitle}>Stock opname baru</Text>
          <Text style={styles.muted}>
            Form buat draf (catatan + Buat draf) menyusul di batch berikutnya —
            perilaku sama FE `/stock-opname/new`.
          </Text>
          <KolamButton
            label="Kembali ke daftar"
            onPress={() => onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT)}
          />
        </KolamCardFrame>
      ) : null}

      {controller.mode === 'detail' ? (
        <KolamCardFrame style={styles.placeholderCard} variant="compact">
          <Text style={styles.sectionTitle}>Detail dokumen</Text>
          <Text style={styles.muted}>
            ID: {controller.documentId || '—'}
          </Text>
          <Text style={styles.muted}>
            Header, baris, review, dan posting menyusul di batch berikutnya —
            perilaku sama FE `/stock-opname/[id]`.
          </Text>
          <KolamButton
            label="Kembali ke daftar"
            onPress={() => onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT)}
          />
        </KolamCardFrame>
      ) : null}
    </View>
  );
}

function statusIntent(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'posted':
    case 'partially_posted':
      return 'success';
    case 'ready_to_post':
      return 'info';
    case 'in_review':
      return 'warning';
    case 'rejected':
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  listRoot: {
    flex: 1,
    minHeight: 0,
    gap: 10,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  rowCard: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  docNumber: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  muted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  placeholderCard: {
    gap: 10,
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
});
