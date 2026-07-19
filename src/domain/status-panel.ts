export type StatusPanelId =
  | 'sync-activity'
  | 'readiness'
  | 'runtime-actions'
  | 'command-index';

export type StatusPanelIconKind =
  | 'activity'
  | 'checklist'
  | 'actions'
  | 'search';

export interface StatusPanelDescriptor {
  id: StatusPanelId;
  title: string;
  description: string;
  iconKind: StatusPanelIconKind;
  sourceComponent: string;
  cardChrome: {
    spacing: number;
    headerAction: true;
    contentBorderTop: true;
    titleWeight: 'semibold';
  };
}

const statusPanelCardChrome: StatusPanelDescriptor['cardChrome'] = {
  spacing: 24,
  headerAction: true,
  contentBorderTop: true,
  titleWeight: 'semibold',
};

const statusPanelDescriptors: Record<StatusPanelId, StatusPanelDescriptor> = {
  'sync-activity': {
    id: 'sync-activity',
    title: 'Aktivitas Sinkronisasi',
    description: 'Status data Kolam, POS, dan AM dari server yang sedang dipakai.',
    iconKind: 'activity',
    sourceComponent: 'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx',
    cardChrome: statusPanelCardChrome,
  },
  readiness: {
    id: 'readiness',
    title: 'Kesiapan Operasional',
    description: 'Ringkasan kesiapan akses, plugin, dan perangkat Windows.',
    iconKind: 'checklist',
    sourceComponent: 'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx',
    cardChrome: statusPanelCardChrome,
  },
  'runtime-actions': {
    id: 'runtime-actions',
    title: 'Aksi Operasional',
    description: 'Aksi cepat untuk Kolam, POS, AM, dan plugin terkait.',
    iconKind: 'actions',
    sourceComponent: 'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx',
    cardChrome: statusPanelCardChrome,
  },
  'command-index': {
    id: 'command-index',
    title: 'Pencarian Menu',
    description: 'Pencarian cepat untuk menu, aksi, dan route plugin.',
    iconKind: 'search',
    sourceComponent: 'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx',
    cardChrome: statusPanelCardChrome,
  },
};

export function getStatusPanelDescriptor(
  panelId: StatusPanelId,
): StatusPanelDescriptor {
  const descriptor = statusPanelDescriptors[panelId];
  return {...descriptor, cardChrome: {...descriptor.cardChrome}};
}
