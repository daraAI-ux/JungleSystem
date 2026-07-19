import {getAppLaunchCoverage} from '../src/domain/app-launch';

test('summarizes JungleSystem as one breadth-first app', () => {
  const coverage = getAppLaunchCoverage();

  expect(coverage.serverRule).toContain('backend server berjalan');
  expect(coverage.areas.map(area => area.id)).toEqual([
    'kolam',
    'pos',
    'am',
    'plugins',
  ]);
  expect(coverage.areas.map(area => area.moduleId)).toEqual([
    'kolam',
    'checkout',
    'am',
    'plugins',
  ]);
  expect(coverage.areas.find(area => area.id === 'pos')?.modules.map(
    module => module.id,
  )).toEqual(['checkout', 'catalog', 'sales', 'cashflow', 'customer']);
  expect(coverage.routeCount).toBeGreaterThan(250);
  expect(coverage.commandCount).toBeGreaterThan(350);
  expect(coverage.commandStats.navigationRoutes).toBeGreaterThan(250);
  expect(
    coverage.areas
      .find(area => area.id === 'kolam')
      ?.routeCommands.some(command => command.route === '/finance/tax'),
  ).toBe(true);
  expect(coverage.pluginReadyCount).toBeGreaterThanOrEqual(8);
  expect(coverage.pluginRouteCount).toBeGreaterThan(50);
});

test('keeps every launch area tied to source and test target', () => {
  const coverage = getAppLaunchCoverage();

  coverage.areas.forEach(area => {
    expect(area.routeCount).toBeGreaterThan(0);
    expect(area.sourceRepo).toMatch(/^E:\\Projects/);
    expect(area.summary.length).toBeGreaterThan(60);
    expect(area.testTarget.length).toBeGreaterThan(10);
    expect(area.modules.length).toBeGreaterThan(0);
    expect(area.routeCommands.length).toBeGreaterThan(0);
    expect(area.screenPacks.length).toBeGreaterThan(0);
    expect(area.screenPacks[0].priority).toBe('build-next');
    expect(area.screenPacks.every(pack => pack.routeCount > 0)).toBe(true);
    expect(area.screenPacks.every(pack => pack.routePreview.length > 0)).toBe(
      true,
    );
    expect(area.runway.map(step => step.id)).toEqual([
      'test-flow',
      'runtime',
      'next-pack',
      'evidence',
    ]);
    expect(area.runway.every(step => step.value.length > 10)).toBe(true);
  });

  expect(coverage.areas.find(area => area.id === 'am')).toEqual(
    expect.objectContaining({
      sourceRepo: 'E:\\Projects\\da-automation-management',
      status: 'native-scaffold',
    }),
  );
  expect(coverage.areas.find(area => area.id === 'plugins')?.runway).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: 'evidence',
        value: 'npm run verify:registry',
      }),
    ]),
  );
  expect(coverage.areas.find(area => area.id === 'pos')?.screenPacks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: 'transaction',
        label: 'Transaction Flow',
        priority: 'build-next',
      }),
    ]),
  );
});
