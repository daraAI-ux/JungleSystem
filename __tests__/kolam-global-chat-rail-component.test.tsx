import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamGlobalChatRail} from '../src/components/kolam-global-chat-rail';
import {useKolamChatRailReadonlyData} from '../src/hooks/use-kolam-chat-rail-readonly-data';

jest.mock('../src/hooks/use-kolam-chat-rail-readonly-data', () => ({
  useKolamChatRailReadonlyData: jest.fn(),
}));

const useReadonlyDataMock = useKolamChatRailReadonlyData as jest.MockedFunction<
  typeof useKolamChatRailReadonlyData
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
    useReadonlyDataMock.mockReturnValue({
      conversations: [],
      loading: false,
      rooms: [],
      totalUnread: 0,
    });
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
});
