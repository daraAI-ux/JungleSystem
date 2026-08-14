import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamChatRailDetail} from '../src/hooks/use-kolam-chat-rail-detail';
import {
  getKolamChatConversation,
  getKolamChatMessages,
  getKolamRoomActiveTeamChatCall,
  getKolamTeamChatCallConfig,
  getKolamTeamChatMembers,
  getKolamTeamChatMessages,
  markKolamChatConversationRead,
  markKolamTeamChatRoomRead,
  postKolamTeamChatPresence,
} from '../src/services/kolam-api';

jest.mock('../src/services/kolam-api', () => ({
  editKolamChatMessage: jest.fn(),
  editKolamTeamChatMessage: jest.fn(),
  getKolamChatConversation: jest.fn(),
  getKolamChatMessages: jest.fn(),
  getKolamRoomActiveTeamChatCall: jest.fn(),
  getKolamTeamChatCallConfig: jest.fn(),
  getKolamTeamChatMembers: jest.fn(),
  getKolamTeamChatMessages: jest.fn(),
  markKolamChatConversationRead: jest.fn(),
  markKolamTeamChatRoomRead: jest.fn(),
  postKolamTeamChatPresence: jest.fn(),
  purgeKolamTeamChatRoomMessages: jest.fn(),
  reactToKolamTeamChatMessage: jest.fn(),
  searchKolamTeamChatMessages: jest.fn(),
  sendKolamChatTextMessage: jest.fn(),
  sendKolamTeamChatMessage: jest.fn(),
}));

const getTeamMessagesMock = getKolamTeamChatMessages as jest.Mock;
const getTeamMembersMock = getKolamTeamChatMembers as jest.Mock;
const markTeamReadMock = markKolamTeamChatRoomRead as jest.Mock;
const getConversationMock = getKolamChatConversation as jest.Mock;
const getInboxMessagesMock = getKolamChatMessages as jest.Mock;
const markInboxReadMock = markKolamChatConversationRead as jest.Mock;
const postPresenceMock = postKolamTeamChatPresence as jest.Mock;
const getCallConfigMock = getKolamTeamChatCallConfig as jest.Mock;
const getActiveCallMock = getKolamRoomActiveTeamChatCall as jest.Mock;

function DetailProbe({
  mode,
  onMarkedRead,
  selectedId,
}: {
  mode: 'inbox' | 'team-chat';
  onMarkedRead?: (id: string) => void;
  selectedId: string | null;
}) {
  const detail = useKolamChatRailDetail({
    currentUserId: 'staff-1',
    mode,
    onMarkedRead,
    selectedId,
  });

  return (
    <Text>{`${detail.loading ? 'loading' : 'ready'}:${detail.messages.length}`}</Text>
  );
}

describe('useKolamChatRailDetail mark-read invalidate', () => {
  beforeEach(() => {
    getTeamMessagesMock.mockResolvedValue([
      {
        _id: 'msg-1',
        body: 'Halo',
        createdAt: '2026-08-14T10:00:00.000Z',
        sender: {_id: 'other', first_name: 'Maya'},
      },
    ]);
    getTeamMembersMock.mockResolvedValue({
      bots: [],
      daraReplyEnabled: false,
      members: [],
    });
    markTeamReadMock.mockResolvedValue(undefined);
    getConversationMock.mockResolvedValue({
      _id: 'conv-1',
      platform: 'store',
      status: 'open',
    });
    getInboxMessagesMock.mockResolvedValue([
      {
        _id: 'msg-inbox',
        content: {text: 'Hi', type: 'text'},
        createdAt: '2026-08-14T10:00:00.000Z',
        direction: 'in',
      },
    ]);
    markInboxReadMock.mockResolvedValue(undefined);
    postPresenceMock.mockResolvedValue(null);
    getCallConfigMock.mockResolvedValue({enabled: false});
    getActiveCallMock.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('notifies onMarkedRead after team room open mark-read', async () => {
    const onMarkedRead = jest.fn();

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DetailProbe
          mode="team-chat"
          onMarkedRead={onMarkedRead}
          selectedId="room-1"
        />,
      );
    });

    expect(markTeamReadMock).toHaveBeenCalledWith('room-1');
    expect(onMarkedRead).toHaveBeenCalledWith('room-1');
  });

  it('skips onMarkedRead during quiet team refresh', async () => {
    const onMarkedRead = jest.fn();
    let refresh: ((options?: {quiet?: boolean}) => Promise<void>) | null =
      null;

    function Probe() {
      const detail = useKolamChatRailDetail({
        currentUserId: 'staff-1',
        mode: 'team-chat',
        onMarkedRead,
        selectedId: 'room-1',
      });
      refresh = detail.refresh;
      return <Text>{detail.loading ? 'loading' : 'ready'}</Text>;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Probe />);
    });
    onMarkedRead.mockClear();
    markTeamReadMock.mockClear();

    await ReactTestRenderer.act(async () => {
      await refresh!({quiet: true});
    });

    expect(markTeamReadMock).toHaveBeenCalledWith('room-1');
    expect(onMarkedRead).not.toHaveBeenCalled();
  });

  it('notifies onMarkedRead after inbox conversation open mark-read', async () => {
    const onMarkedRead = jest.fn();

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DetailProbe
          mode="inbox"
          onMarkedRead={onMarkedRead}
          selectedId="conv-1"
        />,
      );
    });

    expect(markInboxReadMock).toHaveBeenCalledWith('conv-1');
    expect(onMarkedRead).toHaveBeenCalledWith('conv-1');
  });
});
