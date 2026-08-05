import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatFinanceExpenseDateTime,
  formatFinanceExpenseStatusLabel,
  getKolamFinanceExpenseRoot,
} from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamUnexpectedExpenseDetailController,
  type KolamUnexpectedExpenseDetailController,
} from '../hooks/use-kolam-unexpected-expense-detail-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamDescriptionList } from './kolam-description-list';
import type { KolamDescriptionListRow } from './kolam-description-list-types';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSurfacePanelTabs } from './kolam-surface-panel-tabs';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamUnexpectedExpenseDetailSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamUnexpectedExpenseDetailController(
    route,
    onRouteChange,
  );

  if (!controller) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() =>
              onRouteChange(getKolamFinanceExpenseRoot('unexpected-expense'))
            }
            style={styles.backButton}
          />
        ) : null}
      </View>
    );
  }

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={controller.onBack}
          style={styles.backButton}
        />
      </View>
    );
  }

  if (controller.loading && !controller.detail) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="Memuat…" title="Pengeluaran Tak Terduga" />
      </View>
    );
  }

  if (!controller.detail) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message={controller.error || undefined}
          title="Tidak ditemukan"
        />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={controller.onBack}
          style={styles.backButton}
        />
      </View>
    );
  }

  return <UnexpectedExpenseDetailBody controller={controller} />;
}

function UnexpectedExpenseDetailBody({
  controller,
}: {
  controller: KolamUnexpectedExpenseDetailController;
}) {
  const detail = controller.detail!;

  const infoRows = useMemo((): KolamDescriptionListRow[] => {
    return [
      {
        id: 'code',
        label: 'Kode',
        value: detail.code || '—',
        meta: '',
        tone: 'default',
      },
      {
        id: 'name',
        label: 'Nama Pengeluaran',
        value: detail.name || '—',
        meta: '',
        tone: 'default',
      },
      {
        id: 'status',
        label: 'Status',
        value: formatFinanceExpenseStatusLabel(detail.status),
        meta: '',
        tone:
          detail.status === 'verified'
            ? 'success'
            : detail.status === 'unverified'
              ? 'warning'
              : 'default',
      },
      {
        id: 'amount',
        label: 'Jumlah',
        value: formatRupiah(detail.amount),
        meta: '',
        tone: 'danger',
      },
      {
        id: 'executedAt',
        label: 'Tanggal Eksekusi',
        value: formatFinanceExpenseDateTime(detail.executedAt),
        meta: '',
        tone: 'default',
      },
      {
        id: 'wallet',
        label: 'Dompet',
        value: detail.walletLabel || 'Dompet Utama Default',
        meta: '',
        tone: 'default',
        onPress: detail.walletId ? controller.onOpenWallet : undefined,
      },
      {
        id: 'reason',
        label: 'Alasan',
        value: detail.reason.trim() || 'Tidak ada alasan',
        meta: '',
        tone: 'default',
      },
      {
        id: 'createdAt',
        label: 'Dibuat Pada',
        value: formatFinanceExpenseDateTime(detail.createdAt),
        meta: '',
        tone: 'default',
      },
      {
        id: 'updatedAt',
        label: 'Terakhir Diperbarui',
        value: formatFinanceExpenseDateTime(detail.updatedAt),
        meta: '',
        tone: 'default',
      },
    ];
  }, [controller.onOpenWallet, detail]);

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={styles.headerCopy}>
            <Text numberOfLines={2} style={styles.headerTitle}>
              {detail.name || detail.code || 'Pengeluaran'}
            </Text>
            <Text numberOfLines={2} style={styles.headerSubtitle}>
              {detail.reason.trim() ||
                'Detail dan informasi Pengeluaran Tak Terduga'}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Muat ulang"
              intent="secondary"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {controller.canShowVerify ? (
              <KolamButton
                disabled={controller.verifying}
                intent="primary"
                label={controller.verifying ? 'Memverifikasi…' : 'Verifikasi'}
                onPress={() => {
                  void controller.onVerify();
                }}
              />
            ) : null}
            {controller.canUpdate ? (
              <KolamButton
                intent="secondary"
                label="Ubah"
                onPress={controller.onEdit}
              />
            ) : null}
            <KolamButton
              intent="secondary"
              label="Kembali"
              onPress={controller.onBack}
            />
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <KolamSurfacePanelTabs
        onSelectTab={tabId =>
          controller.onSelectTab(tabId as 'details' | 'history')
        }
        selectedTabId={controller.tab}
        tabs={controller.tabs.map(tab => ({
          id: tab.id,
          label: tab.label,
        }))}
      />

      <ScrollView contentContainerStyle={styles.bodyScroll} style={styles.body}>
        {controller.tab === 'history' ? (
          <View style={styles.historyList}>
            {controller.historyItems.length === 0 ? (
              <KolamEmptyState compact title="Belum ada riwayat" />
            ) : (
              controller.historyItems.map(item => (
                <View key={item.id} style={styles.historyCard}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyMeta}>{item.atLabel}</Text>
                  {item.lines.map(line => (
                    <Text key={line} style={styles.historyLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.detailBlock}>
            <KolamDescriptionList rows={infoRows} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  headerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  banner: {
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  bodyScroll: {
    gap: 12,
    paddingBottom: 24,
  },
  detailBlock: {
    gap: 12,
  },
  historyList: {
    gap: 8,
  },
  historyCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    padding: 12,
  },
  historyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  historyMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  historyLine: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
});
