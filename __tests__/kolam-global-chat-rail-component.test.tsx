import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamBadge} from '../src/components/kolam-badge';
import {KolamButton} from '../src/components/kolam-button';
import {KolamGlobalChatRail} from '../src/components/kolam-global-chat-rail';
import {KolamPressable} from '../src/components/kolam-pressable';
import {
  useKolamAuthContext,
  useKolamNavigationContext,
} from '../src/context/kolam-app-contexts';
import {useKolamChatLiveStream} from '../src/hooks/use-kolam-chat-live-stream';
import {useKolamChatRailDetail} from '../src/hooks/use-kolam-chat-rail-detail';
import {useKolamChatRailReadonlyData} from '../src/hooks/use-kolam-chat-rail-readonly-data';
import {useKolamNotificationSoundSettings} from '../src/hooks/use-kolam-notification-sound-settings';
import {
  createKolamChatLabel,
  createKolamTeamChatRoom,
  deleteKolamChatLabel,
  deleteKolamTeamChatRoom,
  getKolamChatAnalytics,
  getKolamChatContactDetails,
  getKolamChatLabels,
  getKolamChatTemplates,
  getKolamWebSetting,
  getKolamUserPickerRows,
  openKolamTeamChatDirect,
  searchKolamChatMarketplaceListings,
  updateKolamChatLabel,
} from '../src/services/kolam-api';
import {
  getKolamProductDetail,
  getKolamProducts,
} from '../src/services/kolam-product-api';
import {
  getKolamSpecies,
  getKolamSpeciesList,
} from '../src/services/kolam-species-api';
import {createKolamNotificationSoundService} from '../src/services/kolam-notification-sound-service';
import {
  pickNativeAssetFile,
  pickNativeImageFile,
} from '../src/services/native-file-picker';
import {fetchKolamShippingDeliveryStats} from '../src/services/kolam-dara-shipping-copilot-api';
import {copyTextToClipboard} from '../src/lib/native-clipboard';

const mockSoundPlay = jest.fn();
const openUrlMock = jest
  .spyOn(Linking, 'openURL')
  .mockResolvedValue(undefined);
const copyTextToClipboardMock = jest.mocked(copyTextToClipboard);

jest.mock('react-native-webview', () => {
  const mockReact = require('react');
  const {View: MockView} = require('react-native');

  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      mockReact.createElement(MockView, props),
  };
});

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
  useKolamNavigationContext: jest.fn(),
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

jest.mock('../src/hooks/use-kolam-chat-platform-health', () => ({
  useKolamChatPlatformHealth: jest.fn(() => ({
    healthByPlatform: {},
    loading: false,
    platforms: [],
    refresh: jest.fn(),
  })),
}));

jest.mock('../src/hooks/use-kolam-notification-sound-settings', () => ({
  useKolamNotificationSoundSettings: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-shipping-copilot-api', () => ({
  fetchKolamShippingDeliveryStats: jest.fn(),
}));

jest.mock('../src/services/kolam-api', () => {
  const actual = jest.requireActual('../src/services/kolam-api');
  return {
    ...actual,
    createKolamChatLabel: jest.fn(),
    createKolamTeamChatRoom: jest.fn(),
    deleteKolamChatLabel: jest.fn(),
    deleteKolamTeamChatRoom: jest.fn(),
    getKolamChatAnalytics: jest.fn(),
    getKolamChatContactDetails: jest.fn(),
    getKolamChatLabels: jest.fn(),
    getKolamChatTemplates: jest.fn(),
    getKolamWebSetting: jest.fn(),
    getKolamUserPickerRows: jest.fn(),
    openKolamTeamChatDirect: jest.fn(),
    searchKolamChatMarketplaceListings: jest.fn(),
    updateKolamChatLabel: jest.fn(),
  };
});

jest.mock('../src/services/kolam-product-api', () => ({
  getKolamProducts: jest.fn(),
  getKolamProductDetail: jest.fn(),
}));

jest.mock('../src/services/kolam-species-api', () => ({
  getKolamSpeciesList: jest.fn(),
  getKolamSpecies: jest.fn(),
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

jest.mock('../src/components/kolam-remote-image', () => {
  const ReactForMock = require('react');
  const {Text: TextForMock} = require('react-native');
  return {
    KolamRemoteImage: (props: {accessibilityLabel: string}) =>
      ReactForMock.createElement(
        TextForMock,
        props,
        props.accessibilityLabel,
      ),
  };
});

jest.mock('../src/services/native-file-picker', () => ({
  pickNativeAssetFile: jest.fn(),
  pickNativeImageFile: jest.fn(),
}));

jest.mock('../src/lib/native-clipboard', () => ({
  copyTextToClipboard: jest.fn(async () => true),
}));

const useAuthContextMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const useNavigationContextMock =
  useKolamNavigationContext as jest.MockedFunction<
    typeof useKolamNavigationContext
  >;
const handleDashboardRouteContextMock = jest.fn();
const handleChatRailCloseMock = jest.fn();
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
const createChatLabelMock = createKolamChatLabel as jest.MockedFunction<
  typeof createKolamChatLabel
>;
const updateChatLabelMock = updateKolamChatLabel as jest.MockedFunction<
  typeof updateKolamChatLabel
>;
const deleteChatLabelMock = deleteKolamChatLabel as jest.MockedFunction<
  typeof deleteKolamChatLabel
>;
const deleteTeamChatRoomMock =
  deleteKolamTeamChatRoom as jest.MockedFunction<
    typeof deleteKolamTeamChatRoom
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
const getWebSettingMock = getKolamWebSetting as jest.MockedFunction<
  typeof getKolamWebSetting
>;
const fetchShippingStatsMock =
  fetchKolamShippingDeliveryStats as jest.MockedFunction<
    typeof fetchKolamShippingDeliveryStats
  >;
const searchMarketplaceListingsMock =
  searchKolamChatMarketplaceListings as jest.MockedFunction<
    typeof searchKolamChatMarketplaceListings
  >;
const getKolamProductsMock = getKolamProducts as jest.MockedFunction<
  typeof getKolamProducts
>;
const getKolamProductDetailMock = getKolamProductDetail as jest.MockedFunction<
  typeof getKolamProductDetail
>;
const getKolamSpeciesListMock = getKolamSpeciesList as jest.MockedFunction<
  typeof getKolamSpeciesList
>;
const getKolamSpeciesMock = getKolamSpecies as jest.MockedFunction<
  typeof getKolamSpecies
>;
const createSoundServiceMock =
  createKolamNotificationSoundService as jest.MockedFunction<
    typeof createKolamNotificationSoundService
  >;
const pickNativeAssetFileMock = pickNativeAssetFile as jest.MockedFunction<
  typeof pickNativeAssetFile
>;
const pickNativeImageFileMock = pickNativeImageFile as jest.MockedFunction<
  typeof pickNativeImageFile
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
    patchInboxMessageFromLive: jest.fn(),
    upsertInboxMessageFromLive: jest.fn(),
    presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
    purgeMessages: jest.fn(),
    purgingMessages: false,
    clearTeamMessageSearch: jest.fn(),
    reactToMessage: jest.fn(),
    redialCall: jest.fn(),
    refresh: jest.fn(),
    refreshCall: jest.fn(),
    searchTeamMessages: jest.fn(),
    sendAttachment: jest.fn(),
    sendInboxImage: jest.fn(),
    sendMessage: jest.fn(),
    sendMarketplaceProduct: jest.fn(),
    sendCatalogCard: jest.fn(),
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
    unmuteCallParticipant: jest.fn(),
    updatePresenceFromLive: jest.fn(),
  };
}

describe('KolamGlobalChatRail', () => {
  beforeEach(() => {
    mockSoundPlay.mockClear();
    openUrlMock.mockClear();
    handleDashboardRouteContextMock.mockClear();
    handleChatRailCloseMock.mockClear();
    useNavigationContextMock.mockReturnValue({
      handleChatRailClose: handleChatRailCloseMock,
      handleDashboardRouteContext: handleDashboardRouteContextMock,
    } as ReturnType<typeof useKolamNavigationContext>);
    copyTextToClipboardMock.mockClear();
    createTeamChatRoomMock.mockClear();
    createChatLabelMock.mockClear();
    updateChatLabelMock.mockClear();
    deleteChatLabelMock.mockClear();
    deleteTeamChatRoomMock.mockClear();
    deleteTeamChatRoomMock.mockResolvedValue(undefined);
    createChatLabelMock.mockResolvedValue({
      _id: 'label-new',
      color: '#3b82f6',
      name: 'New Label',
    });
    updateChatLabelMock.mockResolvedValue({
      _id: 'label-1',
      color: '#ef4444',
      name: 'Prioritas Baru',
    });
    deleteChatLabelMock.mockResolvedValue(undefined);
    getUserPickerRowsMock.mockClear();
    openTeamChatDirectMock.mockClear();
    createSoundServiceMock.mockClear();
    getChatAnalyticsMock.mockClear();
    getChatContactDetailsMock.mockClear();
    getChatLabelsMock.mockClear();
    getChatTemplatesMock.mockClear();
    searchMarketplaceListingsMock.mockClear();
    getKolamProductsMock.mockClear();
    getKolamProductDetailMock.mockClear();
    getKolamSpeciesListMock.mockClear();
    getKolamSpeciesMock.mockClear();
    getWebSettingMock.mockClear();
    fetchShippingStatsMock.mockClear();
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
    searchMarketplaceListingsMock.mockResolvedValue({
      items: [],
      platform: 'tokopedia',
    });
    getKolamProductsMock.mockResolvedValue({
      data: [],
      pagination: {page: 1, limit: 15, total: 0, totalPages: 0},
    });
    getKolamSpeciesListMock.mockResolvedValue({
      data: [],
      pagination: {page: 1, limit: 15, total: 0, totalPages: 0},
    });
    getWebSettingMock.mockResolvedValue({
      daraAvatarUrl: '/media/dara/avatar.png',
      katakTerbangWorkerPhotoUrl: '/media/katak-terbang/photo.jpg',
    });
    fetchShippingStatsMock.mockResolvedValue({
      generatedAt: '2026-08-11T00:00:00.000Z',
      range: 'month',
      note: '',
      dara: {
        byChannel: {shopee: 0, tokopedia: 0, web: 0},
        change: 0,
        data: [],
        value: 0,
      },
      bot: {
        byChannel: {shopee: 0, tokopedia: 0, web: 0},
        change: 0,
        data: [],
        value: 0,
      },
      katakTerbangProfile: {
        name: 'Katak Terbang',
        photoUrl: '/media/katak-terbang/profile-live.jpg',
      },
      channelSources: {
        shopee: {logo: '', name: 'Shopee', sourceId: ''},
        tokopedia: {
          logo: '',
          name: 'Tokopedia',
          sourceId: '',
        },
        web: {logo: '', name: 'Webstore', sourceId: ''},
      },
    });
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
      patchInboxMessageFromLive: jest.fn(),
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      reactToMessage: jest.fn(),
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendInboxImage: jest.fn(),
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
    pickNativeImageFileMock.mockResolvedValue({cancelled: true});
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
        'Status: Semua',
        'Tugas: Semua',
        'Label: Semua label',
        'Platform',
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

  it('copies the active inbox conversation ID from the detail actions', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-copy-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Apakah masih tersedia?',
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
        _id: 'conv-copy-1',
        assignedStaffId: {_id: 'staff-1'},
        isAiHandled: false,
        status: 'open',
      },
      loading: false,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Pilih conversation Buyer Tokopedia',
      );

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const copyButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Salin conversation ID conv-copy-1',
      );

    await ReactTestRenderer.act(async () => {
      copyButton!.props.onPress();
    });

    expect(copyTextToClipboardMock).toHaveBeenCalledWith('conv-copy-1');
    expect(renderText(renderer!)).toEqual(expect.arrayContaining(['Disalin']));
  });

  it('opens chat settings shortcuts from the inbox header menu', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Pengaturan chat', 'Label percakapan']),
    );

    const settingsButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pengaturan chat');

    await ReactTestRenderer.act(async () => {
      settingsButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Pengaturan chat',
        'Konfigurasi inbox',
        'Label percakapan',
        'Template chat',
      ]),
    );
  });

  it('opens and manages conversation labels from chat settings', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const settingsButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pengaturan chat');

    await ReactTestRenderer.act(async () => {
      settingsButton!.props.onPress();
    });

    const labelsMenuItem = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka Label percakapan');

    await ReactTestRenderer.act(async () => {
      labelsMenuItem!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Label percakapan',
        'Prioritas',
        'Follow up',
        'New Label',
        'Save',
      ]),
    );

    const nameInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Name label percakapan');
    const colorInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Color label percakapan');

    await ReactTestRenderer.act(async () => {
      nameInput!.props.onChangeText('VIP');
      colorInput!.props.onChangeText('#ef4444');
    });

    const saveButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Save label percakapan');

    await ReactTestRenderer.act(async () => {
      await saveButton!.props.onPress();
    });

    expect(createChatLabelMock).toHaveBeenCalledWith({
      color: '#ef4444',
      name: 'VIP',
    });

    const editButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Edit label Prioritas');

    await ReactTestRenderer.act(async () => {
      editButton!.props.onPress();
    });

    const editNameInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Name label percakapan');

    await ReactTestRenderer.act(async () => {
      editNameInput!.props.onChangeText('Prioritas Baru');
    });

    const editSaveButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Save label percakapan');

    await ReactTestRenderer.act(async () => {
      await editSaveButton!.props.onPress();
    });

    expect(updateChatLabelMock).toHaveBeenCalledWith('label-1', {
      color: '#6fbd82',
      name: 'Prioritas Baru',
    });

    const deleteButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Hapus label Follow up');

    await ReactTestRenderer.act(async () => {
      deleteButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Hapus label?', 'Follow up']),
    );

    const confirmDeleteButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Konfirmasi hapus label percakapan',
      );

    await ReactTestRenderer.act(async () => {
      await confirmDeleteButton!.props.onPress();
    });

    expect(deleteChatLabelMock).toHaveBeenCalledWith('label-2');
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
        {
          _id: 'room-dara',
          category: 'direct',
          directPeerName: 'DARA',
          isDaraDirect: true,
          lastMessagePreview: 'Cek purchase order',
          unreadCount: 2,
        },
      ],
      totalUnread: 6,
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
      expect.arrayContaining(['Cek purchase order']),
    );
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(
          node =>
            node.props.accessibilityLabel === 'Buka jendela DARA team chat',
        ),
    ).toBe(true);
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining([
        'Team chat siap dipasang',
        'Read-only room dan unread sudah terhubung. Stream realtime dan detail pesan masuk di fase berikutnya.',
        '2 room terpantau',
      ]),
    );
  });

  it('opens an initial team chat room when requested by route context', async () => {
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
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail
          initialSelectedId="room-1"
          mode="team-chat"
          onClose={() => undefined}
        />,
      );
      await Promise.resolve();
    });

    expect(useDetailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'team-chat',
        selectedId: 'room-1',
      }),
    );
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Operasional']),
    );
  });

  it('deletes only meeting or project team chat rooms after confirmation', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh,
      rooms: [
        {
          _id: 'room-general',
          name: 'Operasional',
          category: 'general',
          isGeneral: true,
          lastMessagePreview: 'Barang siap dikirim',
          unreadCount: 0,
        },
        {
          _id: 'room-direct',
          category: 'direct',
          directPeerName: 'CS Tokopedia',
          lastMessagePreview: 'Follow up buyer',
          unreadCount: 0,
        },
        {
          _id: 'room-ai',
          category: 'ai',
          directPeerName: 'DARA',
          lastMessagePreview: 'DARA cek stok',
          unreadCount: 0,
        },
        {
          _id: 'room-meeting',
          name: 'Meeting Launch',
          category: 'meeting',
          lastMessagePreview: 'Agenda launch',
          unreadCount: 0,
        },
        {
          _id: 'room-project',
          name: 'Project Gudang',
          category: 'project',
          lastMessagePreview: 'Checklist gudang',
          unreadCount: 0,
        },
      ],
      totalUnread: 0,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    let buttons = renderer!.root.findAllByType(KolamPressable);
    expect(
      buttons.some(
        node => node.props.accessibilityLabel === 'Hapus room Operasional',
      ),
    ).toBe(false);
    expect(
      buttons.some(
        node => node.props.accessibilityLabel === 'Hapus room CS Tokopedia',
      ),
    ).toBe(false);
    expect(
      buttons.some(node => node.props.accessibilityLabel === 'Hapus room DARA'),
    ).toBe(false);
    expect(
      buttons.some(
        node => node.props.accessibilityLabel === 'Hapus room Meeting Launch',
      ),
    ).toBe(false);

    await ReactTestRenderer.act(async () => {
      buttons
        .find(
          node => node.props.accessibilityLabel === 'Pilih room Operasional',
        )!
        .props.onPress();
    });
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(
          node => node.props.accessibilityLabel === 'Hapus room Operasional',
        ),
    ).toBe(false);

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel ===
            'Kembali ke daftar room team chat',
        )!
        .props.onPress();
    });

    buttons = renderer!.root.findAllByType(KolamPressable);
    await ReactTestRenderer.act(async () => {
      buttons
        .find(
          node => node.props.accessibilityLabel === 'Pilih room Meeting Launch',
        )!
        .props.onPress();
    });

    const deleteMeetingButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Hapus room Meeting Launch',
      );
    expect(deleteMeetingButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      deleteMeetingButton!.props.onPress();
    });
    expect(deleteTeamChatRoomMock).not.toHaveBeenCalled();

    const confirmButton = renderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Hapus');

    await ReactTestRenderer.act(async () => {
      confirmButton!.props.onPress();
    });

    expect(deleteTeamChatRoomMock).toHaveBeenCalledWith('room-meeting');
    expect(refresh).toHaveBeenCalled();
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
    useAuthContextMock.mockReturnValue({
      accessScope: {am: false, kolam: true, pos: false},
      authEmail: '',
      authMessage: '',
      authPassword: '',
      authSource: 'kolam',
      authSourceHint: '',
      authUser: {csActive: true, id: 'staff-1', roleKey: 'admin'},
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
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const toggleButton = renderer!.root
      .findAll(node => node.props.accessibilityLabel === 'Buat ruang baru')
      .at(0);

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

  it('opens DARA from the team chat header window', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const sendAttachment = jest.fn().mockResolvedValue(undefined);
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    pickNativeAssetFileMock.mockResolvedValue({
      cancelled: false,
      mimeType: 'image/png',
      name: 'dara.png',
      path: 'C:\\media\\dara.png',
    });
    useDetailMock.mockImplementation((input: {selectedId: string | null}) => {
      const detail = getDefaultDetailMock();
      if (input.selectedId === 'room-dara-header') {
        return {
          ...detail,
          messages: [
            {
              attachments: [],
              author: 'DARA',
              body: 'Halo, saya siap membantu dari window besar.',
              embeds: [],
              id: 'msg-dara-1',
              linkPreviews: [],
              mine: false,
              reactions: [],
            },
          ],
          sendAttachment,
          sendMessage,
          teamRoomMetadata: {
            ...detail.teamRoomMetadata,
            bots: [{id: 'dara', label: 'DARA', username: 'dara'}],
          },
        } as ReturnType<typeof getDefaultDetailMock>;
      }

      return detail;
    });
    openTeamChatDirectMock.mockResolvedValue({
      _id: 'room-dara-header',
      category: 'direct',
      directPeerName: 'DARA',
      isDaraDirect: true,
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

    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Assistant Team Chat']),
    );

    const daraHeaderButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Buka jendela DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      daraHeaderButton!.props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'DARA',
        'Assistant Team Chat',
        'Halo, saya siap membantu dari window besar.',
      ]),
    );

    const daraInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
      );
    const preventDefaultForShiftEnter = jest.fn();

    await ReactTestRenderer.act(async () => {
      await daraInput!.props.onChangeText('Apa prioritas hari ini?');
    });

    const updatedDaraInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      await updatedDaraInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter', shiftKey: true},
        preventDefault: preventDefaultForShiftEnter,
      });
    });

    expect(preventDefaultForShiftEnter).toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(
          node =>
            node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
        )!.props.value,
    ).toBe('Apa prioritas hari ini?\n');

    const preventDefaultForEnter = jest.fn();
    await ReactTestRenderer.act(async () => {
      await updatedDaraInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter'},
        preventDefault: preventDefaultForEnter,
      });
    });

    expect(preventDefaultForEnter).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith('Apa prioritas hari ini?');

    const scroll = renderer!.root
      .findAllByType(ScrollView)
      .find(
        node =>
          node.props.accessibilityLabel === 'Daftar pesan DARA team chat',
      );
    expect(scroll!.props.onContentSizeChange).toEqual(expect.any(Function));

    const emojiButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka emoji chat');

    await ReactTestRenderer.act(async () => {
      emojiButton!.props.onPress();
    });

    const emojiOption = renderer!.root
      .findAllByType(KolamPressable)
      .find(node =>
        String(node.props.accessibilityLabel ?? '').startsWith('Pilih emoji '),
      );

    await ReactTestRenderer.act(async () => {
      emojiOption!.props.onPress();
    });

    const attachButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Lampirkan file team chat',
      );

    await ReactTestRenderer.act(async () => {
      await attachButton!.props.onPress();
    });

    expect(renderText(renderer!).join(' ')).toContain('Gambar dara.png');

    const attachmentInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      await attachmentInput!.props.onChangeText('Lampiran DARA');
    });

    const updatedAttachmentInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      await updatedAttachmentInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter'},
        preventDefault: jest.fn(),
      });
    });

    expect(sendAttachment).toHaveBeenCalledWith(
      expect.objectContaining({name: 'dara.png'}),
      'Lampiran DARA',
    );
    expect(openTeamChatDirectMock).toHaveBeenCalledWith({dara: true});
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(
          node =>
            node.props.accessibilityLabel ===
            'Kembali ke daftar room team chat',
        ),
    ).toBe(false);
  });

  it('clears the DARA window thinking bubble when a new AI message appears', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    let daraMessages: Array<{
      attachments: unknown[];
      author: string;
      body: string;
      embeds: unknown[];
      id: string;
      linkPreviews: unknown[];
      mine: boolean;
      reactions: unknown[];
      senderIsAi?: boolean;
    }> = [];
    useDetailMock.mockImplementation((input: {selectedId: string | null}) => {
      const detail = getDefaultDetailMock();
      if (input.selectedId === 'room-dara-wait') {
        return {
          ...detail,
          messages: daraMessages,
          sendMessage,
        } as ReturnType<typeof getDefaultDetailMock>;
      }

      return detail;
    });
    openTeamChatDirectMock.mockResolvedValue({
      _id: 'room-dara-wait',
      category: 'direct',
      directPeerName: 'DARA',
      isDaraDirect: true,
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [],
      totalUnread: 0,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    const daraHeaderButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Buka jendela DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      daraHeaderButton!.props.onPress();
    });

    const daraInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      await daraInput!.props.onChangeText('cek stok');
    });

    const updatedDaraInput = renderer!.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel === 'Tulis pesan DARA team chat',
      );

    await ReactTestRenderer.act(async () => {
      await updatedDaraInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter'},
        preventDefault: jest.fn(),
      });
    });

    expect(
      renderer!.root
        .findAll(
          node =>
            node.props?.accessibilityLabel === 'DARA thinking bubble',
        )
        .some(Boolean),
    ).toBe(true);

    daraMessages = [
      {
        attachments: [],
        author: 'DARA',
        body: 'Stok aman.',
        embeds: [],
        id: 'msg-ai-new',
        linkPreviews: [],
        mine: false,
        reactions: [],
        senderIsAi: true,
      },
    ];

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    expect(
      renderer!.root
        .findAll(
          node =>
            node.props?.accessibilityLabel === 'DARA thinking bubble',
        )
        .some(Boolean),
    ).toBe(false);

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
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
    expect(
      renderer!.root
        .findAllByType(Image)
        .some(node =>
          String(node.props.source?.uri || '').includes(
            '/media/dara/avatar.png',
          ),
        ),
    ).toBe(true);

    const unreadRow = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');
    const unreadRowStyle = StyleSheet.flatten(unreadRow!.props.style);
    expect(unreadRowStyle.backgroundColor).toBe('rgba(254, 226, 226, 0.72)');
    expect(
      unreadRow!.findAllByType(KolamBadge).some(node => node.props.label === 2),
    ).toBe(true);
    expect(
      unreadRow!.children.filter(
        child => typeof child !== 'string' && child.type === KolamBadge,
      ),
    ).toHaveLength(0);
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
        handoverNote: {
          text: 'Buyer minta follow up stok sore ini.',
          fromStaffId: {_id: 'staff-old', first_name: 'Sisco'},
          toStaffId: {_id: 'staff-1', first_name: 'Staff'},
        },
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
            {
              fileName: 'handover-clip.mp4',
              kind: 'video',
              mimeType: 'video/mp4',
              url: '/uploads/team-chat/handover-clip.mp4',
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
    const text = renderText(renderer!);
    expect(text).toEqual(
      expect.arrayContaining([
        'Buyer Tokopedia',
        'Apakah masih tersedia?',
        'Open',
        'Prioritas',
        'Follow up',
        'CS: Staff',
      ]),
    );
    expect(
      renderer!.root.findAll(
        node => node.props.accessibilityLabel === 'Catatan handover percakapan',
      ).length,
    ).toBeGreaterThan(0);
    expect(text).toEqual(
      expect.arrayContaining(['Buyer minta follow up stok sore ini.']),
    );
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(
          node =>
            node.props.accessibilityLabel ===
            'Buka video handover-clip.mp4',
        ),
    ).toBe(true);
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
    const aiButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Toggle inbox AI handled');

    await ReactTestRenderer.act(async () => {
      await statusButton!.props.onPress();
      await aiButton!.props.onPress();
    });

    expect(toggleInboxStatus).toHaveBeenCalledTimes(1);
    expect(assignInboxToMe).not.toHaveBeenCalled();
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

    const emojiButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka emoji chat');
    await ReactTestRenderer.act(async () => {
      emojiButton!.props.onPress();
    });

    const smileEmojiButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih emoji 🙂');
    await ReactTestRenderer.act(async () => {
      smileEmojiButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox')!
        .props.value,
    ).toBe('Siap, masih tersedia. 🙂');

    expect(input!.props.submitBehavior).toBe('submit');
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Kirim pesan'),
    ).toBe(false);

    await ReactTestRenderer.act(async () => {
      await input!.props.onKeyPress({
        nativeEvent: {key: 'Enter'},
        preventDefault: jest.fn(),
      });
    });

    expect(sendMessage).toHaveBeenCalledWith('Siap, masih tersedia. 🙂');
  });

  it('renders Katak Terbang avatar for AI inbox messages', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'DARA bantu follow up',
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
        assignedStaffId: null,
        isAiHandled: true,
        labelIds: [],
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          author: 'DARA',
          body: 'DARA bantu follow up.',
          embeds: [],
          id: 'msg-ai-1',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-28T08:00:00.000Z',
        },
      ],
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendMessage: jest.fn(),
      signalTyping: jest.fn(),
      sending: false,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Tokopedia');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(Image)
        .some(
          node =>
            node.props.source?.uri ===
            'https://amfibi.dunia-anura.com/media/katak-terbang/profile-live.jpg',
        ),
    ).toBe(true);
  });

  it('keeps Shift+Enter as a newline affordance in the chat composer', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'whatsapp',
          contactId: {displayName: 'Buyer WA'},
          lastMessagePreview: 'Halo',
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
        status: 'open',
      },
      loading: false,
      messages: [],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendInboxImage: jest.fn(),
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
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer WA');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');
    const preventDefault = jest.fn();

    await ReactTestRenderer.act(async () => {
      await input!.props.onChangeText('Baris satu');
    });

    const updatedInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');

    await ReactTestRenderer.act(async () => {
      await updatedInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter', shiftKey: true},
        preventDefault,
      });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox')!
        .props.value,
    ).toBe('Baris satu\n');
  });

  it('picks and sends an inbox image from the composer when reply gate allows it', async () => {
    const sendInboxImage = jest.fn().mockResolvedValue(undefined);
    pickNativeImageFileMock.mockResolvedValue({
      cancelled: false,
      mimeType: 'image/jpeg',
      name: 'proof.jpg',
      path: 'C:\\media\\proof.jpg',
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-1',
          platform: 'whatsapp',
          contactId: {displayName: 'Buyer WA'},
          lastMessagePreview: 'Saya kirim bukti',
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
        status: 'open',
      },
      loading: false,
      messages: [],
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      refresh: jest.fn(),
      sendAttachment: jest.fn(),
      sendInboxImage,
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
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer WA');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const attachButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Lampirkan gambar inbox');

    await ReactTestRenderer.act(async () => {
      await attachButton!.props.onPress();
    });

    expect(pickNativeImageFileMock).toHaveBeenCalledTimes(1);
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['📷 Gambar proof.jpg']),
    );

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan inbox');

    await ReactTestRenderer.act(async () => {
      await input!.props.onSubmitEditing();
    });

    expect(sendInboxImage).toHaveBeenCalledWith(
      expect.objectContaining({name: 'proof.jpg'}),
      undefined,
    );
  });

  it('keeps store composer off the olshop tool while image, emoji, template, and reply stay available', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-store',
          platform: 'store',
          contactId: {displayName: 'Buyer Store'},
          lastMessagePreview: 'Produk webstore',
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
        _id: 'conv-store',
        assignedStaffId: {_id: 'staff-1', first_name: 'Staff'},
        isAiHandled: false,
        platform: 'store',
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          embeds: [],
          id: 'msg-store-1',
          author: 'Buyer',
          body: 'Produk webstore ini masih ada?',
          linkPreviews: [],
          mine: false,
          reactions: [],
          sentAt: '2026-07-30T02:00:00.000Z',
        },
      ],
      sendMessage: jest.fn(),
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
      .find(
        node =>
          node.props.accessibilityLabel === 'Pilih conversation Buyer Store',
      );

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    const labels = renderer!.root
      .findAllByType(KolamPressable)
      .map(node => node.props.accessibilityLabel)
      .filter(Boolean);

    expect(labels).toEqual(
      expect.arrayContaining([
        'Lampirkan gambar inbox',
        'Lampirkan produk',
        'Buka emoji chat',
        'Buka template chat',
        'Aksi pesan Buyer',
      ]),
    );
    expect(labels).not.toEqual(
      expect.arrayContaining([
        'Buka produk Shopee',
        'Buka produk Tokopedia',
        'Lampirkan invoice pelanggan',
      ]),
    );
  });

  it('loads store customer invoices and sends the selected invoice share text', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

    try {
      const sendMessage = jest.fn().mockResolvedValue(undefined);
      getChatContactDetailsMock.mockResolvedValue({
        contact: {
          _id: 'contact-store',
          displayName: 'Buyer Store',
          linkedCustomerId: {_id: 'customer-1', name: 'Buyer Store'},
          platform: 'store',
        },
        customer: {
          _id: 'customer-1',
          name: 'Buyer Store',
        },
        metrics: {
          ordersCount: 1,
          totalOrders: 1,
          totalSpend: 250000,
        },
        recentOrders: [
          {
            _id: 'sale-99',
            finalTotal: 250000,
            invoiceCode: 'INV-099',
            itemsCount: 1,
            status: 'paid',
            transactionDate: '2026-08-01T00:00:00.000Z',
          },
        ],
      });
      useReadonlyDataMock.mockReturnValue({
        conversations: [
          {
            _id: 'conv-store-inv',
            platform: 'store',
            contactId: {
              displayName: 'Buyer Store Linked',
              linkedCustomerId: {_id: 'customer-1', name: 'Buyer Store'},
            },
            lastMessagePreview: 'Invoice?',
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
          _id: 'conv-store-inv',
          assignedStaffId: {_id: 'staff-1', first_name: 'Staff'},
          contactId: {
            displayName: 'Buyer Store Linked',
            linkedCustomerId: {_id: 'customer-1', name: 'Buyer Store'},
          },
          isAiHandled: false,
          platform: 'store',
          status: 'open',
        },
        loading: false,
        messages: [],
        sendMessage,
        sending: false,
      });

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
        );
      });

      const selectButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel ===
            'Pilih conversation Buyer Store Linked',
        );
      expect(selectButton).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        selectButton!.props.onPress();
      });

      const invoiceButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel === 'Lampirkan invoice pelanggan',
        );
      expect(invoiceButton).toBeTruthy();

      await ReactTestRenderer.act(async () => {
        invoiceButton!.props.onPress();
      });
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(getChatContactDetailsMock).toHaveBeenCalledWith('conv-store-inv', {
        ordersLimit: 50,
      });

      const invoiceRow = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node => node.props.accessibilityLabel === 'Kirim invoice INV-099',
        );
      expect(invoiceRow).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        invoiceRow!.props.onPress();
      });

      expect(sendMessage).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[Invoice\] INV-099 — Rp250\.000\n\[Link\] \/sales\/sale-99$/,
        ),
      );
    } finally {
      if (renderer) {
        await ReactTestRenderer.act(async () => {
          renderer!.unmount();
        });
      }
    }
  });

  it('loads store catalog products and sends the selected card through the detail hook', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

    try {
      const product = {
        id: 'prod-1',
        name: 'Nemo Clownfish',
        priceToSell: 85000,
        onlinePrice: 0,
        stock: 4,
        hasVariants: false,
        variants: [],
        photoUris: ['https://cdn.example/nemo.jpg'],
        thumbnailUri: 'https://cdn.example/nemo.jpg',
      };
      const sendCatalogCard = jest.fn().mockResolvedValue(undefined);
      getKolamProductsMock.mockResolvedValue({
        data: [product],
        pagination: {page: 1, limit: 15, total: 1, totalPages: 1},
      });
      useReadonlyDataMock.mockReturnValue({
        conversations: [
          {
            _id: 'conv-store',
            platform: 'store',
            contactId: {displayName: 'Buyer Store'},
            lastMessagePreview: 'Mau Nemo',
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
          _id: 'conv-store',
          assignedStaffId: {_id: 'staff-1', first_name: 'Staff'},
          isAiHandled: false,
          platform: 'store',
          status: 'open',
        },
        loading: false,
        messages: [],
        sendCatalogCard,
        sending: false,
      });

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
        );
      });

      const selectButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel === 'Pilih conversation Buyer Store',
        );
      expect(selectButton).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        selectButton!.props.onPress();
      });

      const catalogButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(node => node.props.accessibilityLabel === 'Lampirkan produk');
      expect(catalogButton).toBeTruthy();

      await ReactTestRenderer.act(async () => {
        catalogButton!.props.onPress();
      });
      await ReactTestRenderer.act(async () => {
        await new Promise<void>(resolve => setTimeout(resolve, 350));
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(getKolamProductsMock).toHaveBeenCalled();
      const productRow = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node => node.props.accessibilityLabel === 'Pilih Nemo Clownfish',
        );
      expect(productRow).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        productRow!.props.onPress();
      });

      expect(sendCatalogCard).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'product_card',
          card: expect.objectContaining({
            entityId: 'prod-1',
            entityType: 'product',
            name: 'Nemo Clownfish',
          }),
        }),
      );
    } finally {
      if (renderer) {
        await ReactTestRenderer.act(async () => {
          renderer!.unmount();
        });
      }
    }
  });

  it('renders team-chat [Product] share as a card and inserts catalog share text into the composer', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

    try {
      const product = {
        id: 'prod-team-1',
        name: 'Anemon Premium',
        priceToSell: 150000,
        onlinePrice: 0,
        stock: 3,
        hasVariants: false,
        variants: [],
        photoUris: ['https://cdn.example/anemon.jpg'],
        thumbnailUri: 'https://cdn.example/anemon.jpg',
      };
      getKolamProductsMock.mockResolvedValue({
        data: [product],
        pagination: {page: 1, limit: 15, total: 1, totalPages: 1},
      });
      useReadonlyDataMock.mockReturnValue({
        conversations: [],
        loading: false,
        refresh: jest.fn(),
        rooms: [
          {
            _id: 'room-1',
            category: 'project',
            name: 'Ops Room',
            lastMessagePreview: 'Share produk',
            unreadCount: 0,
          },
        ],
        totalUnread: 0,
      });
      useDetailMock.mockImplementation(() => ({
        ...getDefaultDetailMock(),
        loading: false,
        messages: [
          {
            attachments: [],
            author: 'Maya',
            body: [
              '[Product] Anemon Premium — Rp150.000 — Stok 3',
              'https://cdn.example/anemon.jpg',
              '[Link] https://dunia-anura.com/id/products/anemon-premium',
            ].join('\n'),
            embeds: [],
            id: 'msg-share',
            linkPreviews: [],
            mine: false,
            reactions: [],
            replyPreview: null,
            sentAt: '2026-08-14T10:00:00.000Z',
            status: 'sent',
          },
        ],
        sending: false,
      }));

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
        );
      });

      const selectButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(node => node.props.accessibilityLabel === 'Pilih room Ops Room');
      expect(selectButton).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        selectButton!.props.onPress();
      });
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      const labels = renderer!.root
        .findAllByType(KolamPressable)
        .map(node => node.props.accessibilityLabel)
        .filter(Boolean);
      expect(labels).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^Buka card Anemon Premium/),
          'Lampirkan produk',
        ]),
      );

      const catalogButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(node => node.props.accessibilityLabel === 'Lampirkan produk');
      expect(catalogButton).toBeTruthy();

      await ReactTestRenderer.act(async () => {
        catalogButton!.props.onPress();
      });
      await ReactTestRenderer.act(async () => {
        await new Promise<void>(resolve => setTimeout(resolve, 350));
        await Promise.resolve();
        await Promise.resolve();
      });

      const productRow = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node => node.props.accessibilityLabel === 'Pilih Anemon Premium',
        );
      expect(productRow).toBeTruthy();

      await ReactTestRenderer.act(async () => {
        productRow!.props.onPress();
      });

      const composer = renderer!.root
        .findAllByType(TextInput)
        .find(
          node => node.props.accessibilityLabel === 'Tulis pesan team chat',
        );
      expect(composer?.props.value).toContain('[Product] Anemon Premium');
      expect(composer?.props.value).toContain('Stok 3');
    } finally {
      if (renderer) {
        await ReactTestRenderer.act(async () => {
          renderer!.unmount();
        });
      }
    }
  });

  it('loads only mapped marketplace listings for Tokopedia and sends the selected card through the detail hook', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

    try {
      const listing = {
        entityId: 'species-1',
        entityType: 'species' as const,
        goodsId: 'goods-777',
        listingName: 'Tokopedia Anemon Premium',
        listingUrl: 'https://www.tokopedia.com/dunia-anura/anemon-premium',
        name: 'Anemon Premium',
        platform: 'tokopedia' as const,
        productId: 'product-fallback',
        shopId: 'shop-1',
        sku: 'ANM-777',
      };
      const sendMarketplaceProduct = jest.fn().mockResolvedValue(undefined);
      searchMarketplaceListingsMock.mockResolvedValue({
        items: [listing],
        platform: 'tokopedia',
      });
      useReadonlyDataMock.mockReturnValue({
        conversations: [
          {
            _id: 'conv-tokped',
            platform: 'tokopedia',
            contactId: {displayName: 'Buyer Tokopedia'},
            lastMessagePreview: 'Kirim produk tokped',
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
          _id: 'conv-tokped',
          assignedStaffId: {_id: 'staff-1', first_name: 'Staff'},
          isAiHandled: false,
          platform: 'tokopedia',
          status: 'open',
        },
        loading: false,
        messages: [],
        sendMarketplaceProduct,
        sending: false,
      });

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
        );
      });

      const selectButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel ===
            'Pilih conversation Buyer Tokopedia',
        );
      expect(selectButton).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        selectButton!.props.onPress();
      });
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      const olshopButton = renderer!.root
        .findAllByType(KolamPressable)
        .find(node => node.props.accessibilityLabel === 'Buka produk Tokopedia');
      expect(olshopButton).toBeTruthy();

      await ReactTestRenderer.act(async () => {
        olshopButton!.props.onPress();
      });
      await ReactTestRenderer.act(async () => {
        await new Promise<void>(resolve => setTimeout(resolve, 350));
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(searchMarketplaceListingsMock).toHaveBeenCalledWith({
        limit: 20,
        platform: 'tokopedia',
        q: '',
      });
      const marketplaceLabels = renderer!.root
        .findAllByType(KolamPressable)
        .map(node => node.props.accessibilityLabel)
        .filter(Boolean);
      expect(marketplaceLabels).toEqual(
        expect.arrayContaining([
          'Tutup produk marketplace',
          'Kirim produk Tokopedia Anemon Premium',
        ]),
      );

      const listingRow = renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel ===
            'Kirim produk Tokopedia Anemon Premium',
        );
      expect(listingRow).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        listingRow!.props.onPress();
      });

      expect(sendMarketplaceProduct).toHaveBeenCalledWith(listing);
    } finally {
      if (renderer) {
        await ReactTestRenderer.act(async () => {
          renderer!.unmount();
        });
      }
    }
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

    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Kirim pesan'),
    ).toBe(false);

    await ReactTestRenderer.act(async () => {
      await input!.props.onSubmitEditing();
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

    const actionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Aksi pesan Buyer');

    await ReactTestRenderer.act(async () => {
      actionButton!.props.onPress();
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

    await ReactTestRenderer.act(async () => {
      await input!.props.onSubmitEditing();
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
    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Aksi pesan Buyer'),
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

    const actionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Aksi pesan Staff');

    await ReactTestRenderer.act(async () => {
      actionButton!.props.onPress();
    });

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
            thumbnailUrl: '/uploads/chat/proof-thumb.jpg',
            text: 'Bukti transfer jam 08.10',
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
        'Bukti transfer jam 08.10',
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
    expect(handleDashboardRouteContextMock).not.toHaveBeenCalled();
    expect(handleChatRailCloseMock).not.toHaveBeenCalled();
    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Preview proof.jpg', 'Tutup']),
    );
    const inboxImages = renderer!.root.findAll(
      node =>
        node.props.accessibilityLabel === 'proof.jpg' ||
        node.props.accessibilityLabel === 'Preview proof.jpg',
    );
    expect(inboxImages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({
            sourceUri: expect.stringContaining('/uploads/chat/proof-thumb.jpg'),
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            sourceUri: expect.stringContaining('/uploads/chat/proof.jpg'),
          }),
        }),
      ]),
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

  it('opens in-app product/species routes from catalog cards with entityId', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-deeplink',
          assignedStaffId: null,
          platform: 'web',
          contactId: {displayName: 'Buyer Web'},
          lastMessagePreview: 'Kartu katalog',
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
        _id: 'conv-deeplink',
        assignedStaffId: null,
        isAiHandled: false,
        labelIds: [],
        platform: 'web',
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          content: {
            card: {
              detailHref: 'https://store.example.test/products/nemo',
              entityId: 'prod-deeplink-1',
              entityType: 'product',
              name: 'Nemo Deeplink',
              price: 99000,
              stock: 2,
            },
            type: 'product_card',
          },
          embeds: [],
          id: 'msg-product-deeplink',
          author: 'Anda',
          body: 'Nemo Deeplink',
          linkPreviews: [],
          mine: true,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-08-14T08:00:00.000Z',
          status: 'sent',
        },
        {
          attachments: [],
          content: {
            card: {
              detailHref: 'https://store.example.test/species/anemon',
              entityId: 'sp-deeplink-1',
              entityType: 'species',
              name: 'Anemon Deeplink',
              price: 175000,
              stock: 8,
            },
            type: 'species_card',
          },
          embeds: [],
          id: 'msg-species-deeplink',
          author: 'Anda',
          body: 'Anemon Deeplink',
          linkPreviews: [],
          mine: true,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-08-14T08:01:00.000Z',
          status: 'sent',
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
          node.props.accessibilityLabel === 'Pilih conversation Buyer Web',
      );
    await ReactTestRenderer.act(async () => {
      conversationButton!.props.onPress();
    });

    const productCard = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Buka card Nemo Deeplink',
      );
    const speciesCard = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Buka card Anemon Deeplink',
      );

    await ReactTestRenderer.act(async () => {
      productCard!.props.onPress();
    });
    expect(handleDashboardRouteContextMock).toHaveBeenCalledWith(
      '/products/prod-deeplink-1',
    );
    expect(handleChatRailCloseMock).toHaveBeenCalled();
    expect(openUrlMock).not.toHaveBeenCalled();

    handleDashboardRouteContextMock.mockClear();
    handleChatRailCloseMock.mockClear();

    await ReactTestRenderer.act(async () => {
      speciesCard!.props.onPress();
    });
    expect(handleDashboardRouteContextMock).toHaveBeenCalledWith(
      '/species/sp-deeplink-1',
    );
    expect(handleChatRailCloseMock).toHaveBeenCalled();
    expect(openUrlMock).not.toHaveBeenCalled();
  });

  it('renders inbound web, marketplace, youtube, and clickable link cards', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-cards',
          assignedStaffId: null,
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer Tokopedia'},
          lastMessagePreview: 'Katalog',
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
        _id: 'conv-cards',
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
            text: '[Product] LIBERTY Luce — Rp150.000 — 12 terjual\nhttps://images.tokopedia.net/img/luce.jpg\n[Link] /id/products/liberty-luce',
            type: 'text',
          },
          embeds: [],
          id: 'msg-tokped-product',
          author: 'Buyer Tokopedia',
          body: '[Product] LIBERTY Luce — Rp150.000 — 12 terjual\nhttps://images.tokopedia.net/img/luce.jpg\n[Link] /id/products/liberty-luce',
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
              detailHref: '/id/products/nemo',
              entityType: 'product',
              imageUrl: '/uploads/products/nemo.jpg',
              name: 'Nemo Clownfish',
              price: 85000,
              stock: 4,
            },
            text: '[Product] Nemo Clownfish — Rp85.000 — Stok 4\n/uploads/products/nemo.jpg\n[Link] /id/products/nemo',
            type: 'product_card',
          },
          embeds: [],
          id: 'msg-web-product',
          author: 'Buyer Web',
          body: '[Product] Nemo Clownfish — Rp85.000 — Stok 4\n/uploads/products/nemo.jpg\n[Link] /id/products/nemo',
          linkPreviews: [],
          mine: false,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-07-28T08:01:00.000Z',
        },
        {
          attachments: [],
          content: {
            text: 'https://youtu.be/dQw4w9WgXcQ',
            type: 'text',
          },
          embeds: [],
          id: 'msg-yt-only',
          author: 'Buyer Tokopedia',
          body: 'https://youtu.be/dQw4w9WgXcQ',
          linkPreviews: [],
          mine: false,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-07-28T08:02:00.000Z',
        },
        {
          attachments: [],
          content: {
            text: 'Cek stok di https://dunia-anura.com/id/products/nemo ya',
            type: 'text',
          },
          embeds: [],
          id: 'msg-plain-link',
          author: 'Buyer Tokopedia',
          body: 'Cek stok di https://dunia-anura.com/id/products/nemo ya',
          linkPreviews: [],
          mine: false,
          reactions: [],
          replyPreview: null,
          sentAt: '2026-07-28T08:03:00.000Z',
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

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findAllByType(KolamPressable)
        .find(
          node =>
            node.props.accessibilityLabel ===
            'Pilih conversation Buyer Tokopedia',
        )!
        .props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Tokopedia',
        'LIBERTY Luce',
        'Rp150.000',
        'Product',
        'Nemo Clownfish',
        'YouTube',
        'Buka di YouTube',
        'Cek stok di ',
        'https://dunia-anura.com/id/products/nemo',
        ' ya',
      ]),
    );

    const tokpedCard = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Buka card LIBERTY Luce',
      );
    const webCard = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node => node.props.accessibilityLabel === 'Buka card Nemo Clownfish',
      );
    const youtubeCard = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Buka YouTube inbox');
    const plainLink = renderer!.root
      .findAllByType(Text)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Buka tautan https://dunia-anura.com/id/products/nemo',
      );

    await ReactTestRenderer.act(async () => {
      tokpedCard!.props.onPress();
      webCard!.props.onPress();
      youtubeCard!.props.onPress();
      plainLink!.props.onPress();
    });

    expect(openUrlMock).toHaveBeenCalledWith(
      'https://dunia-anura.com/id/products/liberty-luce',
    );
    expect(openUrlMock).toHaveBeenCalledWith(
      'https://dunia-anura.com/id/products/nemo',
    );
    expect(openUrlMock).toHaveBeenCalledWith('https://youtu.be/dQw4w9WgXcQ');
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
          senderProfilePicture: 'media/user-avatar/staff.jpg',
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
    expect(
      renderer!.root
        .findAllByType(Image)
        .some(
          node =>
            node.props.source?.uri ===
            'https://amfibi.dunia-anura.com/api/media/avatar?src=media%2Fuser-avatar%2Fstaff.jpg&size=96',
        ),
    ).toBe(true);

    const actionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Aksi pesan Staff');

    await ReactTestRenderer.act(async () => {
      actionButton!.props.onPress();
    });

    const reactionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Reaksi 🙏');

    await ReactTestRenderer.act(async () => {
      reactionButton!.props.onPress();
    });

    expect(reactToMessage).toHaveBeenCalledWith('team-msg-1', '🙏');
  });

  it('renders DARA team chat avatar from web settings', async () => {
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      refresh: jest.fn(),
      rooms: [
        {
          _id: 'room-1',
          name: 'Operasional',
          category: 'general',
          lastMessagePreview: 'DARA cek stok',
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
          author: 'DARA',
          body: 'Stok sedang dicek.',
          embeds: [],
          id: 'team-msg-dara-1',
          linkPreviews: [],
          mine: false,
          reactions: [],
          replyPreview: null,
          senderIsAi: true,
        },
      ],
      presence: {onlineCount: 1, typingUserIds: [], viewingCount: 1},
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const selectButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih room Operasional');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(Image)
        .some(
          node =>
            node.props.source?.uri ===
            'https://amfibi.dunia-anura.com/media/dara/avatar.png',
        ),
    ).toBe(true);
  });

  it('opens team chat rooms as a full rail detail with back navigation', async () => {
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

    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Pilih room Operasional'),
    ).toBe(false);

    const backButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(
        node =>
          node.props.accessibilityLabel === 'Kembali ke daftar room team chat',
      );
    expect(backButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      backButton!.props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(KolamPressable)
        .some(node => node.props.accessibilityLabel === 'Pilih room Operasional'),
    ).toBe(true);
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

  it('inserts a newline in the team chat composer on Shift+Enter', async () => {
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
    const preventDefault = jest.fn();

    await ReactTestRenderer.act(async () => {
      await input!.props.onChangeText('Baris satu');
    });

    const updatedInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');

    await ReactTestRenderer.act(async () => {
      await updatedInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter', shiftKey: true},
        preventDefault,
      });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat')!
        .props.value,
    ).toBe('Baris satu\n');

    const afterNewlineInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');

    // Native echo without \n must not snap the caret/value back up.
    await ReactTestRenderer.act(async () => {
      await afterNewlineInput!.props.onChangeText('Baris satu');
    });

    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat')!
        .props.value,
    ).toBe('Baris satu\n');
    expect(sendMessage).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      await afterNewlineInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter', shiftKey: true},
        preventDefault: jest.fn(),
      });
    });

    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat')!
        .props.value,
    ).toBe('Baris satu\n\n');
    expect(sendMessage).not.toHaveBeenCalled();

    const blankLineInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');

    // Native may ack the blank line then echo without the trailing empty line.
    await ReactTestRenderer.act(async () => {
      await blankLineInput!.props.onChangeText('Baris satu\n\n');
      await blankLineInput!.props.onChangeText('Baris satu\n');
    });

    expect(
      renderer!.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat')!
        .props.value,
    ).toBe('Baris satu\n\n');
    expect(sendMessage).not.toHaveBeenCalled();

    // Plain Enter after Shift+Enter newlines must send, not keep inserting lines.
    await ReactTestRenderer.act(async () => {
      await blankLineInput!.props.onKeyPress({
        nativeEvent: {key: 'Enter'},
        preventDefault: jest.fn(),
      });
    });

    expect(sendMessage).toHaveBeenCalledWith('Baris satu');
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

    await ReactTestRenderer.act(async () => {
      await input!.props.onSubmitEditing();
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

    const actionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Aksi pesan Maya');

    await ReactTestRenderer.act(async () => {
      actionButton!.props.onPress();
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

    await ReactTestRenderer.act(async () => {
      await input!.props.onSubmitEditing();
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

    const actionButton = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Aksi pesan Staff');

    await ReactTestRenderer.act(async () => {
      actionButton!.props.onPress();
    });

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
      mimeType: 'video/mp4',
      name: 'clip.mp4',
      path: 'C:\\media\\clip.mp4',
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

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['🎬 Video clip.mp4']),
    );

    const input = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Tulis pesan team chat');

    await ReactTestRenderer.act(async () => {
      await input!.props.onSubmitEditing();
    });

    expect(sendAttachment).toHaveBeenCalledWith(
      expect.objectContaining({name: 'clip.mp4'}),
      '',
    );
  });

  it('patches inbox delivery status from message.updated live events without conversation id', async () => {
    const patchInboxMessageFromLive = jest.fn();
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
          platform: 'whatsapp',
          contactId: {displayName: 'Buyer WA'},
          lastMessagePreview: 'Siap.',
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
        assignedStaffId: {_id: 'staff-1'},
        isAiHandled: false,
        status: 'open',
      },
      loading: false,
      messages: [
        {
          attachments: [],
          content: {type: 'text', text: 'Siap.'},
          embeds: [],
          id: 'msg-1',
          author: 'Anda',
          body: 'Siap.',
          linkPreviews: [],
          mine: true,
          reactions: [],
          sentAt: '2026-07-28T08:00:00.000Z',
          status: 'pending',
        },
      ],
      patchInboxMessageFromLive,
      presence: {onlineCount: 0, typingUserIds: [], viewingCount: 0},
      refresh: jest.fn(),
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
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer WA');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      liveOptions!.onEvent({
        contract: {
          eventName: 'message.updated',
          legacySources: [],
          note: '',
          refreshTargets: ['inbox-detail'],
          route: '/chat/stream',
          soundIntent: 'none',
          stream: 'inbox',
        },
        payload: {
          deliveryStatus: 'delivered',
          messageId: 'msg-1',
        },
      });
    });

    expect(patchInboxMessageFromLive).toHaveBeenCalledWith('msg-1', {
      deliveryStatus: 'delivered',
    });
  });

  it('refreshes list and active detail from live events without playing sound', async () => {
    jest.useFakeTimers();
    const refreshList = jest.fn().mockResolvedValue(undefined);
    const refreshDetail = jest.fn().mockResolvedValue(undefined);
    const upsertInboxMessageFromLive = jest.fn();
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
      upsertInboxMessageFromLive,
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
        payload: {
          conversationId: 'conv-1',
          message: {
            _id: 'msg-rating',
            content: {
              text: 'Terima kasih, mohon beri rating 1-5.',
              type: 'text',
            },
            conversationId: 'conv-1',
            createdAt: '2026-07-30T08:00:00.000Z',
            direction: 'out',
            platform: 'tokopedia',
            senderName: 'System',
            senderType: 'system',
          },
        },
      });
    });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(250);
    });

    expect(refreshList).toHaveBeenCalledTimes(1);
    expect(refreshDetail).not.toHaveBeenCalled();
    expect(upsertInboxMessageFromLive).toHaveBeenCalledWith(
      expect.objectContaining({_id: 'msg-rating'}),
    );
    expect(mockSoundPlay).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('polls the active inbox detail quietly when the live stream is unhealthy', async () => {
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
          _id: 'conv-stale',
          platform: 'whatsapp',
          contactId: {displayName: 'Buyer Stale'},
          lastMessagePreview: 'Tes realtime',
          unreadCount: 0,
        },
      ],
      loading: false,
      refresh: refreshList,
      rooms: [],
      totalUnread: 0,
    });
    useDetailMock.mockReturnValue({
      ...getDefaultDetailMock(),
      conversation: {
        _id: 'conv-stale',
        assignedStaffId: {_id: 'staff-1'},
        isAiHandled: false,
        status: 'open',
      },
      loading: false,
      messages: [],
      refresh: refreshDetail,
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
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer Stale');

    await ReactTestRenderer.act(async () => {
      selectButton!.props.onPress();
      liveOptions!.onStatusChange?.('error');
    });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(refreshList).toHaveBeenCalledTimes(1);
    expect(refreshDetail).toHaveBeenCalledWith({quiet: true});
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

  it('plays sound for another conversation while viewing a different thread', async () => {
    let liveOptions:
      | Parameters<typeof useKolamChatLiveStream>[0]
      | undefined;

    useLiveStreamMock.mockImplementation(options => {
      liveOptions = options;
    });
    useReadonlyDataMock.mockReturnValue({
      conversations: [
        {
          _id: 'conv-a',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer A'},
          lastMessagePreview: 'Thread A',
          unreadCount: 0,
        },
        {
          _id: 'conv-b',
          platform: 'tokopedia',
          contactId: {displayName: 'Buyer B'},
          lastMessagePreview: 'Thread B',
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
      loading: false,
      messages: [],
      sending: false,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    const selectA = renderer!.root
      .findAllByType(KolamPressable)
      .find(node => node.props.accessibilityLabel === 'Pilih conversation Buyer A');
    await ReactTestRenderer.act(async () => {
      selectA!.props.onPress();
    });

    mockSoundPlay.mockClear();

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
          conversationId: 'conv-b',
          message: {direction: 'in'},
        },
      });
    });

    expect(mockSoundPlay).toHaveBeenCalledWith({
      intent: 'assigned',
      webSetting: expect.any(Object),
    });

    mockSoundPlay.mockClear();

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
          conversationId: 'conv-a',
          message: {direction: 'in'},
        },
      });
    });

    expect(mockSoundPlay).not.toHaveBeenCalled();
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

    expect(mockSoundPlay).not.toHaveBeenCalled();
  });
});
