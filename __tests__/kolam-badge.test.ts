import {getKolamBadgeVisualContract} from '../src/domain/kolam-badge';

describe('getKolamBadgeVisualContract', () => {
  it('maps native badges to the live Kolam Badge primitive', () => {
    const contract = getKolamBadgeVisualContract();

    expect(contract.sourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\badge.tsx',
    );
    expect(contract.base).toEqual({
      inlineFlex: true,
      alignItems: 'center',
      gapX: 6,
      paddingX: 8,
      paddingY: 2,
      fontSize: 12,
      lineHeight: 20,
      fontWeight: 'medium',
      iconSize: 12,
    });
    expect(contract.circle).toEqual({
      borderRadius: 'full',
      paddingX: 8,
    });
    expect(contract.square).toEqual({
      borderRadius: 'sm',
      paddingX: 6,
    });
    expect(contract.intents).toEqual([
      'primary',
      'secondary',
      'success',
      'info',
      'warning',
      'danger',
      'outline',
    ]);
    expect(contract.appliedSurfaces).toEqual([
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
    ]);
  });

  it('returns cloned values so render code cannot mutate the contract', () => {
    const first = getKolamBadgeVisualContract();
    first.base.fontSize = 99;
    first.intents.push('primary');
    first.appliedSurfaces.push('mutated');

    expect(getKolamBadgeVisualContract().base.fontSize).toBe(12);
    expect(getKolamBadgeVisualContract().intents).toHaveLength(7);
    expect(getKolamBadgeVisualContract().appliedSurfaces).toHaveLength(10);
  });
});
