import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamAppRoot} from '../src/components/kolam-app-root';
import {KolamAppStateProvider} from '../src/context/kolam-app-state-provider';
import {
  useKolamAuthContext,
  useKolamDataContext,
  useKolamNavigationContext,
  useKolamShellChromeContext,
  useKolamWorkspaceViewContext,
} from '../src/context/kolam-app-contexts';

jest.mock('react-native-webview', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ReactNative.View,
  };
});

jest.mock('../src/hooks/use-kolam-server-metrics-controller', () => ({
  useKolamServerMetricsController: () => ({
    loading: false,
    snapshot: null,
  }),
}));

describe('Kolam app context split', () => {
  it('provides auth data navigation shell and workspace slices', async () => {
    let sawAuth = false;
    let sawData = false;
    let sawNavigation = false;
    let sawShell = false;
    let sawWorkspace = false;

    function Probe() {
      const auth = useKolamAuthContext();
      const data = useKolamDataContext();
      const navigation = useKolamNavigationContext();
      const shell = useKolamShellChromeContext();
      const workspaceView = useKolamWorkspaceViewContext();

      sawAuth = Boolean(auth);
      sawData = Boolean(data.dataset);
      sawNavigation = Boolean(navigation.activeModule);
      sawShell = Boolean(shell.sidebar && shell.topNavigation);
      sawWorkspace = Boolean(workspaceView.workspace && workspaceView.runtime);

      return <Text>context-ok</Text>;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <KolamAppStateProvider>
          <Probe />
        </KolamAppStateProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(sawAuth).toBe(true);
    expect(sawData).toBe(true);
    expect(sawNavigation).toBe(true);
    expect(sawShell).toBe(true);
    expect(sawWorkspace).toBe(true);
  });

  it('renders login through KolamAppRoot when signed out', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAppStateProvider>
          <KolamAppRoot />
        </KolamAppStateProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const labels = renderer!.root
      .findAll(node => typeof node.props?.accessibilityLabel === 'string')
      .map(node => node.props.accessibilityLabel as string);

    expect(labels).toEqual(
      expect.arrayContaining(['JungleSystem login screen']),
    );
  });
});
