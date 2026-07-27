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

describe('KolamGlobalChatRail', () => {
  beforeEach(() => {
    mockSoundPlay.mockClear();
    createSoundServiceMock.mockClear();
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
      loading: false,
      messages: [],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      reactToMessage: jest.fn(),
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      sending: false,
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
      ]),
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

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Buyer',
        'Apakah masih tersedia?',
        'File',
        'invoice.pdf',
        'application/pdf',
      ]),
    );

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
