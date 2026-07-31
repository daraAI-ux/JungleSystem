import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamAmSurface} from '../src/components/kolam-am-surface';
import {
  cancelAmTransfer,
  clearAmServiceAccountSession,
  createAmWebhookConfig,
  deleteAmWebhookConfig,
  getAmActivityLogs,
  getAmDeviceServiceLogs,
  getAmDevices,
  getAmMutasi,
  getAmRacks,
  getAmServiceAccounts,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
  testAmWebhookPing,
  updateAmWebhookConfig,
  startAmDeviceService,
} from '../src/services/am-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/am-api', () => ({
  cancelAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  clearAmServiceAccountSession: jest.fn(() => Promise.resolve({stopped: true, deleted: ['session.json'], missing: []})),
  createAmWebhookConfig: jest.fn(() => Promise.resolve({_id: 'webhook-1'})),
  deleteAmWebhookConfig: jest.fn(() => Promise.resolve({success: true})),
  forceFailAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
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
  getAmWebhookEvents: jest.fn(() => Promise.resolve(['transfer.success', 'mutasi.created'])),
  getAmWebhookLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  retryAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  startAmDeviceService: jest.fn(() => Promise.resolve({success: true})),
  stopAmDeviceService: jest.fn(() => Promise.resolve({success: true})),
  testAmWebhookPing: jest.fn(() => Promise.resolve({success: true})),
  updateAmWebhookConfig: jest.fn(() => Promise.resolve({_id: 'webhook-1'})),
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

  it('runs service start and clear session actions from Services', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-2',
          platform: 'tokopedia',
          label: 'Tokopedia Session',
          deviceId: {
            _id: 'device-2',
            name: 'Phone 2',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.3:5555',
            udid: null,
          },
          status: 'inactive',
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Start service-2'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Tokopedia Session'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Clear Session service-2'}).props.onPress();
    });

    expect(startAmDeviceService).toHaveBeenCalledWith('device-2', 'service-2');
    expect(clearAmServiceAccountSession).toHaveBeenCalledWith('service-2');
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

  it('drills down hardware from rack to box to device detail', async () => {
    jest.mocked(getAmRacks).mockResolvedValueOnce({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack Alpha',
          slug: 'rack-alpha',
          location: 'Room A',
          description: '',
          status: 'active',
          serverIp: '10.0.0.1:2700',
          boxCount: 1,
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValueOnce({
      data: [
        {
          _id: 'box-1',
          name: 'Box 01',
          slug: 'box-01',
          rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          description: 'Main box',
          status: 'active',
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevices).mockResolvedValueOnce({
      data: [
        {
          _id: 'device-1',
          name: 'Phone Rack',
          slug: 'phone-rack',
          boxId: {
            _id: 'box-1',
            name: 'Box 01',
            rackId: {_id: 'rack-1', name: 'Rack Alpha'},
          },
          connectionType: 'tcp',
          tcpAddress: '10.0.0.5:5555',
          udid: null,
          brand: 'Samsung',
          model: 'A15',
          adbStatus: 'connected',
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Rack Rack Alpha'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Box Box 01'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Device Phone Rack'}).props.onPress();
    });

    const text = renderText(renderer!);
    expect(text).toContain('Phone Rack');
    expect(text).toContain('Samsung');
    expect(text).toContain('A15');
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

  it('runs guarded transfer actions from the Transfers route', async () => {
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [
        {
          _id: 'transfer-1',
          accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
          amount: 125000,
          completedAt: null,
          createdAt: '',
          createdBy: null,
          deviceId: { _id: 'device-1', name: 'Phone 1' },
          error: '',
          fee: 2500,
          logs: [],
          recipientAccount: '999',
          recipientBank: 'BCA',
          recipientName: 'Vendor',
          screenshot: '',
          startedAt: null,
          status: 'pending',
          transactionPurpose: null,
          transferMethod: 'BI FAST',
          transferType: 'transfer',
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfers'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Cancel transfer-1'}).props.onPress();
    });

    expect(cancelAmTransfer).toHaveBeenCalledWith('transfer-1');
    expect(getAmTransfers).toHaveBeenCalledTimes(2);
  });

  it('runs webhook register, toggle, delete, and test ping actions', async () => {
    jest.mocked(getAmWebhookConfigs).mockResolvedValue({
      data: [
        {
          _id: 'webhook-1',
          url: 'https://example.test/webhook',
          events: ['transfer.success'],
          status: 'active',
          description: 'Existing hook',
          lastDeliveredAt: null,
          failCount: 0,
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhooks'}).props.onPress();
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('https://new.example.test/webhook');
      inputs[1].props.onChangeText('secret');
      inputs[2].props.onChangeText('New hook');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Save'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Toggle webhook-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Webhook Delete webhook-1'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'Test Ping'}).props.onPress();
    });

    expect(createAmWebhookConfig).toHaveBeenCalledWith({
      url: 'https://new.example.test/webhook',
      events: ['transfer.success', 'mutasi.created'],
      description: 'New hook',
      secret: 'secret',
    });
    expect(updateAmWebhookConfig).toHaveBeenCalledWith('webhook-1', {
      status: 'inactive',
    });
    expect(deleteAmWebhookConfig).toHaveBeenCalledWith('webhook-1');
    expect(testAmWebhookPing).toHaveBeenCalledTimes(1);
  });
});
