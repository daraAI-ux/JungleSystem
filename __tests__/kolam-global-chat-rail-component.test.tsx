import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamGlobalChatRail} from '../src/components/kolam-global-chat-rail';
import {KolamPressable} from '../src/components/kolam-pressable';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {useKolamChatLiveStream} from '../src/hooks/use-kolam-chat-live-stream';
import {useKolamChatRailDetail} from '../src/hooks/use-kolam-chat-rail-detail';
import {useKolamChatRailReadonlyData} from '../src/hooks/use-kolam-chat-rail-readonly-data';
import {useKolamNotificationSoundSettings} from '../src/hooks/use-kolam-notification-sound-settings';
import {
  getKolamChatAnalytics,
  getKolamChatContactDetails,
  getKolamChatLabels,
  getKolamChatTemplates,
} from '../src/services/kolam-api';
import {createKolamNotificationSoundService} from '../src/services/kolam-notification-sound-service';
import {pickNativeAssetFile} from '../src/services/native-file-picker';

const mockSoundPlay = jest.fn();

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
    getKolamChatAnalytics: jest.fn(),
    getKolamChatContactDetails: jest.fn(),
    getKolamChatLabels: jest.fn(),
    getKolamChatTemplates: jest.fn(),
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
    endCall: jest.fn(),
    handoverCall: jest.fn(),
    joinCall: jest.fn(),
    loading: false,
    messages: [],
    muteCallParticipant: jest.fn(),
    presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
    reactToMessage: jest.fn(),
    redialCall: jest.fn(),
    refresh: jest.fn(),
    refreshCall: jest.fn(),
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
      authUser: {id: 'staff-1'},
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
        'Inbox siap dipasang',
        'Read-only conversation unread sudah terhubung. Detail pesan dan aksi balas masuk di fase berikutnya.',
        '0',
        '0 conversation terpantau',
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
        'Team chat siap dipasang',
        'Read-only room dan unread sudah terhubung. Stream realtime dan detail pesan masuk di fase berikutnya.',
        '4',
        '2 room terpantau',
        'Operasional',
        'Barang siap dikirim',
        'General',
        'Room utama',
        'CS Tokopedia',
        'Follow up buyer',
      ]),
    );
  });

  it('renders a scrollable read-only inbox conversation list without loading message details', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
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
        '2',
        '2 conversation terpantau',
        'Buyer Tokopedia',
        'Apakah masih tersedia?',
        'Tokopedia',
        'Open',
        'Buyer Shopee',
        'Anda: Baik, kami cek stok dulu.',
        'Shopee',
      ]),
    );
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
          _id: 'staff-2',
          first_name: 'Maya',
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
          id: 'msg-1',
          author: 'Buyer',
          body: 'Apakah masih tersedia?',
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

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Buyer',
        'Apakah masih tersedia?',
        'File',
        'invoice.pdf',
        'application/pdf',
        'Open',
        'Prioritas',
        'Follow up',
        'CS: Maya',
        'Resolve',
        'Assign saya',
        'Unassign',
        'AI on',
      ]),
    );

    const statusButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Toggle inbox conversation status',
      );
    const assignButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Assign inbox conversation to me',
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
      await assignButton!.props.onPress();
      await unassignButton!.props.onPress();
      await aiButton!.props.onPress();
    });

    expect(toggleInboxStatus).toHaveBeenCalledTimes(1);
    expect(assignInboxToMe).toHaveBeenCalledTimes(1);
    expect(unassignInbox).toHaveBeenCalledTimes(1);
    expect(toggleInboxAiHandled).toHaveBeenCalledTimes(1);

    const input = renderer!.root.findByType(TextInput);
    await ReactTestRenderer.act(async () => {
      input.props.onChangeText('Siap, masih tersedia.');
    });

    const sendButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Kirim pesan');

    await ReactTestRenderer.act(async () => {
      await sendButton!.props.onPress();
    });

    expect(sendMessage).toHaveBeenCalledWith('Siap, masih tersedia.');
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
        assignedStaffId: null,
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
          id: 'team-msg-1',
          author: 'Staff',
          body: 'Barang siap dikirim',
          mine: true,
          reactions: [{count: 2, emoji: '👍', mine: true}],
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
        'Barang siap dikirim',
        '👍',
        '2',
      ]),
    );

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

    const input = renderer!.root.findByType(TextInput);
    await ReactTestRenderer.act(async () => {
      input.props.onChangeText('Halo tim');
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

    const input = renderer!.root.findByType(TextInput);
    await ReactTestRenderer.act(async () => {
      input.props.onChangeText('Halo @');
    });

    expect(renderer!.root.findByType(TextInput).props.value).toBe('Halo @');

    const mayaMention = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih mention maya');

    await ReactTestRenderer.act(async () => {
      mayaMention!.props.onPress();
    });

    const composerInput = renderer!.root.findByType(TextInput);
    expect(composerInput.props.value).toBe('Halo @maya ');
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
