import {
  formatKolamDaraTrainingVisionTrainStatusLabel,
  isKolamDaraTrainingVisionReadyForTrain,
  KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
  KOLAM_DARA_TRAINING_VISION_MIN_SPECIES_PHOTOS,
  normalizeKolamDaraTrainingVisionBaselineKpi,
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
      minTrainingPhotos: KOLAM_DARA_TRAINING_VISION_MIN_SPECIES_PHOTOS,
      minProductTrainingPhotos: KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
    });
    expect(stats.negativeTypes).toEqual([
      {id: 'lainnya', label: 'Di luar katalog DA'},
    ]);
  });

  it('marks train-ready from min photo thresholds (species 5 / product 3)', () => {
    expect(isKolamDaraTrainingVisionReadyForTrain(4, 5)).toBe(false);
    expect(isKolamDaraTrainingVisionReadyForTrain(5, 5)).toBe(true);
    expect(
      isKolamDaraTrainingVisionReadyForTrain(
        0,
        KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
        6,
      ),
    ).toBe(true);
    expect(
      isKolamDaraTrainingVisionReadyForTrain(
        0,
        KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
        2,
      ),
    ).toBe(false);
    expect(formatKolamDaraTrainingVisionTrainStatusLabel(0, 3, 6)).toEqual({
      ready: true,
      label: 'Siap latih',
    });
    expect(formatKolamDaraTrainingVisionTrainStatusLabel(1, 3, 1)).toEqual({
      ready: false,
      label: '1/3',
    });
    expect(formatKolamDaraTrainingVisionTrainStatusLabel(0, 5, 2)).toEqual({
      ready: false,
      label: '2/5',
    });
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

  it('normalizes baseline KPI like FE cards', () => {
    const kpi = normalizeKolamDaraTrainingVisionBaselineKpi({
      data: {
        periodDays: 30,
        inbox: {
          source: 'events',
          eventCount: 12,
          autoReply: 4,
          visionMatch: 3,
          visionAmbiguous: 1,
          visionLlm: 0,
          clarifyAbstain: 2,
          payment: 5,
          skippedDedup: 1,
          abstainRate: 33,
          autoReplyRate: 67,
          byMatchMethod: {siglip: 3, yolo: 1},
        },
        feedback: {total: 4, falseMatch: 1, falseMatchRate: 25},
        precision: {estimatedPrecisionPct: 80, note: 'Estimasi.'},
        latestHoldoutEval: {siglipAccuracy: 91},
      },
    });
    expect(kpi).toMatchObject({
      inboxSource: 'events',
      inboxEventCount: 12,
      inboxAbstainRate: 33,
      inboxAutoReplyRate: 67,
      inboxPayment: 5,
      inboxSkippedDedup: 1,
      latestHoldoutSiglipAccuracy: 91,
      precisionPct: 80,
    });
    expect(kpi!.inboxByMatchMethod).toEqual([
      {method: 'siglip', count: 3},
      {method: 'yolo', count: 1},
    ]);
    expect(kpi).not.toHaveProperty('inboxTotalHandled');
  });
});

describe('resolveKolamDaraTrainingVisionImageUri', () => {
  it('uses fileBaseUrl like FE getFileUrl (not /api)', () => {
    const {
      resolveKolamDaraTrainingVisionImageUri,
    } = require('../src/services/kolam-dara-training-vision-api');
    const {appConfig} = require('../src/config/app');
    expect(
      resolveKolamDaraTrainingVisionImageUri('/media/frog-a.jpg'),
    ).toBe(`${appConfig.fileBaseUrl}/media/frog-a.jpg`);
    expect(resolveKolamDaraTrainingVisionImageUri(null)).toBeNull();
    expect(
      resolveKolamDaraTrainingVisionImageUri('https://cdn.example/x.jpg'),
    ).toBe('https://cdn.example/x.jpg');
  });
});
