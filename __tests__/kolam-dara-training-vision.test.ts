import {
  normalizeKolamDaraTrainingVisionFeedbackList,
  normalizeKolamDaraTrainingVisionProductList,
  normalizeKolamDaraTrainingVisionSpeciesList,
  normalizeKolamDaraTrainingVisionStats,
  resolveKolamDaraTrainingVisionMatchIntent,
} from '../src/domain/kolam-dara-training-vision';

describe('kolam-dara-training-vision domain', () => {
  it('normalizes vision stats with FE extension fields', () => {
    const stats = normalizeKolamDaraTrainingVisionStats({
      data: {
        trainingPhotos: 12,
        feedbackTotal: 4,
        yoloModelReady: true,
        closedWorldMode: true,
        productTrainingPhotos: 8,
        embedFamily: 'siglip',
        embedIndexStale: 2,
        feedbackPending: 1,
        negativeTypes: [{id: 'lainnya', label: 'Di luar katalog DA'}],
      },
    });
    expect(stats).toMatchObject({
      trainingPhotos: 12,
      feedbackTotal: 4,
      yoloModelReady: true,
      closedWorldMode: true,
      productTrainingPhotos: 8,
      embedFamily: 'siglip',
      embedIndexStale: 2,
      feedbackPending: 1,
    });
    expect(stats.negativeTypes).toEqual([
      {id: 'lainnya', label: 'Di luar katalog DA'},
    ]);
  });

  it('normalizes vision species and product lists with meta', () => {
    const species = normalizeKolamDaraTrainingVisionSpeciesList({
      data: [
        {
          speciesId: 's1',
          displayName: 'Whites Tree Frog',
          scientificName: 'Litoria caerulea',
          catalogPhotoCount: 4,
          trainingCount: 2,
          readyForTrain: false,
          catalogPhotos: ['a.jpg'],
        },
      ],
      meta: {page: 2, pages: 5, total: 42},
    });
    expect(species).toMatchObject({
      page: 2,
      pages: 5,
      total: 42,
    });
    expect(species.rows[0]).toMatchObject({
      speciesId: 's1',
      catalogPhotoCount: 4,
      trainingCount: 2,
    });

    const products = normalizeKolamDaraTrainingVisionProductList({
      data: [
        {
          productId: 'p1',
          displayName: 'Frog Soil',
          sku: 'SKU-1',
          catalogPhotoCount: 3,
          trainingCount: 1,
          catalogPhotos: [],
        },
      ],
      meta: {page: 1, pages: 3, total: 25},
    });
    expect(products.pages).toBe(3);
    expect(products.rows[0]).toMatchObject({
      productId: 'p1',
      catalogPhotoCount: 3,
      sku: 'SKU-1',
    });
  });

  it('normalizes vision feedback list and match intents', () => {
    const list = normalizeKolamDaraTrainingVisionFeedbackList({
      data: [
        {
          _id: 'fb1',
          buyerImageUrl: '/media/a.jpg',
          matchStatus: 'ambiguous',
          entityKind: 'product',
          suggestedDisplayName: 'Wrong',
          correctDisplayName: 'Frog Soil',
          correctSku: 'SKU-1',
          createdAt: '2026-08-01T10:00:00.000Z',
        },
      ],
      meta: {page: 1, pages: 2, total: 21},
    });
    expect(list.pages).toBe(2);
    expect(list.rows[0]).toMatchObject({
      id: 'fb1',
      matchStatus: 'ambiguous',
      entityKind: 'product',
      correctDisplayName: 'Frog Soil',
    });
    expect(resolveKolamDaraTrainingVisionMatchIntent('match')).toBe('success');
    expect(resolveKolamDaraTrainingVisionMatchIntent('weak')).toBe('danger');
  });
});
