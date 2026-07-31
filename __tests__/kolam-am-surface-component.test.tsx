import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamAmSurface} from '../src/components/kolam-am-surface';
import {
  cancelAmTransfer,
  cancelAmTask,
  clearAmServiceAccountSession,
  createAmBox,
  createAmDevice,
  createAmRack,
  createAmUser,
  createAmWebhookConfig,
  deleteAmDevices,
  deleteAmRacks,
  deleteAmUser,
  deleteAmWebhookConfig,
  getAmActivityLogs,
  getAmDeviceServiceLogs,
  getAmDeviceServices,
  getAmDevices,
  getAmMutasi,
  getAmRacks,
  getAmRoles,
  getAmServiceAccounts,
  getAmTransferById,
  getAmTransfers,
  getAmUsers,
  getAmWebhookConfigs,
  sendAmDeviceServiceInput,
  testAmWebhookPing,
  updateAmRack,
  updateAmUser,
  updateAmWebhookConfig,
  startAmDeviceService,
} from '../src/services/am-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/am-api', () => ({
  cancelAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  cancelAmTask: jest.fn(() => Promise.resolve({_id: 'task-1'})),
  clearAmServiceAccountSession: jest.fn(() => Promise.resolve({stopped: true, deleted: ['session.json'], missing: []})),
  createAmBox: jest.fn(() => Promise.resolve({_id: 'box-new'})),
  createAmDevice: jest.fn(() => Promise.resolve({_id: 'device-new'})),
  createAmRack: jest.fn(() => Promise.resolve({_id: 'rack-new'})),
  createAmUser: jest.fn(() => Promise.resolve({_id: 'user-new'})),
  createAmWebhookConfig: jest.fn(() => Promise.resolve({_id: 'webhook-1'})),
  deleteAmBoxes: jest.fn(() => Promise.resolve(undefined)),
  deleteAmDevices: jest.fn(() => Promise.resolve(undefined)),
  deleteAmRacks: jest.fn(() => Promise.resolve(undefined)),
  deleteAmUser: jest.fn(() => Promise.resolve(undefined)),
  deleteAmWebhookConfig: jest.fn(() => Promise.resolve({success: true})),
  forceFailAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  forceFailAmTask: jest.fn(() => Promise.resolve({_id: 'task-1'})),
  getAmActivityLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmActivityLogStats: jest.fn(() => Promise.resolve({since: '', days: 7, byType: [], byStatus: [], topUsers: [], topPaths: []})),
  getAmBoxes: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmDeviceServiceLogs: jest.fn(() => Promise.resolve({logs: [], processRunning: false})),
  getAmDeviceServices: jest.fn(() => Promise.resolve([])),
  getAmDeviceServiceQrUrl: jest.fn(() => 'https://frogs.dunia-anura.com/api/device/device-1/service/shopee-qr?t=qr-1'),
  getAmDevices: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmMutasi: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmMutasiSummary: jest.fn(() => Promise.resolve({masuk: {total: 0, count: 0}, keluar: {total: 0, count: 0}})),
  getAmRacks: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmRoles: jest.fn(() => Promise.resolve([])),
  getAmServiceAccounts: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmTasks: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmTransferById: jest.fn(() => Promise.resolve({_id: 'transfer-1', logs: []})),
  getAmTransfers: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmUsers: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmWebhookConfigs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  getAmWebhookEvents: jest.fn(() => Promise.resolve(['transfer.success', 'mutasi.created'])),
  getAmWebhookLogs: jest.fn(() => Promise.resolve({data: [], meta: {total: 0, limit: 0}})),
  retryAmTransfer: jest.fn(() => Promise.resolve({_id: 'transfer-1'})),
  retryAmTask: jest.fn(() => Promise.resolve({_id: 'task-1'})),
  sendAmDeviceServiceInput: jest.fn(() => Promise.resolve({success: true})),
  startAmDeviceService: jest.fn(() => Promise.resolve({success: true})),
  stopAmDeviceService: jest.fn(() => Promise.resolve({success: true})),
  testAmWebhookPing: jest.fn(() => Promise.resolve({success: true})),
  updateAmBox: jest.fn(() => Promise.resolve({_id: 'box-1'})),
  updateAmDevice: jest.fn(() => Promise.resolve({_id: 'device-1'})),
  updateAmRack: jest.fn(() => Promise.resolve({_id: 'rack-1'})),
  updateAmUser: jest.fn(() => Promise.resolve({_id: 'user-1'})),
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

  it('runs guarded task actions from the Tasks route', async () => {
    jest.mocked(jest.requireMock('../src/services/am-api').getAmTasks).mockResolvedValue({
      data: [
        {
          _id: 'task-1',
          type: 'stock_sync',
          status: 'queued',
          priority: 1,
          deviceId: {_id: 'device-1', name: 'Phone 1'},
          serviceAccountId: {_id: 'service-1', label: 'Tokopedia Main'},
          payload: {},
          result: {},
          error: '',
          logs: [],
          retryCount: 0,
          maxRetries: 3,
          startedAt: null,
          completedAt: null,
          createdBy: null,
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Tasks'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Task Cancel task-1'}).props.onPress();
    });

    expect(cancelAmTask).toHaveBeenCalledWith('task-1');
    expect(jest.requireMock('../src/services/am-api').getAmTasks).toHaveBeenCalledTimes(2);
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
    expect(getAmDeviceServices).toHaveBeenCalledWith('device-1');
    expect(jest.requireMock('../src/services/am-api').getAmTasks).toHaveBeenCalledWith({
      limit: 5,
      page: 1,
      serviceAccountId: 'service-1',
    });
  });

  it('sends service OTP input when runtime logs request it', async () => {
    jest.mocked(getAmServiceAccounts).mockResolvedValue({
      data: [
        {
          _id: 'service-otp',
          platform: 'shopee',
          label: 'Shopee OTP',
          deviceId: {
            _id: 'device-otp',
            name: 'Phone OTP',
            connectionType: 'tcp',
            tcpAddress: '10.0.0.9:5555',
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
    jest.mocked(getAmDeviceServiceLogs).mockResolvedValue({
      logs: [
        {ts: '2026-01-01T00:00:00.000Z', level: 'info', message: 'OTP_REQUIRED'},
        {ts: '2026-01-01T00:00:01.000Z', level: 'info', message: 'QR_LOGIN {"qrcodeId":"qr-1","status":"WAITING"}'},
      ],
      processRunning: true,
    });
    jest.mocked(getAmDeviceServices).mockResolvedValue([
      {
        serviceAccountId: 'service-otp',
        label: 'Shopee OTP',
        platform: 'shopee',
        accountNumber: '',
        serviceStatus: 'active',
        taskStatus: 'running',
        processRunning: true,
        isBanking: false,
      },
    ]);
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Shopee OTP'}).props.onPress();
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('123456');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Service Submit Input service-otp'}).props.onPress();
    });

    expect(sendAmDeviceServiceInput).toHaveBeenCalledWith('device-otp', 'otp', '123456');
    expect(getAmDeviceServices).toHaveBeenCalledWith('device-otp');
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

  it('runs hardware create, edit, and delete actions from the Hardware route', async () => {
    jest.mocked(getAmRacks).mockResolvedValue({
      data: [
        {
          _id: 'rack-1',
          name: 'Rack 1',
          slug: 'rack-1',
          location: 'Old Room',
          description: 'Old rack',
          status: 'active',
          serverIp: '10.0.0.1',
          boxCount: 1,
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(jest.requireMock('../src/services/am-api').getAmBoxes).mockResolvedValue({
      data: [
        {
          _id: 'box-1',
          name: 'Box 1',
          slug: 'box-1',
          rackId: {_id: 'rack-1', name: 'Rack 1'},
          description: 'Box notes',
          status: 'active',
          deviceCount: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmDevices).mockResolvedValue({
      data: [
        {
          _id: 'device-1',
          name: 'Device 1',
          slug: 'device-1',
          boxId: {_id: 'box-1', name: 'Box 1', rackId: {_id: 'rack-1', name: 'Rack 1'}},
          connectionType: 'usb',
          udid: 'USB1234',
          tcpAddress: null,
          brand: 'Samsung',
          model: 'A52',
          systemPort: 8200,
          appiumPort: 4723,
          adbPort: 5037,
          adbStatus: 'connected',
          adbCheckedAt: '',
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

    let inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('Server Room A');
      inputs[1].props.onChangeText('Main AM rack');
      inputs[2].props.onChangeText('10.0.0.10');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmRack).toHaveBeenCalledWith({
      location: 'Server Room A',
      description: 'Main AM rack',
      serverIp: '10.0.0.10',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Edit Rack rack-1'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('Server Room B');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(updateAmRack).toHaveBeenCalledWith('rack-1', {
      location: 'Server Room B',
      description: 'Old rack',
      serverIp: '10.0.0.1',
      status: 'active',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Delete Rack rack-1'}).props.onPress();
    });

    expect(deleteAmRacks).toHaveBeenCalledWith(['rack-1']);

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Box'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('New box notes');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmBox).toHaveBeenCalledWith({
      rackId: 'rack-1',
      description: 'New box notes',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Segment Device'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('USBNEW1');
      inputs[2].props.onChangeText('Samsung');
      inputs[3].props.onChangeText('A54');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Save'}).props.onPress();
    });

    expect(createAmDevice).toHaveBeenCalledWith({
      boxId: 'box-1',
      connectionType: 'usb',
      udid: 'USBNEW1',
      brand: 'Samsung',
      model: 'A54',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM Hardware Delete Device device-1'}).props.onPress();
    });

    expect(deleteAmDevices).toHaveBeenCalledWith(['device-1']);
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
    expect(getAmUsers).toHaveBeenCalledWith({limit: 100, search: undefined});
    expect(getAmRoles).toHaveBeenCalledTimes(1);
    expect(getAmActivityLogs).toHaveBeenCalledWith({
      limit: 40,
      status: undefined,
    });
  });

  it('runs user create, edit, and delete actions from the Users route', async () => {
    jest.mocked(getAmRoles).mockResolvedValue([
      {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
    ]);
    jest.mocked(getAmUsers).mockResolvedValue({
      data: [
        {
          _id: 'user-1',
          fullName: 'Existing User',
          username: 'existing',
          role: {_id: 'role-admin', name: 'Admin', permissions: ['user:read'], description: 'Admin role'},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Users'}).props.onPress();
    });

    let inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[1].props.onChangeText('New User');
      inputs[2].props.onChangeText('newuser');
      inputs[3].props.onChangeText('StrongPass1!');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Role Admin'}).props.onPress();
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Save'}).props.onPress();
    });

    expect(createAmUser).toHaveBeenCalledWith({
      fullName: 'New User',
      username: 'newuser',
      password: 'StrongPass1!',
      role: 'role-admin',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Edit user-1'}).props.onPress();
    });
    inputs = renderer!.root.findAllByType(TextInput);
    await act(async () => {
      inputs[1].props.onChangeText('Existing User Updated');
      inputs[3].props.onChangeText('AnotherPass1!');
    });
    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Save'}).props.onPress();
    });

    expect(updateAmUser).toHaveBeenCalledWith('user-1', {
      fullName: 'Existing User Updated',
      password: 'AnotherPass1!',
    });

    await act(async () => {
      renderer!.root.findByProps({accessibilityLabel: 'AM User Delete user-1'}).props.onPress();
    });

    expect(deleteAmUser).toHaveBeenCalledWith('user-1');
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

  it('loads transfer detail from the Transfers route', async () => {
    const transfer = {
      _id: 'transfer-detail',
      accountId: { _id: 'account-1', label: 'BCA Main', platform: 'bca', accountNumber: '123' },
      amount: 250000,
      completedAt: '2026-01-01T00:05:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: { _id: 'user-1', fullName: 'Admin User', username: 'admin' },
      deviceId: { _id: 'device-1', name: 'Phone 1', udid: 'USB1234' },
      error: '',
      fee: 2500,
      logs: ['created', 'completed'],
      recipientAccount: '999',
      recipientBank: 'BCA',
      recipientName: 'Vendor Detail',
      screenshot: 'abc123',
      startedAt: '2026-01-01T00:01:00.000Z',
      status: 'success',
      transactionPurpose: 'Payment',
      transferMethod: 'BI FAST',
      transferType: 'transfer',
      updatedAt: '',
    };
    jest.mocked(getAmTransfers).mockResolvedValue({
      data: [transfer],
      meta: {total: 1, limit: 1},
    });
    jest.mocked(getAmTransferById).mockResolvedValue(transfer);
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
      renderer!.root.findByProps({accessibilityLabel: 'AM Transfer Detail transfer-detail'}).props.onPress();
    });

    expect(getAmTransferById).toHaveBeenCalledWith('transfer-detail');
    const text = renderText(renderer!);
    const joinedText = text.join(' ');
    expect(text).toContain('Transfer Detail');
    expect(text).toContain('Vendor Detail');
    expect(joinedText).toMatch(/Screenshot base64 tersedia \(\s*6\s+chars\)/);
    expect(joinedText).toMatch(/002\s+completed/);
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
