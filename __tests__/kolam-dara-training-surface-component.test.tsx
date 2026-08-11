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

jest.mock('react-native-webview', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ReactNative.View,
  };
});

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

jest.mock('../src/services/kolam-dara-training-video-studio-api', () => ({
  fetchKolamDaraTrainingVideoStudioConfig: jest.fn(),
  listKolamDaraTrainingVideoStudioJobs: jest.fn(),
  uploadKolamDaraTrainingVideoStudioRaw: jest.fn(),
  createKolamDaraTrainingVideoStudioJob: jest.fn(),
  refreshKolamDaraTrainingVideoStudioJob: jest.fn(),
  pollKolamDaraTrainingVideoStudioJob: jest.fn(),
  cancelKolamDaraTrainingVideoStudioJob: jest.fn(),
  overlayKolamDaraTrainingVideoStudioLogo: jest.fn(),
  buildKolamDaraTrainingVideoStudioDownloadUrl: jest.fn(
    (id: string) =>
      `https://amfibi.dunia-anura.com/api/dara-training/video-studio/jobs/${id}/download`,
  ),
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
  fetchKolamDaraTrainingVisionClipIndexJob: jest.fn(),
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
  addKolamDaraTrainingVisionProductPhoto,
  fetchKolamDaraTrainingVisionStats,
  listKolamDaraTrainingVisionFeedback,
  listKolamDaraTrainingVisionFeedbackQueue,
  listKolamDaraTrainingVisionHardNegatives,
  listKolamDaraTrainingVisionProductPhotos,
  listKolamDaraTrainingVisionProducts,
  listKolamDaraTrainingVisionSpecies,
  fetchKolamDaraTrainingVisionBaselineKpi,
  fetchKolamDaraTrainingVisionClipIndexJob,
  fetchKolamDaraTrainingVisionLatestEvalRun,
  listKolamDaraTrainingVisionEvalRuns,
} from '../src/services/kolam-dara-training-vision-api';

import {
  fetchKolamDaraTrainingVideoStudioConfig,
  listKolamDaraTrainingVideoStudioJobs,
} from '../src/services/kolam-dara-training-video-studio-api';

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
const visionClipJobMock =
  fetchKolamDaraTrainingVisionClipIndexJob as jest.MockedFunction<
    typeof fetchKolamDaraTrainingVisionClipIndexJob
  >;
const visionProductPhotosMock =
  listKolamDaraTrainingVisionProductPhotos as jest.MockedFunction<
    typeof listKolamDaraTrainingVisionProductPhotos
  >;
const addVisionProductPhotoMock =
  addKolamDaraTrainingVisionProductPhoto as jest.MockedFunction<
    typeof addKolamDaraTrainingVisionProductPhoto
  >;
const videoStudioConfigMock =
  fetchKolamDaraTrainingVideoStudioConfig as jest.MockedFunction<
    typeof fetchKolamDaraTrainingVideoStudioConfig
  >;
const videoStudioJobsMock =
  listKolamDaraTrainingVideoStudioJobs as jest.MockedFunction<
    typeof listKolamDaraTrainingVideoStudioJobs
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
    fineTuneDatasetMock.mockResolvedValue({
      rows: [
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
      ],
      total: 1,
      page: 1,
      pages: 1,
      limit: 10,
    });
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
          catalogPhotos: [
            '/media/frog-a.jpg',
            '/media/frog-b.jpg',
            '/media/frog-c.jpg',
          ],
        },
        {
          productId: 'p2',
          displayName: 'Coco Fiber',
          name: 'Coco Fiber',
          sku: 'SKU-2',
          catalogPhotoCount: 2,
          trainingCount: 3,
          readyForIndex: true,
          catalogPhotos: ['/media/coco-a.jpg', '/media/coco-b.jpg'],
        },
      ],
      page: 1,
      pages: 1,
      total: 2,
    });
    visionProductPhotosMock.mockResolvedValue([]);
    addVisionProductPhotoMock.mockResolvedValue(undefined);
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
    visionClipJobMock.mockResolvedValue({job: null, log: []});
    videoStudioConfigMock.mockResolvedValue({
      apiKeyConfigured: true,
      region: 'ap-southeast',
      defaultModel: 'seedance-1-0-lite',
      models: ['seedance-1-0-lite'],
      maxUploadBytes: 104857600,
      maxSourceDurationSeconds: 30,
      supportedDurations: [5],
      supportedAspectRatios: ['16:9'],
      supportedResolutions: ['720p'],
      cancelSupported: true,
      modelCapabilities: {
        'seedance-1-0-lite': {durations: [5], resolutions: ['720p']},
      },
      publicUploadConfigured: true,
      preset: {name: 'species-cinematic', prompt: 'Preset prompt'},
    });
    videoStudioJobsMock.mockResolvedValue([]);
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
    expect(text).toContain('Vision inbox');
    expect(text).toContain('Foto yang bukan bukti bayar');
    expect(text).toContain('Di luar katalog');
    expect(text).toContain('Ringkasan');
    expect(text).not.toContain('Indeks katalog');
    expect(text).toContain('Koreksi inbox');
    expect(text).toContain('Status pipeline');
    expect(text).toContain('Indeks visual katalog');
    expect(text).toContain('Baris indeks');
    expect(text).toContain('Console log');
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
    expect(text).toContain('Halaman sebelumnya');
    expect(text).toContain('Halaman berikutnya');
    expect(visionSpeciesMock).toHaveBeenCalledWith(
      expect.objectContaining({page: 1}),
    );

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('matches Species columns on Produk YOLO with train-ready min photos', async () => {
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
    expect(text).toContain('Coco Fiber');
    expect(text).not.toContain('"children":["SKU"]');
    // Katalog 3 + Training 1 → Siap latih (Frog Soil); not stuck at training-only 1/3
    expect(text).not.toContain('"children":["1/3"]');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('opens Kelola with catalog picker and batch Tambah foto', async () => {
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
    let sectionPress = produkLabel.parent;
    while (sectionPress && typeof sectionPress.props?.onPress !== 'function') {
      sectionPress = sectionPress.parent;
    }
    await ReactTestRenderer.act(async () => {
      sectionPress!.props.onPress();
    });

    const kelola = tree!.root.findAll(
      node =>
        typeof node.props?.label === 'string' && node.props.label === 'Kelola',
    )[0];
    expect(kelola).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      kelola.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    let text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Foto katalog — klik untuk pilih');
    expect(text).toContain('Pilih foto katalog, lalu Tambah foto');
    expect(text).not.toContain('Atau path foto manual');
    expect(text).not.toContain('Path foto');
    expect(text).toContain('Tambah foto');
    expect(text).toContain('Tutup');
    expect(visionProductPhotosMock).toHaveBeenCalledWith('p1');

    const catalogThumb = tree!.root.find(
      node =>
        node.props?.accessibilityRole === 'button' &&
        node.props?.accessibilityLabel === '/media/frog-a.jpg',
    );
    await ReactTestRenderer.act(async () => {
      catalogThumb.props.onPress();
    });
    const thumbStyles = ([] as unknown[]).concat(catalogThumb.props.style ?? []);
    expect(
      thumbStyles.some(
        style =>
          style != null &&
          typeof style === 'object' &&
          (style as {borderWidth?: number}).borderWidth === 2,
      ),
    ).toBe(true);

    const tambah = tree!.root.find(
      node =>
        typeof node.props?.label === 'string' &&
        node.props.label === 'Tambah foto',
    );
    await ReactTestRenderer.act(async () => {
      tambah.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(addVisionProductPhotoMock).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        photoKey: '/media/frog-a.jpg',
        source: 'catalog',
      }),
    );
    text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Foto ditambahkan');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders video studio body on videoStudio tab', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingSurface route="/list-of-users/dara-training?tab=videoStudio" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Dunia Anura Video Studio');
    expect(text).toContain('Upload RAW');
    expect(text).toContain('Histori job');
    expect(videoStudioConfigMock).toHaveBeenCalled();
    expect(videoStudioJobsMock).toHaveBeenCalledWith(5);

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('denies access without dara-training or chat view', async () => {
    authMock.mockReturnValue({
      authUser: {roleKey: 'cashier', permissions: []},
    } as unknown as ReturnType<typeof useKolamAuthContext>);

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
