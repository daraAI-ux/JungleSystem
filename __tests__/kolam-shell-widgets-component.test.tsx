import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamAuthPanel,
  KolamDashboardHeader,
  KolamSidebar,
  KolamSyncStatusBar,
  KolamTopNavigation,
} from '../src/components/kolam-shell-widgets';
import { authSources } from '../src/domain/auth';
import {
  getDashboardHeaderActions,
  getDashboardHeaderSyncIndicator,
  getDashboardHeaderVisualContract,
  getDashboardSubtitle,
} from '../src/domain/dashboard-header';
import { kolamVisualTokens as V } from '../src/domain/kolam-visual';
import {
  getTopNavBreadcrumbItems,
  getTopNavRightControls,
} from '../src/domain/top-nav';
import { seedUnifiedDataset } from '../src/services/unified-data';

const seedHeaderSyncIndicator = getDashboardHeaderSyncIndicator({
  activeModule: 'kolam',
  dataset: seedUnifiedDataset,
});

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

function findTextNodeByLabelAndFontSize(
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  fontSize: number,
) {
  return renderer.root.findAllByType(Text).find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return (
      flattenText(node.props.children).includes(label) &&
      style?.fontSize === fontSize
    );
  });
}

describe('shell Kolam widgets', () => {
  it('renders navigation, dashboard header, auth panel, and sync status', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamTopNavigation
            attentionCount={2}
            breadcrumbItems={getTopNavBreadcrumbItems('checkout')}
            displayInitials="DA"
            rightControls={getTopNavRightControls()}
            serverMetrics={{
              snapshot: {
                checkedAt: '2026-07-19T00:00:00.000Z',
                cpuPercent: 12,
                memoryPercent: 34,
                diskPercent: 56,
              },
            }}
            onAvatarPress={() => undefined}
            onBreadcrumbDashboardPress={() => undefined}
            onNotificationPress={() => undefined}
            onToggleSidebar={() => undefined}
          />
          <KolamSidebar
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="kolam"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={() => undefined}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
          <KolamDashboardHeader
            actions={getDashboardHeaderActions()}
            title="Checkout"
            subtitle={getDashboardSubtitle('Checkout')}
            sessionOpen={false}
            showSessionPill
            syncIndicator={seedHeaderSyncIndicator}
            onSelectModule={() => undefined}
          />
          <KolamAuthPanel
            accessScope={{ am: true, kolam: true, pos: true }}
            amApiBaseUrl="https://am.example.test"
            authEmail=""
            authMessage="Runtime server existing siap."
            authPassword=""
            authSource="pos"
            authSourceHint="POS access_pos atau role POS."
            authSources={authSources}
            displayName="Dunia Anura"
            isSigningIn={false}
            onAmApiBaseUrlChange={() => undefined}
            onAuthEmailChange={() => undefined}
            onAuthPasswordChange={() => undefined}
            onAuthSourceChange={() => undefined}
            onLogin={() => undefined}
            onLogout={() => undefined}
            onSync={() => undefined}
          />
          <KolamSyncStatusBar
            message="Unified sync live"
            loading={false}
            errorMessage="sample warning"
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Dashboard',
        'Kolam',
        'Kolam Menu',
        'POS',
        'AM',
        'Plugin',
        'Checkout',
        'CPU 12%',
        'RAM 34%',
        'Disk 56%',
        'Cashflow closed',
        'Session',
        'Dunia Anura',
        'Login',
        'Sync',
        'Unified sync live',
        'sample warning',
      ]),
    );

    const headerVisual = getDashboardHeaderVisualContract();
    const titleNode = findTextNodeByLabelAndFontSize(
      renderer!,
      'Checkout',
      headerVisual.title.fontSize,
    );
    const titleStyle = StyleSheet.flatten(titleNode?.props.style);

    expect(titleStyle).toEqual(
      expect.objectContaining({
        color: V.colors.fg,
        fontSize: headerVisual.title.fontSize,
        fontWeight: '700',
        letterSpacing: headerVisual.title.appliedLetterSpacing,
      }),
    );
  });
});
