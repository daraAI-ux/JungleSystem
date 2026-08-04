import {
  buildKolamDaraTrainingRoute,
  buildKolamDaraTrainingStatsCards,
  getKolamDaraTrainingTab,
  isKolamDaraTrainingRoute,
  normalizeKolamDaraTrainingStats,
  resolveKolamDaraTrainingAccess,
} from '../src/domain/kolam-dara-training';

describe('kolam-dara-training domain', () => {
  it('resolves route, tab query, and access like FE', () => {
    expect(isKolamDaraTrainingRoute('/list-of-users/dara-training')).toBe(true);
    expect(
      isKolamDaraTrainingRoute('/list-of-users/dara-training?tab=vision'),
    ).toBe(true);
    expect(isKolamDaraTrainingRoute('/finance/tax')).toBe(false);

    expect(getKolamDaraTrainingTab('/list-of-users/dara-training')).toBe(
      'phrases',
    );
    expect(
      getKolamDaraTrainingTab('/list-of-users/dara-training?tab=fineTune'),
    ).toBe('fineTune');
    expect(buildKolamDaraTrainingRoute('products')).toBe(
      '/list-of-users/dara-training?tab=products',
    );

    expect(
      resolveKolamDaraTrainingAccess({roleKey: 'admin'}).canSee,
    ).toBe(true);
    expect(
      resolveKolamDaraTrainingAccess({
        roleKey: 'cashier',
        permissions: [{resource: 'chat', actions: ['view']}],
      }).canSee,
    ).toBe(true);
    expect(
      resolveKolamDaraTrainingAccess({
        roleKey: 'cashier',
        permissions: [{resource: 'dara-training', actions: ['update']}],
      }).canManage,
    ).toBe(true);
    expect(
      resolveKolamDaraTrainingAccess({
        roleKey: 'cashier',
        permissions: [],
      }).canSee,
    ).toBe(false);
  });

  it('normalizes stats and builds KPI cards', () => {
    const stats = normalizeKolamDaraTrainingStats({
      data: {
        phraseCount: 12,
        enabledPhrases: 8,
        fulfillmentGrantCount: 3,
        fulfillmentDeclineCount: 1,
        feedbackCount: 7,
        minSamplesDefault: 50,
        minSamplesPoc: 5,
        hasSearchRankLog: true,
        trainScriptReady: true,
        rerankModelPath: '/models/rerank.json',
        rerankModelExists: false,
      },
    });
    expect(stats.enabledPhrases).toBe(8);
    expect(stats.hasSearchRankLog).toBe(true);

    const cards = buildKolamDaraTrainingStatsCards(stats);
    expect(cards).toHaveLength(6);
    expect(cards[0]).toMatchObject({
      label: 'Frasa aktif',
      value: '8',
      detail: '12 total',
    });
    expect(cards.find(c => c.id === 'feedback')?.tone).toBe('warning');
    expect(cards.find(c => c.id === 'rank-log')?.value).toBe('Ada');
    expect(cards.find(c => c.id === 'rerank')?.value).toBe('Belum');
  });
});
