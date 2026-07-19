export interface KolamControlTabsVisualContract {
  tabsSourceComponent: string;
  buttonSourceComponent: string;
  tabListGap: number;
  tabMinHeight: number;
  tabPaddingX: number;
  tabIndicatorHeight: number;
  tabListBorderBottom: true;
  tabSelectedBackground: 'transparent';
  tabSelectedShadow: false;
  tabFontWeight: 'medium';
  buttonMinHeight: number;
  buttonPaddingX: number;
  rangeButtonMinHeight: number;
  rangeButtonPaddingX: number;
  rangeButtonPaddingY: number;
  rangeButtonRadius: number;
  rangeButtonFontSize: number;
  rangeButtonSelectedBackground: 'bg';
  fontSize: number;
}

const kolamControlTabsVisual: KolamControlTabsVisualContract = {
  tabsSourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\tabs.tsx',
  buttonSourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\button.tsx',
  tabListGap: 20,
  tabMinHeight: 40,
  tabPaddingX: 0,
  tabIndicatorHeight: 2,
  tabListBorderBottom: true,
  tabSelectedBackground: 'transparent',
  tabSelectedShadow: false,
  tabFontWeight: 'medium',
  buttonMinHeight: 36,
  buttonPaddingX: 12,
  rangeButtonMinHeight: 36,
  rangeButtonPaddingX: 13,
  rangeButtonPaddingY: 8,
  rangeButtonRadius: 7,
  rangeButtonFontSize: 13,
  rangeButtonSelectedBackground: 'bg',
  fontSize: 14,
};

export function getKolamControlTabsVisualContract(): KolamControlTabsVisualContract {
  return {...kolamControlTabsVisual};
}
