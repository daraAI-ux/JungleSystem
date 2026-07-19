import {getKolamButtonVisualContract} from '../src/domain/kolam-button';

describe('getKolamButtonVisualContract', () => {
  it('maps native buttons to the live Kolam Button primitive', () => {
    const contract = getKolamButtonVisualContract();

    expect(contract.sourceComponent).toBe(
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\ui\\button.tsx',
    );
    expect(contract.base).toEqual({
      inlineFlex: true,
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'medium',
      radius: 'lg',
      insetRing: true,
      iconSize: 16,
    });
    expect(contract.sizes).toEqual({
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
    });
    expect(contract.intents).toEqual([
      'primary',
      'secondary',
      'warning',
      'danger',
      'outline',
      'plain',
    ]);
    expect(contract.tones).toEqual({
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
    });
    expect(contract.appliedSurfaces).toEqual([
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
    ]);
  });

  it('returns cloned values so render code cannot mutate the contract', () => {
    const first = getKolamButtonVisualContract();
    first.sizes.sm.minHeight = 1;
    first.intents.push('primary');
    first.tones.positive.background = 'bg';
    first.appliedSurfaces.push('mutated');

    const next = getKolamButtonVisualContract();
    expect(next.sizes.sm.minHeight).toBe(34);
    expect(next.intents).toHaveLength(6);
    expect(next.tones.positive.background).toBe('successSoft');
    expect(next.appliedSurfaces).toHaveLength(10);
  });
});
