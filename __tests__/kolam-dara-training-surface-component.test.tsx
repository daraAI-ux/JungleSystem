import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraTrainingSurface} from '../src/components/kolam-dara-training-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {fetchKolamDaraTrainingStats} from '../src/services/kolam-dara-training-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-training-api', () => ({
  fetchKolamDaraTrainingStats: jest.fn(),
}));

const authMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const statsMock = fetchKolamDaraTrainingStats as jest.MockedFunction<
  typeof fetchKolamDaraTrainingStats
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
  });

  it('renders shell with KPI, tabs, and reload', async () => {
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
    expect(statsMock).toHaveBeenCalled();

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

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
