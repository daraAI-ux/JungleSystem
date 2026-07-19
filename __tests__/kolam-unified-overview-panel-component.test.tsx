import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCardFrame} from '../src/components/kolam-card-frame';
import {KolamHeaderFrame} from '../src/components/kolam-header-frame';
import {KolamListFrame} from '../src/components/kolam-list-frame';
import {KolamUnifiedOverviewPanel} from '../src/components/kolam-unified-overview-panel';
import {KolamPressable} from '../src/components/kolam-pressable';
import {getShellModule} from '../src/domain/app-shell';
import {
  getDashboardCountSectionDescriptor,
  getDashboardCountVisualContract,
} from '../src/domain/dashboard-counts';
import {getDashboardCustomerVisitConfirmations} from '../src/domain/dashboard-customer-visit-confirmations';
import {getDashboardLayoutVisualContract} from '../src/domain/dashboard-layout';
import {getDashboardPendingOrders} from '../src/domain/dashboard-pending-orders';
import {getDashboardRailSections} from '../src/domain/dashboard-rail';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import {pluginRegistry} from '../src/domain/unified';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('KolamUnifiedOverviewPanel', () => {
  it('renders Kolam Beranda cleanly while keeping plugin overview', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
          />
          <KolamUnifiedOverviewPanel
            module={getShellModule('plugins')}
            dataset={seedUnifiedDataset}
            plugins={pluginRegistry.slice(0, 2)}
            pluginSearch="chat"
            onPluginSearchChange={() => undefined}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Omzet Hari ini',
        'Plugin tersedia',
        'Unified runtime',
      ]),
    );
    expect(text).not.toContain('Kolam Surface Launcher');
  });

  it('uses the live Beranda main gap between top-level dashboard sections', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
          />
        </View>,
      );
    });

    const statsStrip = renderer!.root
      .findAllByType(KolamListFrame)
      .find(frame => frame.props.variant === 'dashboardMetric');
    const sectionCards = renderer!.root
      .findAllByType(KolamCardFrame)
      .filter(frame => {
        const isDashboardSection = [
          'dashboardInventoryCounts',
          'dashboardPendingOrders',
          'dashboardVisitConfirmations',
        ].includes(frame.props.variant);

        return (
          isDashboardSection &&
          frame.props.style?.marginBottom === visual.main.gapY
        );
      });

    expect(statsStrip?.props.style).toEqual(
      expect.objectContaining({marginBottom: visual.main.gapY}),
    );
    expect(sectionCards.length).toBeGreaterThanOrEqual(2);
  });

  it('forwards Beranda customer visit confirmation actions', async () => {
    const onCustomerVisitConfirm = jest.fn();
    const [confirmation] =
      getDashboardCustomerVisitConfirmations(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
            onCustomerVisitConfirm={onCustomerVisitConfirm}
          />
        </View>,
      );
    });

    const action = renderer!.root.findByProps({
      accessibilityLabel: confirmation.actionAccessibilityLabel,
    });

    await ReactTestRenderer.act(async () => {
      action.props.onPress();
    });

    expect(onCustomerVisitConfirm).toHaveBeenCalledWith(confirmation);
  });

  it('forwards Beranda Pending Orders routes from live dashboard links', async () => {
    const onDashboardRoute = jest.fn();
    const pendingOrdersPanel = getDashboardPendingOrders(seedUnifiedDataset);
    const [item] = pendingOrdersPanel.sections[0].items;
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
            onDashboardRoute={onDashboardRoute}
          />
        </View>,
      );
    });

    const row = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === `${item.invoiceCode} - ${item.route}`,
      );

    if (!row) {
      throw new Error('Pending Orders route row did not render.');
    }

    await ReactTestRenderer.act(async () => {
      row.props.onPress();
    });

    expect(onDashboardRoute).toHaveBeenCalledWith(item.route);
  });

  it('forwards Beranda right rail product routes from live dashboard links', async () => {
    const onDashboardRoute = jest.fn();
    const section = getDashboardRailSections(seedUnifiedDataset).find(
      railSection => railSection.items.length,
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!section) {
      throw new Error('Seed dashboard rail did not include row items.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
            onDashboardRoute={onDashboardRoute}
          />
        </View>,
      );
    });

    const action = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          `${section.actionLabel} - ${section.actionRoute}`,
      );

    if (!action) {
      throw new Error('Right rail route action did not render.');
    }

    await ReactTestRenderer.act(async () => {
      action.props.onPress();
    });

    expect(onDashboardRoute).toHaveBeenCalledWith(section.actionRoute);
  });

  it('forwards Beranda InventoryCounts routes from live dashboard links', async () => {
    const onDashboardRoute = jest.fn();
    const descriptor = getDashboardCountSectionDescriptor();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedOverviewPanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
            onDashboardRoute={onDashboardRoute}
          />
        </View>,
      );
    });

    const action = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          `${descriptor.actionLabel} - ${descriptor.actionRoute}`,
      );

    if (!action) {
      throw new Error('InventoryCounts route action did not render.');
    }

    await ReactTestRenderer.act(async () => {
      action.props.onPress();
    });

    const actionLabel = renderer!.root
      .findAllByType(Text)
      .find(node =>
        flattenText(node.props.children).includes(descriptor.actionLabel),
      );
    const visual = getDashboardCountVisualContract();
    const sectionHeader = renderer!.root
      .findAllByType(KolamHeaderFrame)
      .find(frame => frame.props.variant === 'dashboardCountSection');

    expect(actionLabel?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({color: V.colors.primary}),
      ]),
    );
    expect(sectionHeader).toBeTruthy();
    expect(visual.section.headerBorderBottom).toBe(false);
    expect(onDashboardRoute).toHaveBeenCalledWith(descriptor.actionRoute);
  });
});
