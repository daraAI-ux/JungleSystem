import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {getShellModule} from '../src/domain/app-shell';
import {useKolamDashboardSectionsController} from '../src/hooks/use-kolam-dashboard-sections-controller';
import {seedUnifiedDataset} from '../src/services/unified-data';

type DashboardSectionsController = ReturnType<
  typeof useKolamDashboardSectionsController
>;

function requireController(controller: DashboardSectionsController | null) {
  if (!controller) {
    throw new Error('Dashboard sections controller did not render.');
  }

  return controller;
}

function DashboardSectionsHarness({
  moduleId,
  onRender,
}: {
  moduleId: 'kolam' | 'am';
  onRender: (controller: DashboardSectionsController) => void;
}) {
  const controller = useKolamDashboardSectionsController({
    dataset: seedUnifiedDataset,
    module: getShellModule(moduleId),
  });

  onRender(controller);
  return null;
}

describe('Kolam dashboard sections controller hook', () => {
  it('builds Beranda dashboard sections from the shared domain contracts', async () => {
    let latest: DashboardSectionsController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DashboardSectionsHarness
          moduleId="kolam"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.isKolamDashboard).toBe(true);
    expect(controller.countDescriptor.title).toBe('Ringkasan Inventori');
    expect(controller.statCards[0].label).toBe('Omzet Hari ini');
    expect(controller.countCards.map(card => card.label)).toEqual([
      'Produk',
      'Bahan baku',
      'Life stock',
      'Layanan',
    ]);
    expect(controller.railSections.map(section => section.title)).toEqual([
      'Stok Habis',
      'Stok Menipis',
      'Produk Terlaris',
    ]);
    expect(controller.salesGraph?.title).toBe('Ringkasan Penjualan');
    expect(controller.pendingOrdersDescriptor?.title).toBe(
      'Pesanan perlu ditindak lanjuti',
    );
    expect(controller.pendingOrdersPanel?.description).toContain(
      'Penjualan umum',
    );
  });

  it('keeps AM overview away from Kolam-only dashboard sections', async () => {
    let latest: DashboardSectionsController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DashboardSectionsHarness
          moduleId="am"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.isKolamDashboard).toBe(false);
    expect(controller.countCards).toEqual([]);
    expect(controller.statCards).toEqual([]);
    expect(controller.railSections).toEqual([]);
    expect(controller.salesGraph).toBeNull();
    expect(controller.pendingOrdersDescriptor).toBeNull();
    expect(controller.pendingOrdersPanel).toBeNull();
  });
});
