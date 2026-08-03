/**
 * Transaksi Copilot — Pusat AI tab.
 * SoT: FE `ShippingCopilotDashboardPanel` + BE shipping-copilot routes.
 */

import {formatKolamOwnerCopilotWib} from './kolam-pusat-ai-owner-copilot';

export type KolamTransaksiCopilotRange = 'today' | 'month' | 'year' | 'all';

export type KolamDeliveryChannelKey = 'shopee' | 'tokopedia' | 'web';

export const KOLAM_TRANSAKSI_COPILOT_RANGES: Array<{
  id: KolamTransaksiCopilotRange;
  label: string;
}> = [
  {id: 'today', label: 'Hari ini'},
  {id: 'month', label: 'Bulan ini'},
  {id: 'year', label: 'Tahun ini'},
  {id: 'all', label: 'Semua'},
];

export const KOLAM_DELIVERY_CHANNELS: KolamDeliveryChannelKey[] = [
  'shopee',
  'tokopedia',
  'web',
];

export const KOLAM_TRANSAKSI_COPILOT_DESCRIPTION =
  'Statistik transaksi delivery: DARA vs Bot Katak Terbang — per kanal dari Sumber.';

export const KOLAM_TRANSAKSI_COPILOT_OPS_EMPTY = 'Belum ada entri.';

export type KolamDeliveryChannelMeta = {
  sourceId: string | null;
  name: string;
  logo: string | null;
};

export type KolamDeliveryStatsSummary = {
  value: number;
  change: number;
  data: Array<{timestamp: string; value: number}>;
  byChannel: Record<KolamDeliveryChannelKey, number>;
};

export type KolamShippingDeliveryStats = {
  generatedAt: string;
  range: string;
  note: string;
  dara: KolamDeliveryStatsSummary;
  bot: KolamDeliveryStatsSummary;
  katakTerbangProfile: {
    name: string;
    photoUrl: string;
  };
  channelSources: Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta>;
};

export type KolamShippingOpsEvent = {
  id: string;
  at: string;
  eventType: string;
  action: string;
  invoiceCode: string;
  phase: string;
  detail: string;
};

export type KolamShippingOpsLog = {
  generatedAt: string;
  lookbackHours: number;
  dara: KolamShippingOpsEvent[];
  bot: KolamShippingOpsEvent[];
};

export type KolamKatakTerbangPlatformHealth = {
  platform: string;
  enabled: boolean;
  healthy: boolean | null;
  state: string;
  reason: string;
};

export type KolamKatakTerbangHealth = {
  checkedAt: string;
  overallHealthy: boolean;
  overallState: string;
  amConfigured: boolean;
  amReachable: boolean;
  platforms: KolamKatakTerbangPlatformHealth[];
  notifyRoom: {
    id: string;
    name: string;
    webHref: string;
  } | null;
};

export function formatKolamTransaksiCopilotWib(iso: string | null | undefined) {
  return formatKolamOwnerCopilotWib(iso);
}

export function formatKolamTransaksiCopilotRoomLabel(room: {
  _id?: string;
  id?: string;
  name?: string;
  isGeneral?: boolean;
}) {
  if (room.isGeneral) {
    return 'General';
  }
  const name = typeof room.name === 'string' ? room.name.trim() : '';
  if (name) {
    return name;
  }
  const id = String(room._id || room.id || '');
  return id ? `Room ${id.slice(-6)}` : 'Room';
}

export function emptyKolamDeliveryByChannel(): Record<
  KolamDeliveryChannelKey,
  number
> {
  return {shopee: 0, tokopedia: 0, web: 0};
}

export function defaultKolamDeliveryChannelSources(): Record<
  KolamDeliveryChannelKey,
  KolamDeliveryChannelMeta
> {
  return {
    shopee: {sourceId: null, name: 'Shopee', logo: null},
    tokopedia: {sourceId: null, name: 'Tokopedia', logo: null},
    web: {sourceId: null, name: 'Website', logo: null},
  };
}

/** FE `mergeChannelSources`. */
export function mergeKolamDeliveryChannelSources(
  fromStats: Partial<Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta>> | null | undefined,
  fromDb: Partial<Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta>> | null | undefined,
): Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta> {
  const out = defaultKolamDeliveryChannelSources();
  for (const key of KOLAM_DELIVERY_CHANNELS) {
    const a = fromStats?.[key];
    const b = fromDb?.[key];
    out[key] = {
      sourceId: a?.sourceId ?? b?.sourceId ?? null,
      name: a?.name ?? b?.name ?? out[key].name,
      logo: a?.logo ?? b?.logo ?? null,
    };
  }
  return out;
}

export function buildKolamDeliveryChannelSourcesFromRows(
  sources: Array<{
    id?: string;
    _id?: string;
    name?: string;
    logo?: string | null;
    type?: string;
    isMarketplace?: boolean;
  }>,
): Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta> {
  const out = defaultKolamDeliveryChannelSources();
  for (const key of KOLAM_DELIVERY_CHANNELS) {
    out[key] = toChannelMeta(matchChannelSource(sources, key), key);
  }
  return out;
}

function matchChannelSource(
  sources: Array<{
    id?: string;
    _id?: string;
    name?: string;
    logo?: string | null;
    type?: string;
    isMarketplace?: boolean;
  }>,
  channel: KolamDeliveryChannelKey,
) {
  if (channel === 'shopee') {
    return sources.find(s => /shopee/i.test(String(s.name || ''))) ?? null;
  }
  if (channel === 'tokopedia') {
    return sources.find(s => /tokopedia/i.test(String(s.name || ''))) ?? null;
  }
  return (
    sources.find(
      s =>
        s.type === 'online' &&
        !s.isMarketplace &&
        /website|webstore/i.test(String(s.name || '')),
    ) ??
    sources.find(s => s.type === 'online' && !s.isMarketplace) ??
    null
  );
}

function toChannelMeta(
  row: {
    id?: string;
    _id?: string;
    name?: string;
    logo?: string | null;
  } | null,
  channel: KolamDeliveryChannelKey,
): KolamDeliveryChannelMeta {
  if (row) {
    return {
      sourceId: String(row._id || row.id || '') || null,
      name: String(row.name || ''),
      logo: row.logo ?? null,
    };
  }
  return {
    sourceId: null,
    name:
      channel === 'web'
        ? 'Website'
        : channel.charAt(0).toUpperCase() + channel.slice(1),
    logo: null,
  };
}

export function normalizeKolamShippingDeliveryStats(
  payload: unknown,
): KolamShippingDeliveryStats | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  const profile = asRecord(data.katakTerbangProfile);
  const channelSourcesRaw = asRecord(data.channelSources);
  return {
    generatedAt: toIsoString(data.generatedAt),
    range: typeof data.range === 'string' ? data.range : 'month',
    note:
      typeof data.note === 'string' && data.note.trim()
        ? data.note.trim()
        : 'Order delivery ditangani DARA vs Katak Terbang — mutually exclusive, tanpa omzet.',
    dara: normalizeSummary(data.dara),
    bot: normalizeSummary(data.bot),
    katakTerbangProfile: {
      name: typeof profile.name === 'string' ? profile.name.trim() : '',
      photoUrl:
        typeof profile.photoUrl === 'string' ? profile.photoUrl.trim() : '',
    },
    channelSources: mergeKolamDeliveryChannelSources(
      {
        shopee: normalizeChannelMeta(channelSourcesRaw.shopee, 'shopee'),
        tokopedia: normalizeChannelMeta(
          channelSourcesRaw.tokopedia,
          'tokopedia',
        ),
        web: normalizeChannelMeta(channelSourcesRaw.web, 'web'),
      },
      null,
    ),
  };
}

export function normalizeKolamShippingOpsLog(
  payload: unknown,
): KolamShippingOpsLog | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  return {
    generatedAt: toIsoString(data.generatedAt),
    lookbackHours: toFiniteNumber(data.lookbackHours) || 72,
    dara: normalizeOpsEvents(data.dara),
    bot: normalizeOpsEvents(data.bot),
  };
}

export function normalizeKolamKatakTerbangHealth(
  payload: unknown,
): KolamKatakTerbangHealth | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  const notify = asRecord(data.notifyRoom);
  const platforms = Array.isArray(data.platforms)
    ? data.platforms
        .map(item => {
          const row = asRecord(item);
          const platform =
            typeof row.platform === 'string' ? row.platform.trim() : '';
          if (!platform) {
            return null;
          }
          return {
            platform,
            enabled: row.enabled === true,
            healthy:
              row.healthy === true
                ? true
                : row.healthy === false
                  ? false
                  : null,
            state: typeof row.state === 'string' ? row.state : '',
            reason: typeof row.reason === 'string' ? row.reason.trim() : '',
          };
        })
        .filter((item): item is KolamKatakTerbangPlatformHealth => item != null)
    : [];

  return {
    checkedAt: toIsoString(data.checkedAt),
    overallHealthy: data.overallHealthy === true,
    overallState:
      typeof data.overallState === 'string' ? data.overallState : '',
    amConfigured: data.amConfigured === true,
    amReachable: data.amReachable === true,
    platforms,
    notifyRoom:
      typeof notify.id === 'string' && notify.id.trim()
        ? {
            id: notify.id.trim(),
            name:
              typeof notify.name === 'string' && notify.name.trim()
                ? notify.name.trim()
                : 'Team Chat',
            webHref:
              typeof notify.webHref === 'string' ? notify.webHref.trim() : '',
          }
        : null,
  };
}

function normalizeSummary(value: unknown): KolamDeliveryStatsSummary {
  const row = asRecord(value);
  const byChannel = asRecord(row.byChannel);
  const data = Array.isArray(row.data)
    ? row.data
        .map(item => {
          const point = asRecord(item);
          const timestamp =
            typeof point.timestamp === 'string' ? point.timestamp : '';
          if (!timestamp) {
            return null;
          }
          return {timestamp, value: toFiniteNumber(point.value)};
        })
        .filter(
          (item): item is {timestamp: string; value: number} => item != null,
        )
    : [];

  return {
    value: toFiniteNumber(row.value),
    change: toFiniteNumber(row.change),
    data,
    byChannel: {
      shopee: toFiniteNumber(byChannel.shopee),
      tokopedia: toFiniteNumber(byChannel.tokopedia),
      web: toFiniteNumber(byChannel.web),
    },
  };
}

function normalizeChannelMeta(
  value: unknown,
  channel: KolamDeliveryChannelKey,
): KolamDeliveryChannelMeta {
  const row = asRecord(value);
  if (!Object.keys(row).length) {
    return defaultKolamDeliveryChannelSources()[channel];
  }
  return {
    sourceId:
      typeof row.sourceId === 'string' && row.sourceId.trim()
        ? row.sourceId.trim()
        : null,
    name:
      typeof row.name === 'string' && row.name.trim()
        ? row.name.trim()
        : defaultKolamDeliveryChannelSources()[channel].name,
    logo: typeof row.logo === 'string' && row.logo.trim() ? row.logo.trim() : null,
  };
}

function normalizeOpsEvents(value: unknown): KolamShippingOpsEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const id =
        (typeof row.id === 'string' && row.id) ||
        (typeof row._id === 'string' && row._id) ||
        '';
      if (!id) {
        return null;
      }
      return {
        id,
        at: toIsoString(row.at),
        eventType: typeof row.eventType === 'string' ? row.eventType : '',
        action: typeof row.action === 'string' ? row.action : '',
        invoiceCode:
          typeof row.invoiceCode === 'string' ? row.invoiceCode.trim() : '',
        phase: typeof row.phase === 'string' ? row.phase : '',
        detail: typeof row.detail === 'string' ? row.detail.trim() : '',
      };
    })
    .filter((item): item is KolamShippingOpsEvent => item != null);
}

function toIsoString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
