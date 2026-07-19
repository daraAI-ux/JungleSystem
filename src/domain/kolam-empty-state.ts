export interface KolamEmptyStateVisualContract {
  sourceComponent: string;
  full: {
    minHeight: number;
    iconSize: number;
    iconRingSize: number;
  };
  compact: {
    minHeight: number;
    iconSize: number;
    iconRingSize: number;
  };
  dashboardRail: {
    sourceSurface: string;
    iconVisible: false;
    messageVisible: false;
    titleFontSize: number;
    titleFontWeight: 'regular';
    titleTone: 'mutedFg';
  };
  copy: {
    titleSize: number;
    messageSize: number;
    messageLineHeight: number;
  };
}

const kolamEmptyStateVisual: KolamEmptyStateVisualContract = {
  sourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx',
  full: {
    minHeight: 288,
    iconSize: 52,
    iconRingSize: 78,
  },
  compact: {
    minHeight: 96,
    iconSize: 52,
    iconRingSize: 54,
  },
  dashboardRail: {
    sourceSurface:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\latest-*product.tsx',
    iconVisible: false,
    messageVisible: false,
    titleFontSize: 14,
    titleFontWeight: 'regular',
    titleTone: 'mutedFg',
  },
  copy: {
    titleSize: 15,
    messageSize: 13,
    messageLineHeight: 18,
  },
};

export function getKolamEmptyStateVisualContract(): KolamEmptyStateVisualContract {
  return {
    sourceComponent: kolamEmptyStateVisual.sourceComponent,
    full: {...kolamEmptyStateVisual.full},
    compact: {...kolamEmptyStateVisual.compact},
    dashboardRail: {...kolamEmptyStateVisual.dashboardRail},
    copy: {...kolamEmptyStateVisual.copy},
  };
}
