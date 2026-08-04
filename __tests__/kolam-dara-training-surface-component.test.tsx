import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraTrainingSurface} from '../src/components/kolam-dara-training-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {
  fetchKolamDaraTrainingFineTuneBenchmark,
  fetchKolamDaraTrainingFineTuneSummary,
  fetchKolamDaraTrainingStats,
  listKolamDaraTrainingConversationReviews,
  listKolamDaraTrainingFeedback,
  listKolamDaraTrainingFineTuneCandidates,
  listKolamDaraTrainingFineTuneDataset,
  listKolamDaraTrainingFineTuneRuns,
  listKolamDaraTrainingPhrases,
} from '../src/services/kolam-dara-training-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-training-api', () => ({
  fetchKolamDaraTrainingStats: jest.fn(),
  listKolamDaraTrainingPhrases: jest.fn(),
  listKolamDaraTrainingFeedback: jest.fn(),
  listKolamDaraTrainingConversationReviews: jest.fn(),
  completeKolamDaraTrainingConversationReview: jest.fn(),
  createKolamDaraTrainingPhrase: jest.fn(),
  updateKolamDaraTrainingPhrase: jest.fn(),
  deleteKolamDaraTrainingPhrase: jest.fn(),
  runKolamDaraTrainingProductRerank: jest.fn(),
  fetchKolamDaraTrainingFineTuneSummary: jest.fn(),
  listKolamDaraTrainingFineTuneCandidates: jest.fn(),
  listKolamDaraTrainingFineTuneDataset: jest.fn(),
  fetchKolamDaraTrainingFineTuneBenchmark: jest.fn(),
  listKolamDaraTrainingFineTuneRuns: jest.fn(),
  importKolamDaraTrainingFineTuneCandidates: jest.fn(),
  exportKolamDaraTrainingFineTuneJsonl: jest.fn(),
  updateKolamDaraTrainingFineTuneDatasetItem: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-training-vision-api', () => ({
  fetchKolamDaraTrainingVisionStats: jest.fn(),
  listKolamDaraTrainingVisionSpecies: jest.fn(),
  listKolamDaraTrainingVisionProducts: jest.fn(),
  listKolamDaraTrainingVisionFeedback: jest.fn(),
  listKolamDaraTrainingVisionHardNegatives: jest.fn(),
  listKolamDaraTrainingVisionFeedbackQueue: jest.fn(),
  fetchKolamDaraTrainingVisionLatestEvalRun: jest.fn(),
  listKolamDaraTrainingVisionEvalRuns: jest.fn(),
  fetchKolamDaraTrainingVisionBaselineKpi: jest.fn(),
  resolveKolamDaraTrainingVisionImageUri: jest.fn((uri: string) => uri || null),
  rebuildKolamDaraTrainingVisionClipIndex: jest.fn(),
  backfillKolamDaraTrainingVisionClip: jest.fn(),
  importKolamDaraTrainingVisionFeedback: jest.fn(),
  exportKolamDaraTrainingVisionYolo: jest.fn(),
  trainKolamDaraTrainingVisionYolo: jest.fn(),
  exportKolamDaraTrainingVisionYoloProducts: jest.fn(),
  trainKolamDaraTrainingVisionYoloProducts: jest.fn(),
  evalKolamDaraTrainingVisionYolo: jest.fn(),
  runKolamDaraTrainingVisionHoldoutEval: jest.fn(),
  addKolamDaraTrainingVisionHardNegative: jest.fn(),
  importKolamDaraTrainingVisionFeedbackQueueItem: jest.fn(),
  listKolamDaraTrainingVisionSpeciesPhotos: jest.fn(),
  listKolamDaraTrainingVisionProductPhotos: jest.fn(),
  addKolamDaraTrainingVisionSpeciesPhoto: jest.fn(),
  addKolamDaraTrainingVisionProductPhoto: jest.fn(),
  deleteKolamDaraTrainingVisionPhoto: jest.fn(),
}));

import {
  fetchKolamDaraTrainingVisionStats,
  listKolamDaraTrainingVisionFeedback,
  listKolamDaraTrainingVisionFeedbackQueue,
  listKolamDaraTrainingVisionHardNegatives,
  listKolamDaraTrainingVisionProducts,
  listKolamDaraTrainingVisionSpecies,
  fetchKolamDaraTrainingVisionBaselineKpi,
  fetchKolamDaraTrainingVisionLatestEvalRun,
  listKolamDaraTrainingVisionEvalRuns,
} from '../src/services/kolam-dara-training-vision-api';

const authMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const statsMock = fetchKolamDaraTrainingStats as jest.MockedFunction<
  typeof fetchKolamDaraTrainingStats
>;
const phrasesMock = listKolamDaraTrainingPhrases as jest.MockedFunction<
  typeof listKolamDaraTrainingPhrases
>;
const feedbackMock = listKolamDaraTrainingFeedback as jest.MockedFunction<
  typeof listKolamDaraTrainingFeedback
>;
const reviewsMock = listKolamDaraTrainingConversationReviews as jest.MockedFunction<
  typeof listKolamDaraTrainingConversationReviews
>;
const fineTuneSummaryMock =
  fetchKolamDaraTrainingFineTuneSummary as jest.MockedFunction<
    typeof fetchKolamDaraTrainingFineTuneSummary
  >;
const fineTuneCandidatesMock =
  listKolamDaraTrainingFineTuneCandidates as jest.MockedFunction<
    typeof listKolamDaraTrainingFineTuneCandidates
  >;
const fineTuneDatasetMock =
  listKolamDaraTrainingFineTuneDataset as jest.MockedFunction<
    typeof listKolamDaraTrainingFineTuneDataset
  >;
const fineTuneBenchmarkMock =
  fetchKolamDaraTrainingFineTuneBenchmark as jest.MockedFunction<
    typeof fetchKolamDaraTrainingFineTuneBenchmark
  >;
const fineTuneRunsMock = listKolamDaraTrainingFineTuneRuns as jest.MockedFunction<
  typeof listKolamDaraTrainingFineTuneRuns
>;
const visionStatsMock = fetchKolamDaraTrainingVisionStats as jest.MockedFunction<
  typeof fetchKolamDaraTrainingVisionStats
>;
const visionSpeciesMock =
  listKolamDaraTrainingVisionSpecies as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionSpecies
  >;
const visionProductsMock =
  listKolamDaraTrainingVisionProducts as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionProducts
  >;
const visionFeedbackMock =
  listKolamDaraTrainingVisionFeedback as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionFeedback
  >;
const visionHardNegMock =
  listKolamDaraTrainingVisionHardNegatives as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionHardNegatives
  >;
const visionQueueMock =
  listKolamDaraTrainingVisionFeedbackQueue as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionFeedbackQueue
  >;
const visionLatestEvalMock =
  fetchKolamDaraTrainingVisionLatestEvalRun as jest.MockedFunction<
    typeof fetchKolamDaraTrainingVisionLatestEvalRun
  >;
const visionEvalRunsMock =
  listKolamDaraTrainingVisionEvalRuns as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionEvalRuns
  >;
const visionBaselineMock =
  fetchKolamDaraTrainingVisionBaselineKpi as jest.MockedFunction<
    typeof fetchKolamDaraTrainingVisionBaselineKpi
  >;

describe('KolamDaraTrainingSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReturnValue({
      authUser: {roleKey: 'admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    statsMock.mockResolvedValue({
      phraseCount: 10,
      enabledPhrases: 6,
      fulfillmentGrantCount: 2,
      fulfillmentDeclineCount: 1,
      feedbackCount: 4,
      minSamplesDefault: 50,
      minSamplesPoc: 5,
      hasSearchRankLog: false,
      trainScriptReady: true,
      rerankModelPath: '',
      rerankModelExists: false,
    });
    phrasesMock.mockImplementation(async opts => {
      if (opts?.scope === 'fulfillment') {
        return [
          {
            id: 'f1',
            phrase: 'gas kirim aja',
            category: 'fulfillment_grant',
            customReply: '',
            enabled: true,
            priority: 2,
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ];
      }
      return [
        {
          id: 'p1',
          phrase: 'anda siapa',
          category: 'identity',
          customReply: 'Saya DARA',
          enabled: true,
          priority: 5,
          notes: '',
          createdAt: '',
          updatedAt: '',
        },
      ];
    });
    feedbackMock.mockResolvedValue([
      {
        id: 'fb1',
        query: 'cari soil',
        suggestedProductName: 'Wrong Soil',
        correctProductName: 'Frog Soil',
        correctSku: 'SKU-1',
        notes: '',
        source: 'inbox',
        createdAt: '2026-08-01T10:00:00.000Z',
      },
    ]);
    reviewsMock.mockResolvedValue({
      rows: [
        {
          id: 'r1',
          conversationId: 'c1',
          createdAt: '2026-08-01T10:00:00.000Z',
          reviewedAt: '',
          contactLabel: 'Buyer A',
          platform: 'whatsapp',
          conversationStartedAt: '2026-08-01T09:00:00.000Z',
          rating: 2,
          customerComment: 'Lambat jawab',
          reviewNotes: '',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    fineTuneSummaryMock.mockResolvedValue({
      datasetTotal: 4,
      approvedCount: 1,
      blockedCount: 0,
      exportedCount: 0,
      candidateSourceCounts: {phrase_rule: 2},
      statusCounts: {candidate: 3, approved: 1},
      benchmarkTotal: 50,
      minBenchmarkRequired: 50,
      runtime: {
        useFineTune: false,
        fallback: true,
        reason: 'env_disabled',
        timeoutMs: 1000,
        modelName: '',
      },
    });
    fineTuneCandidatesMock.mockResolvedValue([
      {
        id: 'c1',
        sourceType: 'phrase_rule',
        sourceId: 'p1',
        input: 'anda siapa',
        output: 'Saya DARA',
        validationStatus: 'valid',
        status: 'candidate',
        notes: '',
        createdAt: '',
        updatedAt: '',
      },
    ]);
    fineTuneDatasetMock.mockResolvedValue([
      {
        id: 'd1',
        sourceType: 'phrase_rule',
        sourceId: 'p1',
        input: 'anda siapa',
        output: 'Saya DARA',
        validationStatus: 'valid',
        status: 'candidate',
        notes: '',
        createdAt: '',
        updatedAt: '',
      },
    ]);
    fineTuneBenchmarkMock.mockResolvedValue({
      scenarios: [
        {
          id: 'b1',
          index: 1,
          query: 'cek stok',
          expectedCapability: 'inventory',
        },
      ],
      total: 50,
      minRequired: 50,
      ok: true,
    });
    fineTuneRunsMock.mockResolvedValue([]);
    visionStatsMock.mockResolvedValue({
      trainingPhotos: 12,
      speciesWithTraining: 3,
      speciesReadyForTrain: 2,
      feedbackTotal: 4,
      minTrainingPhotos: 3,
      yoloModelReady: true,
      yoloClassCount: 5,
      clipIndexTotal: 10,
      clipIndexClipCount: 8,
      clipIndexMissing: 2,
      clipIndexJob: null,
      hardNegativeCount: 1,
      feedbackPending: 1,
      speciesTrainingPhotos: 12,
      productTrainingPhotos: 4,
      productsWithTraining: 2,
      closedWorldMode: true,
      ocrUnifiedEnabled: true,
      ocrEngine: 'paddle',
      ocrTesseractFallback: true,
      detectCropMode: 'auto',
      detectCropModel: 'yolov8n',
      detectCropBackend: 'yolo',
      feedbackSpeciesTotal: 3,
      feedbackProductTotal: 1,
      yoloProductModelReady: false,
      yoloProductClassCount: 0,
      minProductTrainingPhotos: 3,
      visionLlmFallbackEnabled: false,
      visionLlmFallbackReady: false,
      embedModelId: 'siglip',
      embedFamily: 'siglip',
      embedMinScore: 0.2,
      embedIndexCurrentModel: 8,
      embedIndexStale: 0,
      negativeTypes: [{id: 'lainnya', label: 'Di luar katalog DA'}],
    });
    visionSpeciesMock.mockResolvedValue({
      rows: [
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
      page: 1,
      pages: 2,
      total: 12,
    });
    visionProductsMock.mockResolvedValue({
      rows: [
        {
          productId: 'p1',
          displayName: 'Frog Soil',
          name: 'Frog Soil',
          sku: 'SKU-1',
          catalogPhotoCount: 3,
          trainingCount: 1,
          readyForIndex: true,
          catalogPhotos: [],
        },
      ],
      page: 1,
      pages: 1,
      total: 1,
    });
    visionFeedbackMock.mockResolvedValue({
      rows: [
        {
          id: 'vfb1',
          conversationId: 'c1',
          buyerImageUrl: '/media/a.jpg',
          matchStatus: 'ambiguous',
          entityKind: 'species',
          suggestedDisplayName: 'Wrong',
          correctDisplayName: 'Rana sp.',
          correctSku: '',
          notes: '',
          inTrainingDataset: false,
          createdAt: '2026-08-01T10:00:00.000Z',
        },
      ],
      page: 1,
      pages: 1,
      total: 1,
    });
    visionHardNegMock.mockResolvedValue([]);
    visionQueueMock.mockResolvedValue([]);
    visionLatestEvalMock.mockResolvedValue(null);
    visionEvalRunsMock.mockResolvedValue([]);
    visionBaselineMock.mockResolvedValue(null);
  });

  it('renders shell with KPI, tabs, and phrase kamus', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Muat ulang');
    expect(text).toContain('Frasa aktif');
    expect(text).toContain('Consent setuju');
    expect(text).toContain('Koreksi produk');
    expect(text).toContain('Frasa respons cepat');
    expect(text).toContain('Vision inbox');
    expect(text).toContain('Fine-tuning');
    expect(text).toContain('Kamus frasa');
    expect(text).toContain('Tambah frasa');
    expect(text).toContain('anda siapa');
    expect(text).toContain('Identitas DARA');
    expect(phrasesMock).toHaveBeenCalled();
    expect(statsMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders consent kirim vocabulary on fulfillment tab', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=fulfillment" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Kosa kata consent kirim');
    expect(text).toContain('Setuju kirim');
    expect(text).toContain('Tahan kirim');
    expect(text).toContain('gas kirim aja');
    expect(text).toContain('Aksi autopilot');
    expect(phrasesMock).toHaveBeenCalledWith(
      expect.objectContaining({scope: 'fulfillment'}),
    );

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders product corrections and training actions on products tab', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=products" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Training ranking produk');
    expect(text).toContain('Training POC (≥5)');
    expect(text).toContain('Training penuh (≥50)');
    expect(text).toContain('Riwayat koreksi produk');
    expect(text).toContain('cari soil');
    expect(text).toContain('Frog Soil');
    expect(feedbackMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders conversation reviews on reviews tab', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=reviews" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Review percakapan DARA');
    expect(text).toContain('Menunggu review');
    expect(text).toContain('Selesai');
    expect(text).toContain('Buyer A');
    expect(text).toContain('Lambat jawab');
    expect(text).toContain('Review');
    expect(reviewsMock).toHaveBeenCalledWith(
      expect.objectContaining({status: 'pending', page: 1, limit: 20}),
    );

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders fine-tuning foundation on fineTune tab', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=fineTune" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Fine-tuning foundation');
    expect(text).toContain('Import kandidat');
    expect(text).toContain('Export JSONL');
    expect(text).toContain('Dataset kandidat');
    expect(text).toContain('Sanitizer / validasi');
    expect(text).toContain('Eval benchmark');
    expect(text).toContain('Training runs / registry');
    expect(text).toContain('anda siapa');
    expect(fineTuneSummaryMock).toHaveBeenCalled();
    expect(fineTuneCandidatesMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders vision inbox ringkasan on vision tab', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=vision" />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Vision inbox — closed-world');
    expect(text).toContain('Ringkasan');
    expect(text).toContain('Koreksi inbox');
    expect(text).toContain('Status pipeline');
    expect(text).toContain('Closed-world');
    expect(visionStatsMock).toHaveBeenCalled();
    expect(visionFeedbackMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows Katalog, Kelola, and pager on Species (YOLO)', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=vision" />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const speciesLabel = tree!.root.find(
      node =>
        typeof node.children?.[0] === 'string' &&
        node.children[0] === 'Species (YOLO)',
    );
    let pressable = speciesLabel.parent;
    while (pressable && typeof pressable.props?.onPress !== 'function') {
      pressable = pressable.parent;
    }
    expect(pressable).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      pressable!.props.onPress();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Daftar species');
    expect(text).toContain('Katalog');
    expect(text).toContain('Kelola');
    expect(text).toContain('Whites Tree Frog');
    expect(text).toContain('Sebelumnya');
    expect(text).toContain('Berikutnya');
    expect(visionSpeciesMock).toHaveBeenCalledWith(
      expect.objectContaining({page: 1}),
    );

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('matches Species columns on Produk YOLO (no SKU, has Status)', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=vision" />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const produkLabel = tree!.root.find(
      node =>
        typeof node.children?.[0] === 'string' &&
        node.children[0] === 'Produk',
    );
    let pressable = produkLabel.parent;
    while (pressable && typeof pressable.props?.onPress !== 'function') {
      pressable = pressable.parent;
    }
    expect(pressable).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      pressable!.props.onPress();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Daftar produk');
    expect(text).toContain('Katalog');
    expect(text).toContain('Status');
    expect(text).toContain('Siap latih');
    expect(text).toContain('Kelola');
    expect(text).toContain('Frog Soil');
    expect(text).not.toContain('"children":["SKU"]');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('denies access without dara-training or chat view', async () => {
    authMock.mockReturnValue({
      authUser: {roleKey: 'cashier', permissions: []},
    } as ReturnType<typeof useKolamAuthContext>);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training" />,
      );
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Akses ditolak');
    expect(text).toContain('dara-training');
    expect(text).not.toContain('Vision inbox');
    expect(statsMock).not.toHaveBeenCalled();
    expect(phrasesMock).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
