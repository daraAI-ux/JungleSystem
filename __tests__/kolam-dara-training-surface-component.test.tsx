import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraTrainingSurface} from '../src/components/kolam-dara-training-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {
  fetchKolamDaraTrainingStats,
  listKolamDaraTrainingFeedback,
  listKolamDaraTrainingPhrases,
} from '../src/services/kolam-dara-training-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-training-api', () => ({
  fetchKolamDaraTrainingStats: jest.fn(),
  listKolamDaraTrainingPhrases: jest.fn(),
  listKolamDaraTrainingFeedback: jest.fn(),
  createKolamDaraTrainingPhrase: jest.fn(),
  updateKolamDaraTrainingPhrase: jest.fn(),
  deleteKolamDaraTrainingPhrase: jest.fn(),
  runKolamDaraTrainingProductRerank: jest.fn(),
}));

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
