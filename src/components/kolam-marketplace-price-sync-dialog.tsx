import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  cancelKolamMarketplaceTask,
  getKolamMarketplacePriceSyncActiveTasks,
  getKolamMarketplaceStockSyncActiveTasks,
  getKolamMarketplaceTask,
  syncKolamMarketplacePrice,
  syncKolamMarketplaceStock,
  type KolamMarketplacePlatform,
  type KolamMarketplacePriceSyncTaskProgress,
  type KolamMarketplacePriceSyncTaskResult,
  type KolamMarketplaceSyncSource,
  type KolamMarketplaceTaskStatus,
} from '../services/kolam-marketplace-sync-api';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import { KolamModalBackdrop } from './kolam-modal-backdrop';

type MarketplaceSyncKind = 'price' | 'stock';
type PriceSyncStatus = KolamMarketplaceTaskStatus | 'dispatch_failed' | 'idle';

type PlatformState = {
  completedAt: string | null;
  error: string | null;
  itemCount: number;
  progress: KolamMarketplacePriceSyncTaskProgress | null;
  result: KolamMarketplacePriceSyncTaskResult | null;
  startedAt: string | null;
  status: PriceSyncStatus;
  taskId: string | null;
};

const PLATFORMS: KolamMarketplacePlatform[] = ['tokopedia', 'shopee'];
const PLATFORM_LABELS: Record<KolamMarketplacePlatform, string> = {
  shopee: 'Shopee',
  tokopedia: 'Tokopedia',
};

const IDLE_PLATFORM_STATE: PlatformState = {
  completedAt: null,
  error: null,
  itemCount: 0,
  progress: null,
  result: null,
  startedAt: null,
  status: 'idle',
  taskId: null,
};

export function KolamMarketplacePriceSyncDialog({
  initialPlatforms,
  itemCount,
  onOpenChange,
  productIds,
  source,
  speciesIds,
  syncKind = 'price',
  title,
  visible,
}: {
  initialPlatforms?: KolamMarketplacePlatform[];
  itemCount: number;
  onOpenChange: (open: boolean) => void;
  productIds?: string[];
  source: KolamMarketplaceSyncSource;
  speciesIds?: string[];
  syncKind?: MarketplaceSyncKind;
  title?: string;
  visible: boolean;
}) {
  const [dispatching, setDispatching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<
    KolamMarketplacePlatform[]
  >(initialPlatforms?.length ? [...initialPlatforms] : [...PLATFORMS]);
  const [state, setState] = React.useState(createEmptyState);
  const [totalItems, setTotalItems] = React.useState(0);

  const hasActiveTask = PLATFORMS.some(platform =>
    isRunningStatus(state[platform].status),
  );
  const hasVisibleTask = PLATFORMS.some(
    platform => state[platform].status !== 'idle',
  );
  const displayedTotal = totalItems || itemCount;
  const copy = React.useMemo(
    () => getSyncKindCopy(syncKind, title),
    [syncKind, title],
  );

  const hydrateActiveTasks = React.useCallback(async () => {
    try {
      const tasks = syncKind === 'stock'
        ? await getKolamMarketplaceStockSyncActiveTasks()
        : await getKolamMarketplacePriceSyncActiveTasks();
      const next = createEmptyState();
      let maxItems = 0;

      for (const task of tasks) {
        const platform = normalizePlatform(
          task.payload?.platform ?? task.serviceAccountId?.platform,
        );
        if (!platform) {
          continue;
        }

        const count = task.progress?.total ?? task.payload?.items?.length ?? 0;
        maxItems = Math.max(maxItems, count);
        next[platform] = {
          completedAt: task.completedAt ?? null,
          error: task.error ?? null,
          itemCount: count,
          progress: task.progress ?? null,
          result: task.result ?? null,
          startedAt: task.startedAt ?? null,
          status: task.status,
          taskId: task._id,
        };
      }

      if (maxItems > 0) {
        setTotalItems(maxItems);
        setState(next);
      }
    } catch (hydrateError) {
      setError(getErrorMessage(hydrateError, copy.hydrateError));
    }
  }, [copy.hydrateError, syncKind]);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedPlatforms(initialPlatforms?.length ? [...initialPlatforms] : [...PLATFORMS]);
    setError(null);
    void hydrateActiveTasks();
  }, [hydrateActiveTasks, initialPlatforms, visible]);

  React.useEffect(() => {
    if (!visible || !hasActiveTask) {
      return;
    }

    const poll = async () => {
      for (const platform of PLATFORMS) {
        const current = state[platform];
        if (!current.taskId || !isRunningStatus(current.status)) {
          continue;
        }

        try {
          const task = await getKolamMarketplaceTask(current.taskId);
          if (!task) {
            continue;
          }

          setState(previous => ({
            ...previous,
            [platform]: {
              ...previous[platform],
              completedAt: task.completedAt ?? previous[platform].completedAt,
              error: task.error ?? null,
              progress: task.progress ?? null,
              result: task.result ?? null,
              startedAt: task.startedAt ?? previous[platform].startedAt,
              status: task.status,
            },
          }));
        } catch {
          // Keep existing progress visible; the next poll can recover.
        }
      }
    };

    const timer = setInterval(() => {
      void poll();
    }, 3000);
    void poll();

    return () => clearInterval(timer);
  }, [hasActiveTask, state.shopee.status, state.shopee.taskId, state.tokopedia.status, state.tokopedia.taskId, visible]);

  if (!visible) {
    return null;
  }

  const close = () => onOpenChange(false);

  const start = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Pilih minimal satu marketplace.');
      return;
    }

    setDispatching(true);
    setError(null);
    try {
      const syncRequest = syncKind === 'stock'
        ? syncKolamMarketplaceStock
        : syncKolamMarketplacePrice;
      const result = await syncRequest({
        platforms: selectedPlatforms,
        productIds: source === 'products' ? productIds : undefined,
        source,
        speciesIds: source === 'species' ? speciesIds : undefined,
      });
      const next = createEmptyState();
      for (const platform of selectedPlatforms) {
        const row = result.perPlatform[platform];
        next[platform] = {
          ...IDLE_PLATFORM_STATE,
          error: row.error,
          itemCount: row.itemCount || result.totalItems,
          status: row.success ? 'queued' : 'dispatch_failed',
          taskId: row.taskId,
        };
      }
      setTotalItems(result.totalItems);
      setState(next);
    } catch (startError) {
      setError(getErrorMessage(startError, copy.startError));
    } finally {
      setDispatching(false);
    }
  };

  const cancel = async (platform: KolamMarketplacePlatform) => {
    const taskId = state[platform].taskId;
    if (!taskId) {
      return;
    }

    try {
      await cancelKolamMarketplaceTask(taskId);
      setState(previous => ({
        ...previous,
        [platform]: {
          ...previous[platform],
          error: 'Pembatalan sync diminta.',
          status: 'cancelled',
        },
      }));
    } catch (cancelError) {
      setError(getErrorMessage(cancelError, copy.cancelError));
    }
  };

  const togglePlatform = (platform: KolamMarketplacePlatform) => {
    setSelectedPlatforms(previous =>
      previous.includes(platform)
        ? previous.filter(item => item !== platform)
        : [...previous, platform],
    );
  };

  return (
    <View style={styles.overlay}>
      <KolamModalBackdrop onPress={close} />
      <View accessibilityLabel={copy.title} style={styles.dialog}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.description}>{copy.description}</Text>
          </View>
          <KolamButton label="X" onPress={close} style={styles.closeButton} />
        </View>

        <View style={styles.platformRow}>
          {PLATFORMS.map(platform => {
            const selected = selectedPlatforms.includes(platform);
            return (
              <KolamButton
                intent={selected ? 'primary' : 'secondary'}
                key={platform}
                label={PLATFORM_LABELS[platform]}
                onPress={() => togglePlatform(platform)}
                style={styles.platformButton}
              />
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.syncLabel}>Sinkron: {displayedTotal} item</Text>
          {hasVisibleTask ? (
            PLATFORMS.filter(platform => state[platform].status !== 'idle').map(
              platform => (
                <PriceSyncProgressCard
                  key={platform}
                  onCancel={() => void cancel(platform)}
                  platform={platform}
                  state={state[platform]}
                  totalItems={displayedTotal}
                />
              ),
            )
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptyMessage}>{copy.emptyMessage}</Text>
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <KolamButton label="Tutup" onPress={close} />
          <KolamButton
            disabled={dispatching || hasActiveTask || selectedPlatforms.length === 0}
            intent="primary"
            label={
              hasActiveTask
                ? 'Sinkron berjalan...'
                : hasVisibleTask
                  ? 'Sinkron Lagi'
                  : copy.startLabel
            }
            onPress={() => {
              void start();
            }}
          />
        </View>
      </View>
    </View>
  );
}

function getSyncKindCopy(kind: MarketplaceSyncKind, title?: string) {
  if (kind === 'stock') {
    return {
      title: title ?? 'Sinkron Stok ke Marketplace',
      description:
        'Samakan stok produk atau species ke marketplace pilihan. Tokopedia, Shopee, atau keduanya akan diproses lewat backend Kolam.',
      emptyTitle: 'Belum ada proses sinkron stok.',
      emptyMessage:
        'Tekan Mulai Sinkron Stok untuk mengirim task ke backend Kolam dan AM.',
      hydrateError: 'Gagal membaca progress sinkron stok.',
      startError: 'Gagal memulai sinkron stok.',
      cancelError: 'Gagal membatalkan sinkron stok.',
      startLabel: 'Mulai Sinkron Stok',
    };
  }

  return {
    title: title ?? 'Sinkron Harga ke Marketplace',
    description:
      'Menggunakan Online Price dari katalog sebagai sumber kebenaran. Harga di marketplace diperbarui hanya jika berbeda dari Online Price.',
    emptyTitle: 'Belum ada proses sinkron harga.',
    emptyMessage:
      'Tekan Mulai Sinkron Harga untuk mengirim task ke backend Kolam dan AM.',
    hydrateError: 'Gagal membaca progress sinkron harga.',
    startError: 'Gagal memulai sinkron harga.',
    cancelError: 'Gagal membatalkan sinkron harga.',
    startLabel: 'Mulai Sinkron Harga',
  };
}
function PriceSyncProgressCard({
  onCancel,
  platform,
  state,
  totalItems,
}: {
  onCancel: () => void;
  platform: KolamMarketplacePlatform;
  state: PlatformState;
  totalItems: number;
}) {
  const total = state.result?.total ?? state.progress?.total ?? state.itemCount;
  const processed = state.result
    ? (state.result.synced ?? 0) +
      (state.result.skipped ?? 0) +
      (state.result.notFound ?? 0) +
      (state.result.failed ?? 0)
    : state.progress?.processed ?? 0;
  const isRunning = isRunningStatus(state.status);
  const percent = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : isRunning ? 8 : 100;
  const timeText = getTimeText(state);
  const progressColor = getProgressColor(state.status);

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.platformTitle}>{PLATFORM_LABELS[platform]}</Text>
          <Text style={styles.progressMeta}>{totalItems} item</Text>
          {timeText ? <Text style={styles.progressMeta}>{timeText}</Text> : null}
        </View>
        <View style={styles.statusSide}>
          <Text style={[styles.statusText, getStatusTextStyle(state.status)]}>
            {getStatusLabel(state.status)}
          </Text>
          {isRunning && state.taskId ? (
            <KolamCancelButton
              intent="danger"
              onPress={onCancel}
              style={styles.cancelButton}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { backgroundColor: progressColor, width: `${percent}%` }]} />
      </View>
      <Text style={styles.resultLine}>{getResultLine(state, processed, total)}</Text>
    </View>
  );
}

function createEmptyState(): Record<KolamMarketplacePlatform, PlatformState> {
  return {
    shopee: { ...IDLE_PLATFORM_STATE },
    tokopedia: { ...IDLE_PLATFORM_STATE },
  };
}

function normalizePlatform(value: unknown): KolamMarketplacePlatform | null {
  return value === 'tokopedia' || value === 'shopee' ? value : null;
}

function isRunningStatus(status: PriceSyncStatus) {
  return status === 'pending' || status === 'queued' || status === 'processing';
}

function getStatusLabel(status: PriceSyncStatus) {
  switch (status) {
    case 'cancelled':
      return 'Dibatalkan';
    case 'dispatch_failed':
      return 'Dispatch gagal';
    case 'failed':
      return 'Gagal';
    case 'idle':
      return 'Siap';
    case 'pending':
    case 'queued':
      return 'Antre...';
    case 'processing':
      return 'Memproses...';
    case 'success':
      return 'Selesai ✓';
  }
}

function getProgressColor(status: PriceSyncStatus) {
  if (status === 'success') return '#22c55e';
  if (status === 'failed' || status === 'dispatch_failed') return '#ef4444';
  if (isRunningStatus(status)) return '#3b82f6';
  return '#94a3b8';
}

function getStatusTextStyle(status: PriceSyncStatus) {
  if (status === 'success') return styles.successText;
  if (status === 'failed' || status === 'dispatch_failed') return styles.dangerText;
  if (isRunningStatus(status)) return styles.pendingText;
  return styles.mutedText;
}

function getResultLine(state: PlatformState, processed: number, total: number) {
  if (state.error) {
    return `Error: ${state.error}`;
  }

  const result = state.result;
  if (result) {
    return `${result.synced ?? 0} diperbarui · ${result.skipped ?? 0} sudah sama · ${result.notFound ?? 0} tidak ditemukan · ${result.failed ?? 0} gagal`;
  }

  if (isRunningStatus(state.status) && total > 0) {
    return `${processed} / ${total} diproses`;
  }

  return `${state.itemCount} item dalam antrean`;
}

function getTimeText(state: PlatformState) {
  if (state.completedAt) {
    const prefix = state.status === 'success' ? 'Selesai' : state.status === 'failed' ? 'Gagal' : 'Selesai';
    return `${prefix} ${formatRelative(state.completedAt)}`;
  }

  if (state.startedAt) {
    return `Dimulai ${formatRelative(state.startedAt)}`;
  }

  return null;
}

function formatRelative(iso: string) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) {
    return '';
  }

  const diff = Date.now() - time;
  if (diff < 5000) return 'baru saja';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} detik lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message);
  }

  return fallback;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    zIndex: 160000,
    elevation: 160000,
  },
  dialog: {
    width: 720,
    maxWidth: '90%',
    maxHeight: '86%',
    gap: 14,
    padding: 18,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  description: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 21,
  },
  closeButton: {
    minWidth: 42,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 8,
  },
  platformButton: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  body: {
    gap: 14,
    paddingVertical: 2,
  },
  syncLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  emptyPanel: {
    gap: 6,
    padding: 16,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.muted,
  },
  emptyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyMessage: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  progressCard: {
    gap: 10,
    padding: 14,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  progressHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  platformTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  progressMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  statusSide: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusText: {
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
  },
  successText: {
    color: '#15803d',
  },
  dangerText: {
    color: '#dc2626',
  },
  pendingText: {
    color: '#2563eb',
  },
  mutedText: {
    color: V.colors.mutedFg,
  },
  cancelButton: {
    minHeight: 28,
    paddingHorizontal: 8,
  },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 99,
    backgroundColor: V.colors.muted,
  },
  fill: {
    height: 8,
    borderRadius: 99,
  },
  resultLine: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: '#dc2626',
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});











