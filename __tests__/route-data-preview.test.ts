import {getRouteDataPreviewCards} from '../src/domain/route-data-preview';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('route data preview', () => {
  it('builds intent-aware runtime preview cards from the unified dataset', () => {
    expect(
      getRouteDataPreviewCards({
        area: 'pos',
        dataset: seedUnifiedDataset,
        intent: 'transaction',
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'POS-20260711-001',
          badges: expect.arrayContaining(['paid']),
        }),
      ]),
    );

    expect(
      getRouteDataPreviewCards({
        area: 'kolam',
        dataset: seedUnifiedDataset,
        intent: 'inventory',
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Sponge Filter Medium',
          badges: expect.arrayContaining(['product']),
        }),
      ]),
    );

    expect(
      getRouteDataPreviewCards({
        area: 'am',
        dataset: seedUnifiedDataset,
        intent: 'automation',
      }),
    ).toEqual([
      expect.objectContaining({
        title: 'AM dashboard belum live',
        badges: expect.arrayContaining(['disabled']),
      }),
    ]);
  });
});
