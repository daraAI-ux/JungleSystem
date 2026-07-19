export type KolamButtonIntent =
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'danger'
  | 'outline'
  | 'plain';

export type KolamButtonSize = 'sm' | 'md';
export type KolamButtonTone = 'default' | 'positive';

export interface KolamButtonVisualContract {
  sourceComponent: string;
  base: {
    inlineFlex: true;
    alignItems: 'center';
    justifyContent: 'center';
    fontWeight: 'medium';
    radius: 'lg';
    insetRing: true;
    iconSize: number;
  };
  sizes: Record<
    KolamButtonSize,
    {
      minHeight: number;
      paddingX: number;
      gapX: number;
      fontSize: number;
      lineHeight: number;
    }
  >;
  intents: KolamButtonIntent[];
  tones: Record<
    KolamButtonTone,
    {
      sourceClass?: string;
      background: 'bg' | 'successSoft' | 'transparent';
      border: 'border' | 'success' | 'transparent';
      text: 'fg' | 'primaryFg' | 'success';
    }
  >;
  appliedSurfaces: string[];
}

const kolamButtonVisual: KolamButtonVisualContract = {
  sourceComponent:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\ui\\button.tsx',
  base: {
    inlineFlex: true,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'medium',
    radius: 'lg',
    insetRing: true,
    iconSize: 16,
  },
  sizes: {
    sm: {
      minHeight: 34,
      paddingX: 12,
      gapX: 6,
      fontSize: 13,
      lineHeight: 20,
    },
    md: {
      minHeight: 36,
      paddingX: 12,
      gapX: 8,
      fontSize: 13,
      lineHeight: 24,
    },
  },
  intents: ['primary', 'secondary', 'warning', 'danger', 'outline', 'plain'],
  tones: {
    default: {
      background: 'bg',
      border: 'border',
      text: 'fg',
    },
    positive: {
      sourceClass: 'kolam-positive-action',
      background: 'successSoft',
      border: 'success',
      text: 'success',
    },
  },
  appliedSurfaces: [
    'dashboard-header-actions',
    'kolam-form-submit',
    'inline-operational-actions',
    'auth-actions',
    'checkout-primary-actions',
    'checkout-secondary-actions',
    'sales-row-actions',
    'dashboard-rail-actions',
    'settings-activity-refresh',
    'cashflow-session-actions',
  ],
};

export function getKolamButtonVisualContract(): KolamButtonVisualContract {
  return {
    ...kolamButtonVisual,
    base: {...kolamButtonVisual.base},
    sizes: {
      sm: {...kolamButtonVisual.sizes.sm},
      md: {...kolamButtonVisual.sizes.md},
    },
    intents: [...kolamButtonVisual.intents],
    tones: {
      default: {...kolamButtonVisual.tones.default},
      positive: {...kolamButtonVisual.tones.positive},
    },
    appliedSurfaces: [...kolamButtonVisual.appliedSurfaces],
  };
}
