import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamGlobalChatRail} from '../src/components/kolam-global-chat-rail';
import {KolamPressable} from '../src/components/kolam-pressable';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {useKolamChatLiveStream} from '../src/hooks/use-kolam-chat-live-stream';
import {useKolamChatRailDetail} from '../src/hooks/use-kolam-chat-rail-detail';
import {useKolamChatRailReadonlyData} from '../src/hooks/use-kolam-chat-rail-readonly-data';
import {useKolamNotificationSoundSettings} from '../src/hooks/use-kolam-notification-sound-settings';
import {
  createKolamTeamChatRoom,
  getKolamChatAnalytics,
  getKolamChatContactDetails,
  getKolamChatLabels,
  getKolamChatTemplates,
  getKolamUserPickerRows,
  openKolamTeamChatDirect,
} from '../src/services/kolam-api';
import {createKolamNotificationSoundService} from '../src/services/kolam-notification-sound-service';
import {pickNativeAssetFile} from '../src/services/native-file-picker';

const mockSoundPlay = jest.fn();
const openUrlMock = jest
  .spyOn(Linking, 'openURL')
  .mockResolvedValue(undefined);

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/hooks/use-kolam-chat-rail-detail', () => ({
  useKolamChatRailDetail: jest.fn(),
}));

jest.mock('../src/hooks/use-kolam-chat-rail-readonly-data', () => ({
  useKolamChatRailReadonlyData: jest.fn(),
}));

jest.mock('../src/hooks/use-kolam-chat-live-stream', () => ({
  useKolamChatLiveStream: jest.fn(),
}));

jest.mock('../src/hooks/use-kolam-notification-sound-settings', () => ({
  useKolamNotificationSoundSettings: jest.fn(),
}));

jest.mock('../src/services/kolam-api', () => {
  const actual = jest.requireActual('../src/services/kolam-api');
  return {
    ...actual,
    createKolamTeamChatRoom: jest.fn(),
    getKolamChatAnalytics: jest.fn(),
    getKolamChatContactDetails: jest.fn(),
    getKolamChatLabels: jest.fn(),
    getKolamChatTemplates: jest.fn(),
    getKolamUserPickerRows: jest.fn(),
    openKolamTeamChatDirect: jest.fn(),
  };
});

jest.mock('../src/services/kolam-notification-sound-service', () => ({
  createKolamNotificationSoundService: jest.fn(() => ({
    play: mockSoundPlay,
  })),
}));

jest.mock('../src/services/kolam-notification-sound-runtime', () => ({
  createKolamRuntimeNotificationSoundAdapter: jest.fn(() => ({
    play: jest.fn(),
  })),
}));

jest.mock('../src/components/kolam-remote-image', () => {
  const ReactForMock = require('react');
  const {Text: TextForMock} = require('react-native');
  return {
    KolamRemoteImage: ({accessibilityLabel}: {accessibilityLabel: string}) =>
      ReactForMock.createElement(TextForMock, null, accessibilityLabel),
  };
});

jest.mock('../src/services/native-file-picker', () => ({
  pickNativeAssetFile: jest.fn(),
}));

const useAuthContextMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const useDetailMock = useKolamChatRailDetail as jest.MockedFunction<
  typeof useKolamChatRailDetail
>;
const useReadonlyDataMock = useKolamChatRailReadonlyData as jest.MockedFunction<
  typeof useKolamChatRailReadonlyData
>;
const useLiveStreamMock = useKolamChatLiveStream as jest.MockedFunction<
  typeof useKolamChatLiveStream
>;
const useSoundSettingsMock =
  useKolamNotificationSoundSettings as jest.MockedFunction<
    typeof useKolamNotificationSoundSettings
  >;
const createTeamChatRoomMock =
  createKolamTeamChatRoom as jest.MockedFunction<
    typeof createKolamTeamChatRoom
  >;
const getUserPickerRowsMock = getKolamUserPickerRows as jest.MockedFunction<
  typeof getKolamUserPickerRows
>;
const openTeamChatDirectMock =
  openKolamTeamChatDirect as jest.MockedFunction<
    typeof openKolamTeamChatDirect
  >;
const getChatAnalyticsMock = getKolamChatAnalytics as jest.MockedFunction<
  typeof getKolamChatAnalytics
>;
const getChatContactDetailsMock =
  getKolamChatContactDetails as jest.MockedFunction<
    typeof getKolamChatContactDetails
  >;
const getChatLabelsMock = getKolamChatLabels as jest.MockedFunction<
  typeof getKolamChatLabels
>;
const getChatTemplatesMock = getKolamChatTemplates as jest.MockedFunction<
  typeof getKolamChatTemplates
>;
const createSoundServiceMock =
  createKolamNotificationSoundService as jest.MockedFunction<
    typeof createKolamNotificationSoundService
  >;
const pickNativeAssetFileMock = pickNativeAssetFile as jest.MockedFunction<
  typeof pickNativeAssetFile
>;

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

function getDefaultDetailMock() {
  return {
    activeCall: null,
    assignInboxToMe: jest.fn(),
    callBusy: false,
    callConfig: {enabled: false},
    conversation: null,
    declineCall: jest.fn(),
    editMessage: jest.fn(),
    endCall: jest.fn(),
    handoverCall: jest.fn(),
    joinCall: jest.fn(),
    loading: false,
    messages: [],
    messageSearchLoading: false,
    messageSearchQuery: '',
    messageSearchResults: null,
    muteCallParticipant: jest.fn(),
    presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
    clearTeamMessageSearch: jest.fn(),
    reactToMessage: jest.fn(),
    redialCall: jest.fn(),
    refresh: jest.fn(),
    refreshCall: jest.fn(),
    searchTeamMessages: jest.fn(),
    sendAttachment: jest.fn(),
    sendMessage: jest.fn(),
    setInboxLabels: jest.fn(),
    signalTyping: jest.fn(),
    sending: false,
    startCall: jest.fn(),
    teamRoomMetadata: {
      bots: [],
      canManageAiRoomAccess: false,
      dara: null,
      daraReplyEnabled: true,
      members: [],
    },
    toggleInboxAiHandled: jest.fn(),
    toggleInboxStatus: jest.fn(),
    toggleCallHand: jest.fn(),
    unassignInbox: jest.fn(),
    unmuteCallParticipant: jest.fn(),
    updatePresenceFromLive: jest.fn(),
  };
}

describe('KolamGlobalChatRail', () => {
  beforeEach(() => {
    mockSoundPlay.mockClear();
    openUrlMock.mockClear();
    createTeamChatRoomMock.mockClear();
    getUserPickerRowsMock.mockClear();
    openTeamChatDirectMock.mockClear();
    createSoundServiceMock.mockClear();
    getChatAnalyticsMock.mockClear();
    getChatContactDetailsMock.mockClear();
    getChatLabelsMock.mockClear();
    getChatTemplatesMock.mockClear();
    getChatAnalyticsMock.mockResolvedValue({
      avgReplyDelayMinutes: 4,
      lateReplyCount: 1,
      ratings: {average: 4.5},
      totalChats: 12,
    });
    getChatLabelsMock.mockResolvedValue([
      {_id: 'label-1', color: '#6fbd82', name: 'Prioritas'},
      {_id: 'label-2', color: 'd8c7a0', name: 'Follow up'},
    ]);
    getChatTemplatesMock.mockResolvedValue([
      {
        _id: 'template-1',
        body: 'Halo, stok masih tersedia.',
        category: 'general',
        title: 'Stok tersedia',
      },
      {
        _id: 'template-2',
        body: 'Baik, kami bantu cek invoice.',
        category: 'billing',
        title: 'Cek invoice',
      },
    ]);
    getChatContactDetailsMock.mockResolvedValue({
      contact: {
        _id: 'contact-1',
        displayName: 'Buyer Tokopedia',
        platform: 'tokopedia',
      },
      customer: {
        _id: 'customer-1',
        createdAt: '2026-07-01T00:00:00.000Z',
        email: 'buyer@example.com',
        name: 'Buyer Tokopedia',
        phone: '08123456789',
      },
      metrics: {
        ordersCount: 7,
        totalOrders: 4,
        totalSpend: 1250000,
      },
      recentOrders: [
        {
          _id: 'sale-1',
          finalTotal: 250000,
          invoiceCode: 'INV-001',
          itemsCount: 2,
          status: 'paid',
          transactionDate: '2026-07-20T00:00:00.000Z',
        },
      ],
    });
    useAuthContextMock.mockReturnValue({
      accessScope: {am: false, kolam: true, pos: false},
      authEmail: '',
      authMessage: '',
      authPassword: '',
      authSource: 'kolam',
      authSourceHint: '',
      authUser: {csActive: true, id: 'staff-1'},
      deviceIdentityStatus: 'missing',
      displayName: 'Staff',
      handleSignIn: jest.fn(),
      handleSignOut: jest.fn(),
      isSigningIn: false,
      setAuthEmail: jest.fn(),
      setAuthMessage: jest.fn(),
      setAuthPassword: jest.fn(),
      setAuthSource: jest.fn(),
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      reactToMessage: jest.fn(),
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendMessage: jest.fn(),
      setInboxLabels: jest.fn(),
      signalTyping: jest.fn(),
      sending: false,
      teamRoomMetadata: {
        bots: [],
        canManageAiRoomAccess: false,
        dara: null,
        daraReplyEnabled: true,
        members: [],
      },
      updatePresenceFromLive: jest.fn(),
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 0,
    });
    useLiveStreamMock.mockImplementation(() => undefined);
    useSoundSettingsMock.mockReturnValue({
      loading: false,
      webSetting: {
        notificationSound: 'media/audios/assigned.wav',
        unassignedNotificationSound: 'media/audios/unassigned.wav',
      },
    });
    pickNativeAssetFileMock.mockResolvedValue({cancelled: true});
    createTeamChatRoomMock.mockResolvedValue({
      _id: 'room-created',
      category: 'meeting',
      name: 'Room baru',
    });
    getUserPickerRowsMock.mockResolvedValue([]);
    openTeamChatDirectMock.mockResolvedValue({
      _id: 'room-direct',
      category: 'direct',
      directPeerName: 'Maya',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the inbox skeleton without loading chat data', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Chat',
        'Pesan masuk',
        'Analisa chat',
        '30 hari',
        'Total',
        '12',
        'Rating',
        '4.5',
        'Delay',
        '4m',
        'Telat',
        '1',
        'Pengaturan chat',
        'Label percakapan',
        'Template chat',
      ]),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining([
        'Inbox siap dipasang',
        'Read-only conversation unread sudah terhubung. Detail pesan dan aksi balas masuk di fase berikutnya.',
        '0 conversation terpantau',
      ]),
    );
    const skeletonText = renderText(renderer!);
    ['Store', 'Tokped', 'Shopee', 'Tiktok', 'Whatsapp', 'Instagram'].forEach(
      label => {
        expect(skeletonText).not.toContain(label);
      },
    );
    expect(getChatAnalyticsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(String),
        to: expect.any(String),
      }),
    );
  });

  it('renders a scrollable read-only team chat room list without loading message details', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          isGeneral: true,
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 4,
        },
        {
          _id: 'room-2',
          category: 'direct',
          directPeerName: 'CS Tokopedia',
          lastMessagePreview: 'Follow up buyer',
          unreadCount: 0,
        },
      ],
      totalUnread: 4,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Chat',
        'Team chat',
        'Operasional',
        'Barang siap dikirim',
        'General',
        'Room utama',
        'CS Tokopedia',
        'Follow up buyer',
      ]),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining([
        'Team chat siap dipasang',
        'Read-only room dan unread sudah terhubung. Stream realtime dan detail pesan masuk di fase berikutnya.',
        '2 room terpantau',
      ]),
    );
  });

  it('creates a minimal meeting or project team chat room from the rail', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    createTeamChatRoomMock.mockResolvedValue({
      _id: 'room-project',
      category: 'project',
      name: 'Launch Ops',
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh,
      rooms: [],
      totalUnread: 0,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const toggleButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Toggle form room team chat',
      );

    await ReactTestRenderer.act(async () => {
      toggleButton!.props.onPress();
    });

    const nameInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Nama room team chat');
    const descriptionInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node => node.props.accessibilityLabel === 'Deskripsi room team chat',
      );
    const projectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Pilih kategori room project',
      );

    await ReactTestRenderer.act(async () => {
      nameInput!.props.onChangeText('Launch Ops');
      descriptionInput!.props.onChangeText('Koordinasi launch');
      projectButton!.props.onPress();
    });

    const saveButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Simpan room team chat');

    await ReactTestRenderer.act(async () => {
      await saveButton!.props.onPress();
    });

    expect(createTeamChatRoomMock).toHaveBeenCalledWith({
      category: 'project',
      description: 'Koordinasi launch',
      name: 'Launch Ops',
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Room "Launch Ops" dibuat.']),
    );
  });

  it('opens DARA and staff direct team chat rooms from the rail', async () => {
    jest.useFakeTimers();
    const refresh = jest.fn().mockResolvedValue(undefined);
    getUserPickerRowsMock.mockResolvedValue([
      {_id: 'staff-1', first_name: 'Current', username: 'current'},
      {_id: 'staff-2', first_name: 'Maya', username: 'maya'},
    ]);
    openTeamChatDirectMock
      .mockResolvedValueOnce({
        _id: 'room-dara',
        category: 'direct',
        directPeerName: 'DARA',
        isDaraDirect: true,
      })
      .mockResolvedValueOnce({
        _id: 'room-staff',
        category: 'direct',
        directPeerName: 'Maya',
      });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh,
      rooms: [],
      totalUnread: 0,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const directToggle = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Toggle panel chat pribadi team chat',
      );

    await ReactTestRenderer.act(async () => {
      directToggle!.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(260);
      await Promise.resolve();
    });

    expect(getUserPickerRowsMock).toHaveBeenCalledWith('');

    const daraButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka chat pribadi DARA');

    await ReactTestRenderer.act(async () => {
      await daraButton!.props.onPress();
    });

    expect(openTeamChatDirectMock).toHaveBeenCalledWith({dara: true});
    expect(refresh).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      directToggle!.props.onPress();
    });

    const searchInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Cari staff chat pribadi');

    await ReactTestRenderer.act(async () => {
      searchInput!.props.onChangeText('maya');
    });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(260);
      await Promise.resolve();
    });

    expect(getUserPickerRowsMock).toHaveBeenLastCalledWith('maya');
    expect(renderText(renderer!)).toEqual(expect.arrayContaining(['Maya']));
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Current']),
    );

    const staffButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Buka chat pribadi Maya',
      );

    await ReactTestRenderer.act(async () => {
      await staffButton!.props.onPress();
    });

    expect(openTeamChatDirectMock).toHaveBeenLastCalledWith({
      userId: 'staff-2',
    });
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('renders a scrollable read-only inbox conversation list without loading message details', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          assignedStaffId: {
            _id: 'staff-2',
            first_name: 'Maya',
            last_name: 'Sari',
            profile_picture: '/uploads/staff/maya.jpg',
          },
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          labels: [
            {_id: 'card-label-1', color: '#6fbd82', name: 'Ada pembelian'},
            {_id: 'card-label-2', color: '#4f8cc9', name: 'Pelanggan'},
            {_id: 'card-label-3', color: '#d8a34f', name: 'Tindak lanjuti'},
          ],
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 2,
        },
        {
          _id: 'conv-2',
          platform: 'shopee',
          contactId: {displayName: 'Buyer Shopee'},
          lastMessageDirection: 'out',
          lastMessagePreview: 'Baik, kami cek stok dulu.',
          unreadCount: 0,
        },
        {
          _id: 'conv-3',
          isAiHandled: true,
          platform: 'tiktok',
          contactId: {displayName: 'Buyer TikTok'},
          lastMessagePreview: 'Masih ready?',
          unreadCount: 0,
        },
        {
          _id: 'conv-4',
          platform: 'whatsapp',
          contactId: {displayName: 'Buyer WhatsApp'},
          lastMessagePreview: 'Halo admin',
          unreadCount: 0,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 2,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Buyer Tokopedia',
        'Apakah masih tersedia?',
        'Open',
        'Ada pembelian',
        'Pelanggan',
        'Tindak lanjuti',
        'Buyer Shopee',
        'Anda: Baik, kami cek stok dulu.',
        'Buyer TikTok',
        'Masih ready?',
        'Buyer WhatsApp',
        'Halo admin',
      ]),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['2 conversation terpantau']),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Tokopedia', 'Shopee', 'Tiktok', 'Whatsapp']),
    );
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'Logo platform Tokopedia',
      ),
    ).not.toHaveLength(0);
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'Logo platform Shopee',
      ),
    ).not.toHaveLength(0);
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'Logo platform Tiktok',
      ),
    ).not.toHaveLength(0);
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'Logo platform Whatsapp',
      ),
    ).not.toHaveLength(0);
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'Staff menangani Maya Sari',
      ),
    ).not.toHaveLength(0);
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'DARA menangani chat',
      ),
    ).not.toHaveLength(0);

    const unreadRow = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');
    const unreadRowStyle = StyleSheet.flatten(unreadRow!.props.style);
    expect(unreadRowStyle.backgroundColor).toBe('rgba(254, 226, 226, 0.72)');
  });

  it('passes inbox filter parity params to the rail data hook', async () => {
    jest.useFakeTimers();
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          assignedStaffId: 'staff-1',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          platform: 'tokopedia',
          status: 'open',
          unreadCount: 2,
        },
        {
          _id: 'conv-2',
          assignedStaffId: null,
          contactId: {displayName: 'Buyer Shopee'},
          lastMessagePreview: 'Butuh dibantu',
          platform: 'shopee',
          status: 'open',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 3,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    expect(useReadonlyDataMock).toHaveBeenLastCalledWith({
      inboxParams: {
        limit: 100,
        page: 1,
      },
      mode: 'inbox',
    });
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Filter Unread'),
    ).toBe(false);

    const searchInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Cari conversation inbox');
    const tokopediaButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Filter Tokped');
    const statusDropdown = renderer!.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Filter status inbox' &&
          typeof node.props.onPress === 'function',
      )
      [0];
    const assignmentDropdown = renderer!.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Filter tugas inbox' &&
          typeof node.props.onPress === 'function',
      )
      [0];
    const labelDropdown = renderer!.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Filter label inbox' &&
          typeof node.props.onPress === 'function',
      )
      [0];

    await ReactTestRenderer.act(async () => {
      tokopediaButton!.props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      statusDropdown!.props.onPress();
    });
    const closedOption = renderer!.root
      .findAll(node => node.props.accessibilityLabel === 'Ditutup')
      [0];
    await ReactTestRenderer.act(async () => {
      closedOption!.props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      assignmentDropdown!.props.onPress();
    });
    const assignedOption = renderer!.root
      .findAll(node => node.props.accessibilityLabel === 'Ditugaskan')
      [0];
    await ReactTestRenderer.act(async () => {
      assignedOption!.props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      labelDropdown!.props.onPress();
    });
    const followUpOption = renderer!.root
      .findAll(node => node.props.accessibilityLabel === 'Follow up')
      [0];
    await ReactTestRenderer.act(async () => {
      followUpOption!.props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      searchInput!.props.onChangeText('buyer');
    });
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(260);
      await Promise.resolve();
    });

    expect(useReadonlyDataMock).toHaveBeenLastCalledWith({
      inboxParams: {
        labelId: 'label-2',
        limit: 100,
        page: 1,
        platform: 'tokopedia',
        search: 'buyer',
        status: 'closed',
      },
      mode: 'inbox',
    });
    expect(renderText(renderer!)).toEqual(expect.arrayContaining(['Buyer Tokopedia']));
    expect(renderText(renderer!)).not.toEqual(expect.arrayContaining(['Buyer Shopee']));
  });

  it('opens selected conversation details and sends a text message', async () => {
    const assignInboxToMe = jest.fn().mockResolvedValue(undefined);
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    const setInboxLabels = jest.fn().mockResolvedValue(undefined);
    const toggleInboxAiHandled = jest.fn().mockResolvedValue(undefined);
    const toggleInboxStatus = jest.fn().mockResolvedValue(undefined);
    const unassignInbox = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 2,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 2,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      assignInboxToMe,
      conversation: {
        _id: 'conv-1',
        assignedStaffId: {
          _id: 'staff-1',
          first_name: 'Staff',
        },
        isAiHandled: false,
        labelIds: ['label-1', 'label-2'],
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [
            {
              fileName: 'invoice.pdf',
              kind: 'file',
              mimeType: 'application/pdf',
              url: '/uploads/team-chat/invoice.pdf',
            },
          ],
          embeds: [],
          id: 'msg-1',
          author: 'Buyer',
          body: 'Apakah masih tersedia?',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      reactToMessage: jest.fn(),
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendMessage,
      setInboxLabels,
      signalTyping: jest.fn(),
      sending: false,
      toggleInboxAiHandled,
      toggleInboxStatus,
      unassignInbox,
      updatePresenceFromLive: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(
          node =>
            node.props.accessibilityLabel ===
            'Pilih conversation Buyer Tokopedia',
        ),
    ).toBe(false);
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Kembali',
        'Buyer',
        'Apakah masih tersedia?',
        'File',
        'invoice.pdf',
        'application/pdf',
        'Open',
        'Prioritas',
        'Follow up',
        'CS: Staff',
        'Resolve',
        'Unassign',
        'AI on',
      ]),
    );
    const messageScroll = renderer!.root
      .findAllByType(ScrollView)
      .find(
        node =>
          typeof node.props.onContentSizeChange === 'function' &&
          typeof node.props.onLayout === 'function',
      );
    expect(messageScroll).toBeTruthy();

    const statusButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Toggle inbox conversation status',
      );
    const unassignButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Unassign inbox conversation',
      );
    const aiButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Toggle inbox AI handled');

    await ReactTestRenderer.act(async () => {
      await statusButton!.props.onPress();
      await unassignButton!.props.onPress();
      await aiButton!.props.onPress();
    });

    expect(toggleInboxStatus).toHaveBeenCalledTimes(1);
    expect(assignInboxToMe).not.toHaveBeenCalled();
    expect(unassignInbox).toHaveBeenCalledTimes(1);
    expect(toggleInboxAiHandled).toHaveBeenCalledTimes(1);

    const backButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Kembali ke daftar inbox chat',
      );

    await ReactTestRenderer.act(async () => {
      backButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(
          node =>
            node.props.accessibilityLabel ===
            'Pilih conversation Buyer Tokopedia',
        ),
    ).toBe(true);

    const reopenedSelectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Pilih conversation Buyer Tokopedia',
      );

    await ReactTestRenderer.act(async () => {
      reopenedSelectButton!.props.onPress();
    });

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');
    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('Siap, masih tersedia.');
    });

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendMessage).toHaveBeenCalledWith('Siap, masih tersedia.');
  });

  it('blocks inbox send until the conversation is assigned to the current staff', async () => {
    const assignInboxToMe = jest.fn().mockResolvedValue(undefined);
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 2,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 2,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: null,
        isAiHandled: false,
        status: 'open',
      },
      assignInboxToMe,
      loading: false,
      messages: [],
      sendMessage,
      sending: false,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Assign saya',
        'Chat belum ditugaskan. Klik Assign saya di header inbox untuk mengambil chat sebagai CS, lalu balas pesan.',
      ]),
    );

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');
    expect(input!.props.editable).toBe(false);

    const assignButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Assign inbox conversation to me',
      );

    await ReactTestRenderer.act(async () => {
      assignButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Catatan handover', 'Assign']),
    );

    const handoverNoteInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Catatan handover inbox');

    await ReactTestRenderer.act(async () => {
      handoverNoteInput!.props.onChangeText('Buyer minta follow up stok sore ini.');
    });

    const submitHandoverButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Kirim catatan handover inbox',
      );

    await ReactTestRenderer.act(async () => {
      await submitHandoverButton!.props.onPress();
    });

    expect(assignInboxToMe).toHaveBeenCalledWith(
      'Buyer minta follow up stok sore ini.',
    );

    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('Siap, masih tersedia.');
    });

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    expect(sendButton!.props.disabled).toBe(true);

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('replies to a selected inbox message with reply metadata', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'store',
          contactId: {displayName: 'Buyer Store'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 1,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: {
          _id: 'staff-1',
          first_name: 'Staff',
        },
        isAiHandled: false,
        platform: 'store',
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          embeds: [],
          id: 'msg-1',
          author: 'Buyer',
          body: 'Apakah masih tersedia?',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      sendMessage,
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Store');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const replyButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Balas pesan Buyer');

    await ReactTestRenderer.act(async () => {
      replyButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'Membalas pesan Buyer'),
    ).toBe(true);
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Buyer', 'Apakah masih tersedia?']),
    );

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');

    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('Saya balas pesan ini.');
    });

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendMessage).toHaveBeenCalledWith('Saya balas pesan ini.', {
      replyToMessageId: 'msg-1',
    });
  });

  it('hides inbox reply action for marketplace conversations', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 1,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: null,
        isAiHandled: false,
        platform: 'tokopedia',
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          embeds: [],
          id: 'msg-1',
          author: 'Buyer',
          body: 'Apakah masih tersedia?',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Balas pesan Buyer'),
    ).toBe(false);
  });

  it('edits only current staff outgoing inbox text messages', async () => {
    const editMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'store',
          contactId: {displayName: 'Buyer Store'},
          lastMessagePreview: 'Draft lama',
          unreadCount: 0,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: {
          _id: 'staff-1',
          first_name: 'Staff',
        },
        isAiHandled: false,
        platform: 'store',
        status: 'open',
      },
      editMessage,
      loading: false,
      messages: [
        {
          attachments: [],
          content: {type: 'text', text: 'Draft lama'},
          editedAt: '2026-07-28T08:05:00.000Z',
          editedByName: 'Staff',
          embeds: [],
          id: 'msg-own',
          author: 'Staff',
          body: 'Draft lama',
          linkPreviews: [],
          mine: true,
          reactions: [],
          senderId: 'staff-1',
          sentAt: '2026-07-28T08:00:00.000Z',
        },
        {
          attachments: [],
          content: {type: 'text', text: 'Pesan Buyer'},
          embeds: [],
          id: 'msg-buyer',
          author: 'Buyer',
          body: 'Pesan Buyer',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-28T08:01:00.000Z',
        },
      ],
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Store');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(
      renderText(renderer!).some(text => text.includes('Diedit oleh Staff')),
    ).toBe(true);
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Edit pesan Buyer'),
    ).toBe(false);

    const editButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Edit pesan Staff');

    await ReactTestRenderer.act(async () => {
      editButton!.props.onPress();
    });

    const editInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Edit pesan Staff');

    await ReactTestRenderer.act(async () => {
      editInput!.props.onChangeText('Draft baru inbox');
    });

    const saveButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Simpan edit pesan chat');

    await ReactTestRenderer.act(async () => {
      await saveButton!.props.onPress();
    });

    expect(editMessage).toHaveBeenCalledWith('msg-own', 'Draft baru inbox');
  });

  it('renders rich inbox message content from live plugin payloads', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-rich',
          assignedStaffId: null,
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Kirim katalog',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 1,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-rich',
        assignedStaffId: null,
        isAiHandled: true,
        labelIds: [],
        platform: 'tokopedia',
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          content: {
            text: 'https://www.youtube.com/watch?v=abc123XYZ',
            type: 'youtube',
            youtube: {
              title: 'Panduan acclimation',
              url: 'https://www.youtube.com/watch?v=abc123XYZ',
              videoId: 'abc123XYZ',
            },
          },
          embeds: [],
          id: 'msg-youtube',
          author: 'Buyer',
          body: 'https://www.youtube.com/watch?v=abc123XYZ',
          linkPreviews: [],
          mine: false,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-07-28T08:00:00.000Z',
        },
        {
          attachments: [],
          content: {
            card: {
              detailHref: 'https://store.example.test/species/anemon',
              entityType: 'species',
              imageUrl: '/uploads/species/anemon.jpg',
              name: 'Bubble Tip Anemone',
              price: 175000,
              stock: 8,
            },
            type: 'species_card',
          },
          embeds: [],
          id: 'msg-card',
          author: 'Anda',
          body: 'Bubble Tip Anemone',
          linkPreviews: [],
          mine: true,
          reactions: [],
          replyContent: {
            senderName: 'Buyer',
            text: 'Ada warna merah?',
            type: 'text',
          },
          replyPreview: null,
          sentAt: '2026-07-28T08:05:00.000Z',
          editedAt: '2026-07-28T08:06:00.000Z',
          editedByName: 'Maya',
          status: 'sent',
        },
        {
          attachments: [],
          content: {
            fileName: 'proof.jpg',
            imageUrl: '/uploads/chat/proof.jpg',
            type: 'image',
          },
          daraMeta: {
            kind: 'vision',
            matchStatus: 'ambiguous',
            suggestedDisplayName: 'Bukti transfer BCA',
          },
          embeds: [],
          id: 'msg-image',
          author: 'DARA',
          body: 'proof.jpg',
          linkPreviews: [],
          mine: false,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-07-28T08:10:00.000Z',
        },
      ],
      sending: false,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const conversationButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Pilih conversation Buyer Tokopedia',
      );

    await ReactTestRenderer.act(async () => {
      conversationButton!.props.onPress();
    });

    const textNodes = renderText(renderer!);
    const normalizedText = textNodes.join(' ').replace(/\s+/g, ' ');

    expect(textNodes).toEqual(
      expect.arrayContaining([
        'YouTube',
        'Panduan acclimation',
        'Livestock',
        'Bubble Tip Anemone',
        'Stok: ',
        '8',
        'Buyer',
        'Ada warna merah?',
        'DARA vision',
        'Match: ambiguous | Bukti transfer BCA',
      ]),
    );
    expect(normalizedText).toContain('Rp 175.000');
    expect(normalizedText).toContain('Diedit oleh Maya');

    const youtubeButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka YouTube inbox');
    const cardButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Buka card Bubble Tip Anemone',
      );
    const imageButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Buka gambar inbox proof.jpg',
      );

    await ReactTestRenderer.act(async () => {
      youtubeButton!.props.onPress();
      cardButton!.props.onPress();
      imageButton!.props.onPress();
    });

    expect(openUrlMock).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=abc123XYZ',
    );
    expect(openUrlMock).toHaveBeenCalledWith(
      'https://store.example.test/species/anemon',
    );
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Preview proof.jpg', 'Tutup']),
    );

    const closeLightbox = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Tutup gambar inbox');

    await ReactTestRenderer.act(async () => {
      closeLightbox!.props.onPress();
    });

    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Preview proof.jpg']),
    );
  });

  it('toggles inbox labels from the selected conversation action strip', async () => {
    const setInboxLabels = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 1,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: null,
        isAiHandled: false,
        labelIds: ['label-1'],
        status: 'open',
      },
      loading: false,
      messages: [],
      setInboxLabels,
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const labelButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Toggle inbox label picker');

    await ReactTestRenderer.act(async () => {
      labelButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Label percakapan',
        'Prioritas',
        'Follow up',
        'On',
        'Off',
      ]),
    );

    const followUpLabel = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Toggle label Follow up');

    await ReactTestRenderer.act(async () => {
      followUpLabel!.props.onPress();
    });

    expect(setInboxLabels).toHaveBeenCalledWith(['label-1', 'label-2']);
  });

  it('opens inbox templates and injects the selected body into the composer', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 1,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: {
          _id: 'staff-1',
          first_name: 'Staff',
        },
        isAiHandled: false,
        status: 'open',
      },
      loading: false,
      messages: [],
      sendMessage,
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const templateButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka template chat');

    await ReactTestRenderer.act(async () => {
      templateButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Templates',
        'Pilih template untuk mengisi composer',
        'Stok tersedia',
        'Halo, stok masih tersedia.',
        'general',
        'Cek invoice',
      ]),
    );
    expect(getChatTemplatesMock).toHaveBeenCalledTimes(1);

    const templateRow = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih template Stok tersedia');

    await ReactTestRenderer.act(async () => {
      templateRow!.props.onPress();
    });

    const composerInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');

    expect(composerInput!.props.value).toBe('Halo, stok masih tersedia.');
  });

  it('opens inbox contact details with customer activity and recent orders', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 1,
        },
      ],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 1,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-1',
        assignedStaffId: null,
        contactId: {
          _id: 'contact-1',
          displayName: 'Buyer Tokopedia',
          platform: 'tokopedia',
        },
        isAiHandled: false,
        platform: 'tokopedia',
        status: 'open',
      },
      loading: false,
      messages: [],
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const detailsButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Toggle inbox contact details');

    await ReactTestRenderer.act(async () => {
      detailsButton!.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getChatContactDetailsMock).toHaveBeenCalledWith('conv-1', {
      ordersLimit: 5,
    });
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Buyer Tokopedia',
        'Tokopedia',
        'CONTACT',
        'Phone',
        '08123456789',
        'Email',
        'buyer@example.com',
        'ACTIVITY',
        'Total orders',
        '4',
        'Total spend',
        expect.stringContaining('1.250.000'),
        'ORDER HISTORY (7)',
        'INV-001',
        expect.stringContaining('250.000'),
        'Paid',
      ]),
    );
  });

  it('renders and toggles team chat reactions from message bubbles', async () => {
    const reactToMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [
        {
          attachments: [],
          embeds: [
            {
              refId: 'inv-001',
              subtitle: 'Buyer Tokopedia',
              title: 'INV-001',
              type: 'invoice',
              url: '/invoices/inv-001',
            },
          ],
          id: 'team-msg-1',
          author: 'Staff',
          body: 'Barang siap dikirim @dara cc @maya',
          linkPreviews: [
            {
              description: 'Preview stok operasional harian',
              image: '/media/stock-preview.jpg',
              siteName: 'Kolam Ops',
              title: 'Dashboard stok',
              url: 'https://kolam.local/stok',
            },
          ],
          mine: true,
          reactions: [{count: 2, emoji: '👍', mine: true}],
          replyPreview: {
            _id: 'team-msg-parent',
            body: 'Siap dicek dari gudang.',
            senderName: 'Maya',
          },
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      presence: {onlineCount: 3, typingUserIds: ['staff-2'], viewingCount: 2},
      reactToMessage,
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      sending: false,
      updatePresenceFromLive: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        '3 online · 2 melihat · 1 mengetik...',
        'Staff',
        'Maya',
        'Siap dicek dari gudang.',
        'Barang siap dikirim ',
        '@dara',
        ' cc ',
        '@maya',
        'Kolam Ops',
        'Dashboard stok',
        'Preview stok operasional harian',
        'https://kolam.local/stok',
        'Invoice',
        'INV-001',
        'Buyer Tokopedia',
        '/invoices/inv-001',
        '👍',
        '2',
      ]),
    );
    expect(
      renderer!.root
        .findAllByType(Text)
        .some(node => node.props.accessibilityLabel === 'Mention DARA'),
    ).toBe(true);
    expect(
      renderer!.root
        .findAllByType(Text)
        .some(node => node.props.accessibilityLabel === 'Mention maya'),
    ).toBe(true);
    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'Reply preview Maya'),
    ).toBe(true);

    const reactionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Reaksi 🙏');

    await ReactTestRenderer.act(async () => {
      reactionButton!.props.onPress();
    });

    expect(reactToMessage).toHaveBeenCalledWith('team-msg-1', '🙏');
  });

  it('signals typing for team chat composer changes and accepts live presence updates', async () => {
    const signalTyping = jest.fn();
    const updatePresenceFromLive = jest.fn();
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
      reactToMessage: jest.fn(),
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendMessage: jest.fn(),
      signalTyping,
      sending: false,
      updatePresenceFromLive,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');
    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('Halo tim');
    });

    expect(signalTyping).toHaveBeenCalledWith(true);

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'presence.updated',
          legacySources: [],
          note: '',
          refreshTargets: ['team-room-presence'],
          route: '/team-chat/stream',
          soundIntent: 'none',
          stream: 'team-chat',
        },
        payload: {
          presence: {onlineCount: 4, typingUserIds: ['staff-2'], viewingCount: 2},
          roomId: 'room-1',
        },
      });
    });

    expect(updatePresenceFromLive).toHaveBeenCalledWith({
      onlineCount: 4,
      typingUserIds: ['staff-2'],
      viewingCount: 2,
    });
  });

  it('opens a team mention picker from room metadata and inserts the selected username', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      teamRoomMetadata: {
        bots: [
          {
            botKey: 'katak_terbang',
            displayName: 'Katak Terbang',
            isAi: true,
            isBot: true,
            online: true,
            profile_picture: null,
            username: 'katak_terbang',
          },
        ],
        canManageAiRoomAccess: false,
        dara: {
          displayName: 'DARA',
          id: 'dara',
          isAi: true,
          online: true,
          profile_picture: null,
          username: 'dara',
        },
        daraReplyEnabled: true,
        members: [
          {_id: 'staff-2', first_name: 'Maya', username: 'maya'},
          {_id: 'staff-3', first_name: 'Rio', username: 'rio'},
        ],
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');
    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('Halo @');
    });

    expect(input!.props.value).toBe('Halo @');

    const mayaMention = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih mention maya');

    await ReactTestRenderer.act(async () => {
      mayaMention!.props.onPress();
    });

    const composerInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');
    expect(composerInput!.props.value).toBe('Halo @maya ');
  });

  it('shows a DARA thinking bubble after sending a team message that mentions DARA', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
      sendMessage,
      signalTyping: jest.fn(),
      teamRoomMetadata: {
        bots: [],
        canManageAiRoomAccess: false,
        dara: {
          displayName: 'DARA',
          id: 'dara',
          isAi: true,
          online: true,
          profile_picture: null,
          username: 'dara',
        },
        daraReplyEnabled: true,
        members: [],
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');
    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('@dara cek stok');
    });

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendMessage).toHaveBeenCalledWith('@dara cek stok');
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['DARA', 'DARA sedang berpikir...']),
    );
    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'DARA thinking bubble'),
    ).toBe(true);
  });

  it('selects a team chat message as reply target and sends replyToMessageId', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [
        {
          attachments: [],
          embeds: [],
          id: 'team-msg-1',
          author: 'Maya',
          body: 'Siap dicek dari gudang.',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
      sendMessage,
      signalTyping: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const replyButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Balas pesan Maya');

    await ReactTestRenderer.act(async () => {
      replyButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'Membalas pesan Maya'),
    ).toBe(true);
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Siap dicek dari gudang.']),
    );

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');
    await ReactTestRenderer.act(async () => {
      input!.props.onChangeText('Baik, saya lanjutkan.');
    });

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendMessage).toHaveBeenCalledWith('Baik, saya lanjutkan.', {
      replyToMessageId: 'team-msg-1',
    });
    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'Membalas pesan Maya'),
    ).toBe(false);
  });

  it('edits only current user team chat messages inline', async () => {
    const editMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      editMessage,
      loading: false,
      messages: [
        {
          attachments: [],
          editedAt: '2026-07-28T08:05:00.000Z',
          editedByName: 'Staff',
          embeds: [],
          id: 'team-msg-own',
          author: 'Staff',
          body: 'Draft lama',
          linkPreviews: [],
          mine: true,
          reactions: [],
          senderId: 'staff-1',
          sentAt: '2026-07-28T08:00:00.000Z',
        },
        {
          attachments: [],
          embeds: [],
          id: 'team-msg-other',
          author: 'Maya',
          body: 'Pesan Maya',
          linkPreviews: [],
          mine: false,
          reactions: [],
          senderId: 'staff-2',
          sentAt: '2026-07-28T08:01:00.000Z',
        },
      ],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(
      renderText(renderer!).some(text => text.includes('Diedit oleh Staff')),
    ).toBe(true);
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Edit pesan Maya'),
    ).toBe(false);

    const editButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Edit pesan Staff');

    await ReactTestRenderer.act(async () => {
      editButton!.props.onPress();
    });

    const editInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Edit pesan Staff');

    await ReactTestRenderer.act(async () => {
      editInput!.props.onChangeText('Draft baru');
    });

    const saveButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Simpan edit pesan chat',
      );

    await ReactTestRenderer.act(async () => {
      await saveButton!.props.onPress();
    });

    expect(editMessage).toHaveBeenCalledWith('team-msg-own', 'Draft baru');
  });

  it('searches team chat messages and can reset the temporary results', async () => {
    const searchTeamMessages = jest.fn().mockResolvedValue(undefined);
    const clearTeamMessageSearch = jest.fn();
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      clearTeamMessageSearch,
      loading: false,
      messageSearchQuery: 'gudang',
      messageSearchResults: [
        {
          attachments: [],
          embeds: [],
          id: 'team-msg-hit',
          author: 'Maya',
          body: 'Gudang sudah cek stok.',
          linkPreviews: [],
          mine: false,
          reactions: [],
          senderId: 'staff-2',
          sentAt: '2026-07-28T08:03:00.000Z',
        },
      ],
      messages: [
        {
          attachments: [],
          embeds: [],
          id: 'team-msg-normal',
          author: 'Staff',
          body: 'Pesan normal di room.',
          linkPreviews: [],
          mine: true,
          reactions: [],
          senderId: 'staff-1',
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
      searchTeamMessages,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        '1 hasil untuk "gudang"',
        'Gudang sudah cek stok.',
      ]),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Pesan normal di room.']),
    );

    const searchInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Cari pesan team chat');

    await ReactTestRenderer.act(async () => {
      searchInput!.props.onChangeText('invoice');
    });

    const searchButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Jalankan pencarian pesan team chat',
      );

    await ReactTestRenderer.act(async () => {
      await searchButton!.props.onPress();
    });

    expect(searchTeamMessages).toHaveBeenCalledWith('invoice');

    const resetButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Bersihkan pencarian pesan team chat',
      );

    await ReactTestRenderer.act(async () => {
      resetButton!.props.onPress();
    });

    expect(clearTeamMessageSearch).toHaveBeenCalledTimes(1);
  });

  it('updates and clears the DARA thinking bubble from team chat live events', async () => {
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      teamRoomMetadata: {
        bots: [],
        canManageAiRoomAccess: false,
        dara: {
          displayName: 'DARA',
          id: 'dara',
          isAi: true,
          online: true,
          profile_picture: null,
          username: 'dara',
        },
        daraReplyEnabled: true,
        members: [],
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'dara.thinking.chunk',
          legacySources: [],
          note: '',
          refreshTargets: ['team-room-detail'],
          route: '/team-chat/stream',
          soundIntent: 'none',
          stream: 'team-chat',
        },
        payload: {
          roomId: 'room-1',
          text: 'Membaca konteks stok',
        },
      });
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['DARA', 'Membaca konteks stok']),
    );
    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'DARA thinking bubble'),
    ).toBe(true);

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'dara.thinking.chunk',
          legacySources: [],
          note: '',
          refreshTargets: ['team-room-detail'],
          route: '/team-chat/stream',
          soundIntent: 'none',
          stream: 'team-chat',
        },
        payload: {
          reasoningLine: 'Menyiapkan jawaban stok',
          roomId: 'room-1',
        },
      });
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Menyiapkan jawaban stok']),
    );

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'dara.thinking.done',
          legacySources: [],
          note: '',
          refreshTargets: ['team-room-detail'],
          route: '/team-chat/stream',
          soundIntent: 'none',
          stream: 'team-chat',
        },
        payload: {
          roomId: 'room-1',
        },
      });
    });

    expect(
      renderer!.root
        .findAllByType(View)
        .some(node => node.props.accessibilityLabel === 'DARA thinking bubble'),
    ).toBe(false);
  });

  it('renders minimal team chat call actions and refreshes call state from live events', async () => {
    const startCall = jest.fn().mockResolvedValue(undefined);
    const joinCall = jest.fn().mockResolvedValue(undefined);
    const endCall = jest.fn().mockResolvedValue(undefined);
    const handoverCall = jest.fn().mockResolvedValue(undefined);
    const muteCallParticipant = jest.fn().mockResolvedValue(undefined);
    const redialCall = jest.fn().mockResolvedValue(undefined);
    const refreshCall = jest.fn().mockResolvedValue(undefined);
    const toggleCallHand = jest.fn().mockResolvedValue(undefined);
    const unmuteCallParticipant = jest.fn().mockResolvedValue(undefined);
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      activeCall: {
        _id: 'call-1',
        participantCount: 3,
        participants: [
          {
            handRaised: false,
            muted: false,
            status: 'joined',
            user: 'staff-1',
          },
          {
            muted: false,
            status: 'joined',
            user: {
              _id: 'staff-2',
              first_name: 'Maya',
            },
          },
          {
            muted: true,
            status: 'joined',
            user: {
              _id: 'staff-3',
              first_name: 'Bima',
            },
          },
          {
            muted: false,
            status: 'declined',
            user: 'staff-4',
          },
        ],
        status: 'active',
      },
      callConfig: {enabled: true},
      endCall,
      handoverCall,
      joinCall,
      loading: false,
      messages: [],
      muteCallParticipant,
      redialCall,
      refreshCall,
      startCall,
      toggleCallHand,
      unmuteCallParticipant,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Call aktif',
        '3 peserta',
        'Join',
        'End',
        'Raise',
        'Handover',
        'Maya',
        'Mute',
        'Bima',
        'Unmute',
      ]),
    );

    const joinButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Join team chat call');
    const endButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'End team chat call');
    const handButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Toggle team chat call hand');
    const redialButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Redial team chat call');
    const handoverButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Handover team chat call');
    const muteButtons = renderer!.root
      .findAllByType(KolamPressable)
      .filter(node => node.props.accessibilityLabel === 'Mute team chat participant');
    const unmuteButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Unmute team chat participant');

    await ReactTestRenderer.act(async () => {
      await joinButton!.props.onPress();
      await endButton!.props.onPress();
      await handButton!.props.onPress();
      await redialButton!.props.onPress();
      await handoverButton!.props.onPress();
      await muteButtons[0]!.props.onPress();
      await unmuteButton!.props.onPress();
    });

    expect(joinCall).toHaveBeenCalledTimes(1);
    expect(endCall).toHaveBeenCalledTimes(1);
    expect(toggleCallHand).toHaveBeenCalledTimes(1);
    expect(redialCall).toHaveBeenCalledTimes(1);
    expect(handoverCall).toHaveBeenCalledTimes(1);
    expect(muteCallParticipant).toHaveBeenCalledWith('staff-2');
    expect(unmuteCallParticipant).toHaveBeenCalledWith('staff-3');

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'call.updated',
          legacySources: [],
          note: '',
          refreshTargets: ['call-state'],
          route: '/team-chat/stream',
          soundIntent: 'none',
          stream: 'team-chat',
        },
        payload: {callId: 'call-1', roomId: 'room-1'},
      });
    });

    expect(refreshCall).toHaveBeenCalledTimes(1);

    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      callConfig: {enabled: true},
      loading: false,
      messages: [],
      startCall,
    });

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const startButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Start team chat call');

    await ReactTestRenderer.act(async () => {
      await startButton!.props.onPress();
    });

    expect(startCall).toHaveBeenCalledTimes(1);
  });

  it('picks and sends a team chat attachment from the composer', async () => {
    const sendAttachment = jest.fn().mockResolvedValue(undefined);
    pickNativeAssetFileMock.mockResolvedValue({
      cancelled: false,
      mimeType: 'application/pdf',
      name: 'invoice.pdf',
      path: 'C:\\docs\\invoice.pdf',
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      reactToMessage: jest.fn(),
      refresh: jest.fn(),
      sendAttachment,
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      sending: false,
      updatePresenceFromLive: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const attachButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Lampirkan file team chat');

    await ReactTestRenderer.act(async () => {
      await attachButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(expect.arrayContaining(['invoice.pdf']));

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendAttachment).toHaveBeenCalledWith(
      expect.objectContaining({name: 'invoice.pdf'}),
      '',
    );
  });

  it('refreshes list and active detail from live events without playing sound', async () => {
    jest.useFakeTimers();
    const refreshList = jest.fn().mockResolvedValue(undefined);
    const refreshDetail = jest.fn().mockResolvedValue(undefined);
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
          unreadCount: 2,
        },
      ],
      loading: false,
      refresh: refreshList,
      rooms: [],
      totalUnread: 2,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      loading: false,
      messages: [],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      reactToMessage: jest.fn(),
      refresh: refreshDetail,
      sendAttachment: jest.fn(),
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      sending: false,
      updatePresenceFromLive: jest.fn(),
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'message.created',
          legacySources: [],
          note: '',
          refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
          route: '/chat/stream',
          soundIntent: 'incoming-assigned-or-unassigned',
          stream: 'inbox',
        },
        payload: {conversationId: 'conv-1'},
      });
    });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(250);
    });

    expect(refreshList).toHaveBeenCalledTimes(1);
    expect(refreshDetail).toHaveBeenCalledTimes(1);
    expect(mockSoundPlay).toHaveBeenCalledWith({
      intent: 'none',
      webSetting: {
        notificationSound: 'media/audios/assigned.wav',
        unassignedNotificationSound: 'media/audios/unassigned.wav',
      },
    });
    jest.useRealTimers();
  });

  it('plays configured headless sound for assigned inbound live messages', async () => {
    jest.useFakeTimers();
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'message.created',
          legacySources: [],
          note: '',
          refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
          route: '/chat/stream',
          soundIntent: 'incoming-assigned-or-unassigned',
          stream: 'inbox',
        },
        payload: {
          assignedStaffId: 'staff-1',
          conversationId: 'conv-2',
          message: {direction: 'in'},
        },
      });
    });

    expect(mockSoundPlay).toHaveBeenCalledWith({
      intent: 'assigned',
      webSetting: {
        notificationSound: 'media/audios/assigned.wav',
        unassignedNotificationSound: 'media/audios/unassigned.wav',
      },
    });
  });

  it('suppresses headless sound for inbox messages assigned to another staff', async () => {
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'message.created',
          legacySources: [],
          note: '',
          refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
          route: '/chat/stream',
          soundIntent: 'incoming-assigned-or-unassigned',
          stream: 'inbox',
        },
        payload: {
          assignedStaffId: 'staff-2',
          conversationId: 'conv-3',
          message: {direction: 'in'},
        },
      });
    });

    expect(mockSoundPlay).toHaveBeenCalledWith({
      intent: 'none',
      webSetting: {
        notificationSound: 'media/audios/assigned.wav',
        unassignedNotificationSound: 'media/audios/unassigned.wav',
      },
    });
  });
});
