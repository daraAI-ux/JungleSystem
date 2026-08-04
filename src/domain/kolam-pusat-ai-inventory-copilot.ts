/**
 * Inventory Copilot — Pusat AI tab.
 * SoT: DA-Dara-Plugin `inventory-copilot-dashboard-panel.tsx` + `inventory-copilot-api.ts`.
 */

import {formatKolamOwnerCopilotWib} from './kolam-pusat-ai-owner-copilot';

export const KOLAM_INVENTORY_COPILOT_DESCRIPTION =
  'Gabungan kesehatan stok (SKU) & antrian gudang — read-only. Koreksi via Products / Stock Opname / PO / Packing.';

export const KOLAM_INVENTORY_COPILOT_OPS_EMPTY = 'Belum ada entri.';
export const KOLAM_INVENTORY_COPILOT_LIST_EMPTY = 'Tidak ada.';
export const KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME = 'Pangeran Isopod';

export type KolamInventoryQueueCounts = {
  lowStock: number;
  outOfStock: number;
  slowMovers: number;
  criticalSku: number;
  openOpnameSessions: number;
  agedOpenOpname: number;
  opnameDraft: number;
  opnameInReview: number;
  opnameReadyToPost: number;
  opnameVarianceDocs: number;
  opnameVarianceQty: number;
  receivingBacklog: number;
  packQueueTotal: number;
  packSlaRisk: number;
};

export type KolamInventoryListLine = {
  key: string;
  text: string;
};

export type KolamInventoryModuleLink = {
  id: string;
  label: string;
  href: string;
};

export type KolamInventoryCopilotDashboard = {
  generatedAt: string;
  lookbackHours: number;
  note: string;
  priorityHint: string;
  counts: KolamInventoryQueueCounts;
  pangeranIsopodProfile: {
    name: string;
    photoUrl: string;
  };
  teamChat: {
    aiRoomId: string;
    roomName: string;
    webHref: string;
    suggestedPrompts: string[];
  };
  links: KolamInventoryModuleLink[];
  lowStockLines: KolamInventoryListLine[];
  varianceLines: KolamInventoryListLine[];
  openOpnameLines: KolamInventoryListLine[];
  physicalQueueLines: KolamInventoryListLine[];
  packHandoffLabel: string;
  slowMoverLines: KolamInventoryListLine[];
  opnameByLocationLines: KolamInventoryListLine[];
};

export type KolamInventoryOpsLogEvent = {
  id: string;
  at: string;
  action: string;
  status: string;
  detail: string;
};

export type KolamInventoryOpsLog = {
  generatedAt: string;
  note: string;
  dara: KolamInventoryOpsLogEvent[];
  bot: KolamInventoryOpsLogEvent[];
};

export type KolamPangeranIsopodPlatformHealth = {
  platform: string;
  enabled: boolean;
  healthy: boolean | null;
  state: string;
  reason: string;
};

export type KolamPangeranIsopodHealth = {
  checkedAt: string;
  overallHealthy: boolean | null;
  overallState: string;
  platforms: KolamPangeranIsopodPlatformHealth[];
  notifyRoom: {
    id: string;
    name: string;
    webHref: string;
  } | null;
  note: string;
};

export function formatKolamInventoryCopilotWib(iso: string | null | undefined) {
  return formatKolamOwnerCopilotWib(iso);
}

export function formatKolamInventoryCopilotRoomLabel(room: {
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

export function formatKolamInventoryCopilotIdr(value?: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

/** Map FE web link paths to RNW routes when known. */
export function mapKolamInventoryCopilotHref(href: string) {
  const raw = String(href || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('/products')) {
    return '/products';
  }
  if (raw.startsWith('/stock-opname') || raw.includes('stock-opname')) {
    return '/stock-opname';
  }
  if (raw.startsWith('/locations') || raw.startsWith('/lokasi')) {
    return '/locations';
  }
  if (raw.startsWith('/purchase-order') || raw.includes('purchase-order')) {
    return '/purchase-order';
  }
  if (raw.startsWith('/packing') || raw.includes('packing')) {
    return raw.startsWith('/') ? raw.split('?')[0] : '/packing-materials';
  }
  if (raw.startsWith('/team-chat')) {
    return raw;
  }
  return raw.startsWith('/') ? raw.split('?')[0] : raw;
}

export function normalizeKolamInventoryCopilotDashboard(
  payload: unknown,
): KolamInventoryCopilotDashboard | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  const queue = asRecord(data.queue);
  const counts = asRecord(queue.counts);
  const profile = asRecord(data.pangeranIsopodProfile);
  const teamChat = asRecord(data.teamChat);
  const linksRaw = asRecord(data.links);
  const packHandoff = asRecord(queue.packHandoff);
  const locationDepth = asRecord(queue.locationDepth);

  const openOpnameSource = Array.isArray(queue.openOpnameSample)
    ? queue.openOpnameSample
    : Array.isArray(queue.agedOpnameItems)
      ? queue.agedOpnameItems
      : [];

  return {
    generatedAt: toIsoString(data.generatedAt),
    lookbackHours: toFiniteNumber(data.lookbackHours) || 24,
    note: typeof data.note === 'string' ? data.note.trim() : '',
    priorityHint:
      typeof queue.priorityHint === 'string' ? queue.priorityHint.trim() : '',
    counts: {
      lowStock: toFiniteNumber(counts.lowStock),
      outOfStock: toFiniteNumber(counts.outOfStock),
      slowMovers: toFiniteNumber(counts.slowMovers),
      criticalSku: toFiniteNumber(counts.criticalSku),
      openOpnameSessions: toFiniteNumber(counts.openOpnameSessions),
      agedOpenOpname: toFiniteNumber(counts.agedOpenOpname),
      opnameDraft: toFiniteNumber(counts.opnameDraft),
      opnameInReview: toFiniteNumber(counts.opnameInReview),
      opnameReadyToPost: toFiniteNumber(counts.opnameReadyToPost),
      opnameVarianceDocs: toFiniteNumber(counts.opnameVarianceDocs),
      opnameVarianceQty: toFiniteNumber(counts.opnameVarianceQty),
      receivingBacklog: toFiniteNumber(counts.receivingBacklog),
      packQueueTotal: toFiniteNumber(counts.packQueueTotal),
      packSlaRisk: toFiniteNumber(counts.packSlaRisk),
    },
    pangeranIsopodProfile: {
      name:
        typeof profile.name === 'string' && profile.name.trim()
          ? profile.name.trim()
          : '',
      photoUrl:
        typeof profile.photoUrl === 'string' ? profile.photoUrl.trim() : '',
    },
    teamChat: {
      aiRoomId:
        typeof teamChat.aiRoomId === 'string' ? teamChat.aiRoomId.trim() : '',
      roomName:
        typeof teamChat.roomName === 'string' ? teamChat.roomName.trim() : '',
      webHref:
        typeof teamChat.webHref === 'string' ? teamChat.webHref.trim() : '',
      suggestedPrompts: Array.isArray(teamChat.suggestedPrompts)
        ? teamChat.suggestedPrompts
            .filter((item): item is string => typeof item === 'string')
            .map(item => item.trim())
            .filter(Boolean)
        : [],
    },
    links: normalizeLinks(linksRaw),
    lowStockLines: normalizeLowStock(queue.lowStockItems),
    varianceLines: normalizeVariance(queue.opnameVarianceDocs),
    openOpnameLines: normalizeOpenOpname(openOpnameSource),
    physicalQueueLines: normalizeReceiving(queue.receivingBacklogItems),
    packHandoffLabel:
      typeof packHandoff.label === 'string' ? packHandoff.label.trim() : '',
    slowMoverLines: normalizeSlowMovers(queue.slowMoverItems),
    opnameByLocationLines: normalizeOpnameByLocation(
      locationDepth.opnameByLocation,
    ),
  };
}

export function normalizeKolamInventoryOpsLog(
  payload: unknown,
): KolamInventoryOpsLog | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  return {
    generatedAt: toIsoString(data.generatedAt),
    note: typeof data.note === 'string' ? data.note.trim() : '',
    dara: normalizeOpsEvents(data.dara),
    bot: normalizeOpsEvents(data.bot),
  };
}

export function normalizeKolamPangeranIsopodHealth(
  payload: unknown,
): KolamPangeranIsopodHealth | null {
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
        .filter(
          (item): item is KolamPangeranIsopodPlatformHealth => item != null,
        )
    : [];

  return {
    checkedAt: toIsoString(data.checkedAt),
    overallHealthy:
      data.overallHealthy === true
        ? true
        : data.overallHealthy === false
          ? false
          : null,
    overallState:
      typeof data.overallState === 'string' ? data.overallState : '',
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
    note: typeof data.note === 'string' ? data.note.trim() : '',
  };
}

function normalizeLinks(
  links: Record<string, unknown>,
): KolamInventoryModuleLink[] {
  const defs: Array<{id: string; label: string; key: string}> = [
    {id: 'productsLowStock', label: 'Products low stock', key: 'productsLowStock'},
    {id: 'stockOpname', label: 'Stock opname', key: 'stockOpname'},
    {id: 'locations', label: 'Lokasi', key: 'locations'},
    {id: 'poReceived', label: 'PO received', key: 'poReceived'},
    {id: 'salesPacking', label: 'Packing', key: 'salesPacking'},
  ];
  return defs
    .map(def => {
      const hrefRaw =
        typeof links[def.key] === 'string' ? String(links[def.key]).trim() : '';
      if (!hrefRaw) {
        return null;
      }
      return {
        id: def.id,
        label: def.label,
        href: mapKolamInventoryCopilotHref(hrefRaw) || hrefRaw,
      };
    })
    .filter((item): item is KolamInventoryModuleLink => item != null);
}

function normalizeLowStock(value: unknown): KolamInventoryListLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 8).map((item, index) => {
    const row = asRecord(item);
    const name =
      (typeof row.name === 'string' && row.name.trim()) ||
      (typeof row.sku === 'string' && row.sku.trim()) ||
      '—';
    const stock = toFiniteNumber(row.stock);
    const threshold =
      row.threshold == null ? null : toFiniteNumber(row.threshold);
    return {
      key: `${row.sku || name}-${index}`,
      text:
        threshold != null
          ? `${name} · stok ${stock} / thr ${threshold}`
          : `${name} · stok ${stock}`,
    };
  });
}

function normalizeVariance(value: unknown): KolamInventoryListLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 8).map((item, index) => {
    const row = asRecord(item);
    const doc =
      typeof row.documentNumber === 'string' && row.documentNumber.trim()
        ? row.documentNumber.trim()
        : '—';
    const location =
      typeof row.location === 'string' && row.location.trim()
        ? ` · ${row.location.trim()}`
        : '';
    return {
      key: `${doc}-${index}`,
      text: `${doc}${location} · Δ${toFiniteNumber(row.varianceQty)}`,
    };
  });
}

function normalizeOpenOpname(value: unknown): KolamInventoryListLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 8).map((item, index) => {
    const row = asRecord(item);
    const doc =
      typeof row.documentNumber === 'string' && row.documentNumber.trim()
        ? row.documentNumber.trim()
        : '—';
    const status =
      typeof row.status === 'string' && row.status.trim()
        ? row.status.trim()
        : '—';
    const location =
      typeof row.location === 'string' && row.location.trim()
        ? ` · ${row.location.trim()}`
        : '';
    return {
      key: `${doc}-${index}`,
      text: `${doc} · ${status}${location}`,
    };
  });
}

function normalizeReceiving(value: unknown): KolamInventoryListLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 6).map((item, index) => {
    const row = asRecord(item);
    const po =
      typeof row.poCode === 'string' && row.poCode.trim()
        ? row.poCode.trim()
        : '—';
    const status =
      typeof row.status === 'string' && row.status.trim()
        ? row.status.trim()
        : '—';
    const vendor =
      typeof row.vendor === 'string' && row.vendor.trim()
        ? ` · ${row.vendor.trim()}`
        : '';
    return {
      key: `${po}-${index}`,
      text: `${po} · ${status}${vendor}`,
    };
  });
}

function normalizeSlowMovers(value: unknown): KolamInventoryListLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 8).map((item, index) => {
    const row = asRecord(item);
    const name =
      (typeof row.name === 'string' && row.name.trim()) ||
      (typeof row.sku === 'string' && row.sku.trim()) ||
      '—';
    return {
      key: `${row.sku || name}-${index}`,
      text: `${name} · terjual ${toFiniteNumber(row.qtySold)} · ${formatKolamInventoryCopilotIdr(
        toFiniteNumber(row.revenueIdr),
      )}`,
    };
  });
}

function normalizeOpnameByLocation(value: unknown): KolamInventoryListLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 8).map((item, index) => {
    const row = asRecord(item);
    const name =
      typeof row.locationName === 'string' && row.locationName.trim()
        ? row.locationName.trim()
        : '—';
    const type =
      typeof row.locationType === 'string' && row.locationType.trim()
        ? row.locationType.trim()
        : '—';
    return {
      key: `${name}-${index}`,
      text: `${name} (${type}) · ${toFiniteNumber(row.openSessions)} sesi`,
    };
  });
}

function normalizeOpsEvents(value: unknown): KolamInventoryOpsLogEvent[] {
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
        action: typeof row.action === 'string' ? row.action : '',
        status: typeof row.status === 'string' ? row.status : '',
        detail: typeof row.detail === 'string' ? row.detail.trim() : '',
      };
    })
    .filter((item): item is KolamInventoryOpsLogEvent => item != null);
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
