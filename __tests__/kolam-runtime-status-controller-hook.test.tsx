import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamRuntimeStatusController} from '../src/hooks/use-kolam-runtime-status-controller';
import {
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';

type RuntimeStatusController = ReturnType<
  typeof useKolamRuntimeStatusController
>;

function requireController(controller: RuntimeStatusController | null) {
  if (!controller) {
    throw new Error('Runtime status controller did not render.');
  }

  return controller;
}

function StatusHarness({
  dataset,
  onRender,
}: {
  dataset: UnifiedDataset;
  onRender: (controller: RuntimeStatusController) => void;
}) {
  const controller = useKolamRuntimeStatusController({dataset});

  onRender(controller);
  return null;
}

describe('Kolam runtime status controller hook', () => {
  it('builds runtime identity and readiness status for the shared shell', async () => {
    let latest: RuntimeStatusController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <StatusHarness
          dataset={seedUnifiedDataset}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.readinessChecks.length).toBeGreaterThan(0);
    expect(controller.readinessSummaryText).toMatch(/ready/);
    expect(controller.runtimeIdentityItems.length).toBeGreaterThan(0);
    expect(controller.runtimeIdentityMeta).toContain('ready');
    expect(controller.attentionItems.map(item => item.id)).toEqual(
      expect.arrayContaining(['sync-pos', 'sync-kolam', 'sync-am']),
    );
  });

  it('surfaces live API errors into the shared attention list', async () => {
    let latest: RuntimeStatusController | null = null;
    const dataset: UnifiedDataset = {
      ...seedUnifiedDataset,
      errorMessage: 'POS server refused the runtime client.',
      kolam: {
        ...seedUnifiedDataset.kolam,
        errorMessage: 'Kolam server refused the runtime client.',
      },
      am: {
        ...seedUnifiedDataset.am,
        errorMessage: 'AM server refused the runtime client.',
      },
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <StatusHarness
          dataset={dataset}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const attentionIds = requireController(latest).attentionItems.map(
      item => item.id,
    );

    expect(attentionIds).toEqual(
      expect.arrayContaining(['error-pos', 'error-kolam', 'error-am']),
    );
  });
});
