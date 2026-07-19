import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {getShellModule} from '../src/domain/app-shell';
import {amSurfaces, kolamSurfaces, pluginRegistry} from '../src/domain/unified';
import {useKolamOverviewController} from '../src/hooks/use-kolam-overview-controller';
import {seedUnifiedDataset} from '../src/services/unified-data';

type OverviewController = ReturnType<typeof useKolamOverviewController>;

function requireController(controller: OverviewController | null) {
  if (!controller) {
    throw new Error('Overview controller did not render.');
  }

  return controller;
}

function OverviewHarness({
  moduleId,
  onRender,
}: {
  moduleId: 'kolam' | 'am';
  onRender: (controller: OverviewController) => void;
}) {
  const controller = useKolamOverviewController({
    dataset: seedUnifiedDataset,
    module: getShellModule(moduleId),
    plugins: pluginRegistry,
  });

  onRender(controller);
  return null;
}

describe('Kolam overview controller hook', () => {
  it('keeps Beranda wired to Kolam surfaces and visit confirmations', async () => {
    let latest: OverviewController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <OverviewHarness
          moduleId="kolam"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.context.module.id).toBe('kolam');
    expect(controller.surfaces).toBe(kolamSurfaces);
    expect(controller.customerVisitPanel.descriptor.title).toBe(
      'Konfirmasi kunjungan layanan',
    );
    expect(controller.customerVisitPanel.rows.length).toBeGreaterThan(0);
    expect(controller.customerVisitPanel.isVisible).toBe(true);
    expect(controller.showModulePanelBelow).toBe(true);
    expect(controller.showRuntimeFooter).toBe(false);
  });

  it('keeps AM overview separated from Kolam-only Beranda sections', async () => {
    let latest: OverviewController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <OverviewHarness
          moduleId="am"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.context.module.id).toBe('am');
    expect(controller.surfaces).toBe(amSurfaces);
    expect(controller.customerVisitPanel.rows).toEqual([]);
    expect(controller.customerVisitPanel.isVisible).toBe(false);
    expect(controller.showModulePanelBelow).toBe(false);
    expect(controller.showRuntimeFooter).toBe(true);
  });
});
