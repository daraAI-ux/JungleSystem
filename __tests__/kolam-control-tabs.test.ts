import {getKolamControlTabsVisualContract} from '../src/domain/kolam-control-tabs';

describe('getKolamControlTabsVisualContract', () => {
  it('maps native tab and segment controls to the live Kolam Tabs/Button patterns', () => {
    const contract = getKolamControlTabsVisualContract();

    expect(contract.tabsSourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\tabs.tsx',
    );
    expect(contract.buttonSourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\button.tsx',
    );
    expect(contract).toMatchObject({
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
    });
  });

  it('returns cloned visual values so render code cannot mutate the contract', () => {
    const first = getKolamControlTabsVisualContract();
    first.tabListGap = 1;

    expect(getKolamControlTabsVisualContract().tabListGap).toBe(20);
  });
});
