import {resolveKolamChatUnreadRiseSoundIntents} from '../src/hooks/use-kolam-chat-notification-host';

describe('resolveKolamChatUnreadRiseSoundIntents', () => {
  it('skips the first unread snapshot so login does not ding', () => {
    expect(
      resolveKolamChatUnreadRiseSoundIntents({
        previous: null,
        next: {inbox: 3, team: 1},
        visibleRailMode: null,
      }),
    ).toEqual([]);
  });

  it('dings for inbox and team rises when those rails are closed', () => {
    expect(
      resolveKolamChatUnreadRiseSoundIntents({
        previous: {inbox: 1, team: 0},
        next: {inbox: 2, team: 1},
        visibleRailMode: null,
      }),
    ).toEqual(['assigned', 'assigned']);
  });

  it('skips the open rail stream and still dings the other', () => {
    expect(
      resolveKolamChatUnreadRiseSoundIntents({
        previous: {inbox: 1, team: 0},
        next: {inbox: 4, team: 2},
        visibleRailMode: 'inbox',
      }),
    ).toEqual(['assigned']);
  });

  it('stays silent when unread does not rise', () => {
    expect(
      resolveKolamChatUnreadRiseSoundIntents({
        previous: {inbox: 2, team: 2},
        next: {inbox: 2, team: 1},
        visibleRailMode: null,
      }),
    ).toEqual([]);
  });
});
