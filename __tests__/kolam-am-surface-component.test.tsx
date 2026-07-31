import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamAmSurface} from '../src/components/kolam-am-surface';
import {
  getAmActivityLogs,
  getAmDeviceServiceLogs,
  getAmDevices,
  getAmMutasi,
  getAmRacks,
  getAmServiceAccounts,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
} from '../src/services/am-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/am-api', () => ({
  getAmActivityLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmActivityLogStats: jest.fn(() => Promise.resolve({since: '', days: 7, byType: [], byStatus: [], topUsers: [], topPaths: []})),
  getAmBoxes: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmDeviceServiceLogs: jest.fn(() => Promise.resolve({logs: [], processRunning: false})),
  getAmDevices: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmMutasi: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmMutasiSummary: jest.fn(() => Promise.resolve({masuk: {total: 0, count: 0}, keluar: {total: 0, count: 0}})),
  getAmRacks: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmServiceAccounts: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmTasks: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmTransfers: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmUsers: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmWebhookConfigs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmWebhookLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
}));

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

describe('KolamAmSurface', () => {
  const renderers: ReactTestRenderer.ReactTestRenderer[] = [];

  afterEach(() => {
    for (const renderer of renderers.splice(0)) {
      act(() => {
        renderer.unmount();
      });
    }
    jest.clearAllMocks();
  });

  it('renders AM as an app surface with its own sidebar', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    const text = renderText(renderer!);

    expect(text).toContain('AM');
    expect(text).toContain('Automation Management');
    expect(text).toContain('Dashboard');
    expect(text).toContain('Services');
    expect(text).toContain('Hardware');
    expect(text).toContain('Transfers');
    expect(text).toContain('Activity Log');
  });

  it('keeps the POS-style back button wired to return to Kolam', async () => {
    const onBackToCenter = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface
          dataset={seedUnifiedDataset}
          onBackToCenter={onBackToCenter}
        />,
      );
    });
    renderers.push(renderer!);

    const backButton = renderer!.root.findByProps({
      accessibilityLabel: 'Kembali',
    });

    act(() => {
      backButton.props.onPress();
    });

    expect(onBackToCenter).toHaveBeenCalledTimes(1);
  });

  it('loads live service accounts from the Services route', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Services'}).props.onPress();
    });

    expect(getAmServiceAccounts).toHaveBeenCalledWith({platform: undefined});
  });

  it('expands a service row and loads logs plus task history', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValueOnce({
      data: [
        {
          _id: 'service-1',
          platform: 'tokopedia',
          label: 'Tokopedia Main',
          deviceId: {
            _id: 'device-1',
            name: 'Phone 1',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.2:5555',
            udid: null,
          },
          status: 'active',
          credentials: {},
          meta: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Services'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Main'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Tokopedia Main History'}).props.onPress();
    });

    expect(getAmDeviceServiceLogs).toHaveBeenCalledWith('device-1', {
      limit: 80,
      page: 1,
      source: 'realtime',
    });
    expect(jest.requireMock('../src/services/am-api').getAmTasks).toHaveBeenCalledWith({
      limit: 5,
      page: 1,
      serviceAccountId: 'service-1',
    });
  });

  it('loads live hardware topology from the Hardware route', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware'}).props.onPress();
    });

    expect(getAmRacks).toHaveBeenCalledTimes(1);
    expect(getAmDevices).toHaveBeenCalledTimes(1);
  });

  it('loads banking and admin live routes from the internal AM sidebar', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAmSurface dataset={seedUnifiedDataset} />,
      );
    });
    renderers.push(renderer!);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfers'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Mutations'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhooks'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Users'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Activity Log'}).props.onPress();
    });

    expect(getAmTransfers).toHaveBeenCalledWith({
      limit: 30,
      search: undefined,
      status: undefined,
    });
    expect(getAmMutasi).toHaveBeenCalledWith({limit: 30, type: undefined});
    expect(getAmWebhookConfigs).toHaveBeenCalledTimes(1);
    expect(getAmUsers).toHaveBeenCalledWith({limit: 30, search: undefined});
    expect(getAmActivityLogs).toHaveBeenCalledWith({
      limit: 40,
      status: undefined,
    });
  });
});
