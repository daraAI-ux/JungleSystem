import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {getAccessScope, type AccessScope} from '../src/domain/auth';
import {useKolamUnifiedDataController} from '../src/hooks/use-kolam-unified-data-controller';
import {
  loadUnifiedDataset,
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';

jest.mock('../src/services/unified-data', () => {
  const actual = jest.requireActual('../src/services/unified-data');

  return {
    ...actual,
    loadUnifiedDataset: jest.fn(),
  };
});

type UnifiedDataController = ReturnType<typeof useKolamUnifiedDataController>;

const loadUnifiedDatasetMock =
  loadUnifiedDataset as jest.MockedFunction<typeof loadUnifiedDataset>;

function requireController(controller: UnifiedDataController | null) {
  if (!controller) {
    throw new Error('Unified data controller did not render.');
  }

  return controller;
}

function UnifiedDataHarness({
  onRender,
}: {
  onRender: (controller: UnifiedDataController) => void;
}) {
  const controller = useKolamUnifiedDataController();

  onRender(controller);
  return null;
}

function buildDataset(sync: UnifiedDataset['sync']): UnifiedDataset {
  return {
    ...seedUnifiedDataset,
    sync,
  };
}

describe('Kolam unified data controller hook', () => {
  beforeEach(() => {
    loadUnifiedDatasetMock.mockReset();
  });

  it('loads the initial dataset with anonymous access scope and records sync activity', async () => {
    let latest: UnifiedDataController | null = null;
    const initialDataset = buildDataset({
      pos: 'seed',
      kolam: 'disabled',
      am: 'disabled',
    });
    loadUnifiedDatasetMock.mockResolvedValue(initialDataset);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <UnifiedDataHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(loadUnifiedDatasetMock).toHaveBeenCalledWith({
      enabledAreas: getAccessScope(null),
    });
    expect(controller.dataset).toBe(initialDataset);
    expect(controller.isLoadingDataset).toBe(false);
    expect(controller.syncActivity[0].status).toBe('seed');
    expect(controller.syncActivity.length).toBeGreaterThan(3);
  });

  it('refreshes the runtime dataset with the configured server base URL and access scope', async () => {
    let latest: UnifiedDataController | null = null;
    const initialDataset = buildDataset({
      pos: 'seed',
      kolam: 'seed',
      am: 'disabled',
    });
    const refreshedDataset = buildDataset({
      pos: 'live',
      kolam: 'live',
      am: 'live',
    });
    const enabledAreas: AccessScope = {
      am: true,
      kolam: true,
      pos: true,
    };
    loadUnifiedDatasetMock
      .mockResolvedValueOnce(initialDataset)
      .mockResolvedValueOnce(refreshedDataset);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <UnifiedDataHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).setAmApiBaseUrl('https://frogs.example.test/api');
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).refreshUnifiedDataset({
        enabledAreas,
        preferLiveApi: true,
      });
    });

    expect(loadUnifiedDatasetMock).toHaveBeenLastCalledWith({
      preferLiveApi: true,
      amApiBaseUrl: 'https://frogs.example.test/api',
      enabledAreas,
      kolamDashboardRange: 'month',
    });
    expect(requireController(latest).dataset).toBe(refreshedDataset);
    expect(requireController(latest).syncActivity[0].status).toBe('live');
  });

  it('refreshes Kolam dashboard data with the selected SalesGraph range', async () => {
    let latest: UnifiedDataController | null = null;
    const initialDataset = buildDataset({
      pos: 'seed',
      kolam: 'seed',
      am: 'disabled',
    });
    const refreshedDataset = buildDataset({
      pos: 'seed',
      kolam: 'live',
      am: 'disabled',
    });
    const enabledAreas: AccessScope = {
      am: false,
      kolam: true,
      pos: false,
    };
    loadUnifiedDatasetMock
      .mockResolvedValueOnce(initialDataset)
      .mockResolvedValueOnce(refreshedDataset);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <UnifiedDataHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).refreshUnifiedDataset({
        enabledAreas,
        kolamDashboardRange: 'year',
        preferLiveApi: true,
      });
    });

    expect(loadUnifiedDatasetMock).toHaveBeenLastCalledWith({
      preferLiveApi: true,
      amApiBaseUrl: 'https://frogs.dunia-anura.com/api',
      enabledAreas,
      kolamDashboardRange: 'year',
    });
    expect(requireController(latest).kolamDashboardRange).toBe('year');
  });
});
