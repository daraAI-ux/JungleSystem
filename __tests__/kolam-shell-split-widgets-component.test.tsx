import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamAuthPanel } from '../src/components/kolam-auth-panel';
import { KolamDashboardHeader } from '../src/components/kolam-dashboard-header';
import { KolamSyncStatusBar } from '../src/components/kolam-sync-status-bar';
import { KolamTopNavigation } from '../src/components/kolam-top-navigation';
import { authSources } from '../src/domain/auth';
import {
  getDashboardHeaderActions,
  getDashboardHeaderSyncIndicator,
} from '../src/domain/dashboard-header';
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

describe('shell split widgets', () => {
  it('renders direct imports for shell controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamTopNavigation
            attentionCount={3}
            breadcrumbItems={getTopNavBreadcrumbItems('checkout')}
            displayInitials="KA"
            onAvatarPress={() => undefined}
            onBreadcrumbDashboardPress={() => undefined}
            onNotificationPress={() => undefined}
            onToggleSidebar={() => undefined}
            rightControls={getTopNavRightControls()}
          />
          <KolamDashboardHeader
            actions={getDashboardHeaderActions()}
            eyebrow="Beranda"
            onSelectModule={() => undefined}
            sessionCashier="Kasir A"
            sessionOpen
            showSessionPill={false}
            syncIndicator={seedHeaderSyncIndicator}
            subtitle="Native Windows workspace"
            title="Kolam"
          />
          <KolamAuthPanel
            accessScope={{ am: true, kolam: true, pos: true }}
            amApiBaseUrl="https://server.example"
            authEmail="kasir@example.test"
            authMessage="Ready"
            authPassword="secret"
            authSource="kolam"
            authSourceHint="server runtime"
            authSources={authSources}
            displayName="Kasir Anura"
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
            loading={false}
            message="Runtime tersambung"
            errorMessage="Client gate pending"
          />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Dashboard',
        'Checkout',
        'Beranda',
        'Kolam',
        'Kasir Anura',
        'Runtime tersambung',
        'Client gate pending',
      ]),
    );
    expect(text).not.toContain('Cashflow open');
    expect(text).not.toContain('Kasir A');
  });
});
