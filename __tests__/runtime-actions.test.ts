import {shellModules} from '../src/domain/app-shell';
import type {AccessScope} from '../src/domain/auth';
import {
  getRuntimeActionsByModule,
  getRuntimeActionStats,
  isRuntimeActionEnabled,
  runtimeActions,
} from '../src/domain/runtime-actions';

const noAccess: AccessScope = {kolam: false, pos: false, am: false};
const posAccess: AccessScope = {kolam: false, pos: true, am: false};
const kolamAccess: AccessScope = {kolam: true, pos: false, am: false};
const allAccess: AccessScope = {kolam: true, pos: true, am: true};

describe('runtime action registry', () => {
  it('defines at least one native runtime action for every shell module', () => {
    shellModules.forEach(module => {
      expect(getRuntimeActionsByModule(module.id).length).toBeGreaterThan(0);
    });
  });

  it('keeps POS actions behind POS access', () => {
    const checkoutAction = runtimeActions.find(
      action => action.id === 'pos-create-sale-draft',
    );

    expect(checkoutAction).toBeDefined();
    expect(isRuntimeActionEnabled(checkoutAction!, noAccess)).toBe(false);
    expect(isRuntimeActionEnabled(checkoutAction!, kolamAccess)).toBe(false);
    expect(isRuntimeActionEnabled(checkoutAction!, posAccess)).toBe(true);
  });

  it('keeps plugin host actions behind Kolam access', () => {
    const routeExplorer = runtimeActions.find(
      action => action.id === 'plugin-route-explorer',
    );

    expect(routeExplorer).toBeDefined();
    expect(isRuntimeActionEnabled(routeExplorer!, posAccess)).toBe(false);
    expect(isRuntimeActionEnabled(routeExplorer!, kolamAccess)).toBe(true);
  });

  it('summarizes enabled blocked native and live API actions', () => {
    expect(getRuntimeActionStats(noAccess)).toEqual(
      expect.objectContaining({
        total: runtimeActions.length,
        enabled: 0,
        blocked: runtimeActions.length,
      }),
    );
    expect(getRuntimeActionStats(allAccess)).toEqual(
      expect.objectContaining({
        total: runtimeActions.length,
        enabled: runtimeActions.length,
        blocked: 0,
        liveApi: 7,
        nativeReady: 2,
      }),
    );
  });

  it('maps runtime status to native badge icon kinds like live badges with icons', () => {
    const statusIcons = new Map(
      runtimeActions.map(action => [action.status, action.statusIconKind]),
    );

    expect(statusIcons.get('native-ready')).toBe('check');
    expect(statusIcons.get('live-api')).toBe('activity');
    expect(statusIcons.get('source-audit')).toBe('search');
    expect(
      runtimeActions.every(action => Boolean(action.statusIconKind)),
    ).toBe(true);
  });

  it('keeps action ids unique and live API contracts explicit', () => {
    expect(new Set(runtimeActions.map(action => action.id)).size).toBe(
      runtimeActions.length,
    );
    runtimeActions
      .filter(action => action.status === 'live-api')
      .forEach(action => {
        expect(action.sourceContract).toMatch(/^(GET|POST|PUT|PATCH|DELETE)\s/);
      });
  });
});
