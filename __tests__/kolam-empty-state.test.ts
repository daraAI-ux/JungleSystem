import {getKolamEmptyStateVisualContract} from '../src/domain/kolam-empty-state';

describe('getKolamEmptyStateVisualContract', () => {
  it('maps native empty states to the live Kolam Table empty-state pattern', () => {
    const contract = getKolamEmptyStateVisualContract();

    expect(contract.sourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx',
    );
    expect(contract.full).toEqual({
      minHeight: 288,
      iconSize: 52,
      iconRingSize: 78,
    });
    expect(contract.compact).toEqual({
      minHeight: 96,
      iconSize: 52,
      iconRingSize: 54,
    });
    expect(contract.dashboardRail).toEqual({
      sourceSurface:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\latest-*product.tsx',
      iconVisible: false,
      messageVisible: false,
      titleFontSize: 14,
      titleFontWeight: 'regular',
      titleTone: 'mutedFg',
    });
    expect(contract.copy).toEqual({
      titleSize: 15,
      messageSize: 13,
      messageLineHeight: 18,
    });
  });

  it('returns cloned visual values so render code cannot mutate the contract', () => {
    const first = getKolamEmptyStateVisualContract();
    first.full.minHeight = 1;
    first.dashboardRail.titleFontSize = 1;

    expect(getKolamEmptyStateVisualContract().full.minHeight).toBe(288);
    expect(getKolamEmptyStateVisualContract().dashboardRail.titleFontSize).toBe(
      14,
    );
  });
});
