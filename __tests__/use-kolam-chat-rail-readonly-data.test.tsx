import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import {useKolamChatRailReadonlyData} from '../src/hooks/use-kolam-chat-rail-readonly-data';
import {
  getKolamChatConversations,
  getKolamTeamChatRooms,
} from '../src/services/kolam-api';

jest.mock('../src/services/kolam-api', () => ({
  getKolamChatConversations: jest.fn(),
  getKolamTeamChatRooms: jest.fn(),
}));

const getConversationsMock = getKolamChatConversations as jest.Mock;
const getTeamRoomsMock = getKolamTeamChatRooms as jest.Mock;

function ReadonlyDataProbe({
  mode = 'inbox',
}: {
  mode?: 'inbox' | 'team-chat';
}) {
  const state = useKolamChatRailReadonlyData({intervalMs: 60_000, mode});

  return <Text>{`${state.conversations.length}:${state.totalUnread}`}</Text>;
}

describe('useKolamChatRailReadonlyData', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    getConversationsMock.mockResolvedValue([
      {_id: 'conv-read', unreadCount: 0},
      {_id: 'conv-unread', unreadCount: 3},
    ]);
    getTeamRoomsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('loads all inbox conversations by default without hidden unread or status filters', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ReadonlyDataProbe />);
    });

    expect(getConversationsMock).toHaveBeenCalledWith({limit: 100});
    expect(getConversationsMock).not.toHaveBeenCalledWith(
      expect.objectContaining({unreadOnly: true}),
    );
    expect(getConversationsMock).not.toHaveBeenCalledWith(
      expect.objectContaining({status: 'open'}),
    );
    expect(renderer!.toJSON()).toEqual({
      children: ['2:3'],
      props: {},
      type: 'Text',
    });
  });
});
