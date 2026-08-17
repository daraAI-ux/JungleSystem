import {
  applyKolamTeamChatReadConfirmUnreadZero,
  clearKolamTeamChatRoomReadConfirm,
  confirmKolamTeamChatRoomRead,
  isKolamTeamChatRoomReadConfirmed,
  noteKolamTeamChatLiveMessageForReadConfirm,
  resetKolamTeamChatReadConfirmForTests,
} from '../src/domain/kolam-team-chat-read-confirm';

describe('kolam-team-chat-read-confirm', () => {
  afterEach(() => {
    resetKolamTeamChatReadConfirmForTests();
  });

  it('zeros confirmed rooms until a live message arrives while not viewing', () => {
    confirmKolamTeamChatRoomRead('room-dara');
    expect(isKolamTeamChatRoomReadConfirmed('room-dara')).toBe(true);
    expect(
      applyKolamTeamChatReadConfirmUnreadZero([
        {_id: 'room-dara', unreadCount: 42},
        {_id: 'room-general', unreadCount: 3},
      ]),
    ).toEqual([
      {_id: 'room-dara', unreadCount: 0},
      {_id: 'room-general', unreadCount: 3},
    ]);

    noteKolamTeamChatLiveMessageForReadConfirm({
      roomId: 'room-dara',
      viewingRoomIds: ['room-dara'],
    });
    expect(isKolamTeamChatRoomReadConfirmed('room-dara')).toBe(true);

    noteKolamTeamChatLiveMessageForReadConfirm({
      roomId: 'room-dara',
      viewingRoomIds: [],
    });
    expect(isKolamTeamChatRoomReadConfirmed('room-dara')).toBe(false);
    expect(
      applyKolamTeamChatReadConfirmUnreadZero([
        {_id: 'room-dara', unreadCount: 1},
      ]),
    ).toEqual([{_id: 'room-dara', unreadCount: 1}]);
  });

  it('clear removes confirmation immediately', () => {
    confirmKolamTeamChatRoomRead('room-a');
    clearKolamTeamChatRoomReadConfirm('room-a');
    expect(isKolamTeamChatRoomReadConfirmed('room-a')).toBe(false);
  });
});
