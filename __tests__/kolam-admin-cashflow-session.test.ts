import {
  getKolamAdminCashflowSurfaceMode,
  isKolamAdminCashflowSessionRoute,
  isKolamPosCashflowShiftRoute,
  normalizeKolamAdminCashflowActiveProbe,
  normalizeKolamAdminCashflowSession,
} from '../src/domain/kolam-admin-cashflow-session';
import { getKolamNavigationRouteTarget } from '../src/domain/kolam-navigation';

describe('admin cashflow session domain', () => {
  it('detects admin and POS cashflow routes', () => {
    expect(isKolamAdminCashflowSessionRoute('/cashflow-session')).toBe(true);
    expect(isKolamAdminCashflowSessionRoute('/cashflow-session/create')).toBe(
      true,
    );
    expect(isKolamAdminCashflowSessionRoute('/cashflow-session/abc')).toBe(
      true,
    );
    expect(isKolamPosCashflowShiftRoute('/pos/cashflow')).toBe(true);
    expect(isKolamAdminCashflowSessionRoute('/pos/cashflow')).toBe(false);
  });

  it('maps surface modes from route', () => {
    expect(getKolamAdminCashflowSurfaceMode('/cashflow-session')).toBe('list');
    expect(getKolamAdminCashflowSurfaceMode('/cashflow-session/create')).toBe(
      'create',
    );
    expect(getKolamAdminCashflowSurfaceMode('/cashflow-session/abc')).toBe(
      'detail',
    );
  });

  it('routes admin cashflow to kolam and POS shift to cashflow module', () => {
    expect(
      getKolamNavigationRouteTarget({
        label: 'Cashflow Sessions',
        route: '/cashflow-session',
        description: 'Daily cash sessions',
        requiredAccess: ['kolam'],
      }).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget({
        label: 'POS Cashflow Shift',
        route: '/pos/cashflow',
        description: 'POS shift',
        requiredAccess: ['pos'],
      }).moduleId,
    ).toBe('cashflow');
  });

  it('normalizes session and active probe payloads', () => {
    const session = normalizeKolamAdminCashflowSession({
      _id: 'sess-1',
      name: 'Hari ini',
      source: 'admin',
      status: 'open',
      openedBy: { first_name: 'Ada', last_name: 'Lovelace', _id: 'u1' },
    });
    expect(session.id).toBe('sess-1');
    expect(session.openedBy?.name).toBe('Ada Lovelace');

    const probe = normalizeKolamAdminCashflowActiveProbe({
      data: { _id: 'sess-1', status: 'open', source: 'admin', name: 'Hari ini' },
      todaySession: {
        _id: 'sess-1',
        name: 'Hari ini',
        status: 'open',
      },
    });
    expect(probe.active?.id).toBe('sess-1');
    expect(probe.todaySession?.id).toBe('sess-1');
  });
});
