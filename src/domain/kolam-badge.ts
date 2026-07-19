export type KolamBadgeIntent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'outline';

export interface KolamBadgeVisualContract {
  sourceComponent: string;
  base: {
    inlineFlex: true;
    alignItems: 'center';
    gapX: number;
    paddingX: number;
    paddingY: number;
    fontSize: number;
    lineHeight: number;
    fontWeight: 'medium';
    iconSize: number;
  };
  circle: {
    borderRadius: 'full';
    paddingX: number;
  };
  square: {
    borderRadius: 'sm';
    paddingX: number;
  };
  intents: KolamBadgeIntent[];
  appliedSurfaces: string[];
}

const kolamBadgeVisual: KolamBadgeVisualContract = {
  sourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\badge.tsx',
  base: {
    inlineFlex: true,
    alignItems: 'center',
    gapX: 6,
    paddingX: 8,
    paddingY: 2,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 'medium',
    iconSize: 12,
  },
  circle: {
    borderRadius: 'full',
    paddingX: 8,
  },
  square: {
    borderRadius: 'sm',
    paddingX: 6,
  },
  intents: [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'danger',
    'outline',
  ],
  appliedSurfaces: [
    'sync-activity',
    'readiness-status',
    'runtime-actions',
    'settings-role-tabs',
    'settings-activity-log',
    'settings-role-info',
    'dashboard-stats',
    'plugin-status',
    'catalog-stock',
    'pending-orders',
  ],
};

export function getKolamBadgeVisualContract(): KolamBadgeVisualContract {
  return {
    ...kolamBadgeVisual,
    base: {...kolamBadgeVisual.base},
    circle: {...kolamBadgeVisual.circle},
    square: {...kolamBadgeVisual.square},
    intents: [...kolamBadgeVisual.intents],
    appliedSurfaces: [...kolamBadgeVisual.appliedSurfaces],
  };
}
