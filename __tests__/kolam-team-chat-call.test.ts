import {
  canManageKolamTeamChatCall,
  canMuteKolamTeamChatCallParticipants,
  canRequestKolamTeamChatCallMediaToken,
  formatKolamTeamChatCallHandoverNotice,
  formatKolamTeamChatCallOnlineLabel,
  getKolamTeamChatCallParticipantUserId,
  isKolamTeamChatCallMediaReady,
  isKolamTeamChatCallParticipantMuted,
  isKolamTeamChatCallRingingForMe,
  isKolamTeamChatCallWaitingRingbackForMe,
  formatKolamTeamChatCallParticipantRowLabel,
  formatKolamTeamChatCallParticipantStatusLabel,
  resolveKolamTeamChatCallParticipantDisplayName,
  pickPrimaryKolamTeamChatCall,
  withKolamTeamChatCallMyParticipantStatus,
} from '../src/domain/kolam-team-chat-call';
import type {KolamTeamChatCall} from '../src/services/kolam-api';

describe('kolam-team-chat-call domain', () => {
  it('reads userId with legacy user dual-read', () => {
    expect(
      getKolamTeamChatCallParticipantUserId({
        status: 'joined',
        userId: 'u-1',
      }),
    ).toBe('u-1');
    expect(
      getKolamTeamChatCallParticipantUserId({
        status: 'joined',
        user: 'u-legacy',
      }),
    ).toBe('u-legacy');
    expect(
      getKolamTeamChatCallParticipantUserId({
        status: 'joined',
        user: {_id: 'u-obj'},
      }),
    ).toBe('u-obj');
  });

  it('reads mutedByAdmin with legacy muted dual-read', () => {
    expect(
      isKolamTeamChatCallParticipantMuted({
        mutedByAdmin: true,
        status: 'joined',
        userId: 'u-1',
      }),
    ).toBe(true);
    expect(
      isKolamTeamChatCallParticipantMuted({
        muted: true,
        status: 'joined',
        userId: 'u-1',
      }),
    ).toBe(true);
    expect(
      isKolamTeamChatCallParticipantMuted({
        mutedByAdmin: false,
        muted: true,
        status: 'joined',
        userId: 'u-1',
      }),
    ).toBe(false);
  });

  it('detects ringing-for-me and picks primary call', () => {
    const ringing: KolamTeamChatCall = {
      _id: 'c-ring',
      participants: [{status: 'ringing', userId: 'me'}],
      status: 'ringing',
    };
    const active: KolamTeamChatCall = {
      _id: 'c-active',
      participants: [{status: 'joined', userId: 'me'}],
      status: 'active',
    };

    expect(isKolamTeamChatCallRingingForMe(ringing, 'me')).toBe(true);
    expect(isKolamTeamChatCallRingingForMe(active, 'me')).toBe(false);
    expect(pickPrimaryKolamTeamChatCall([active, ringing], 'me')?._id).toBe(
      'c-ring',
    );
  });

  it('plays ringback for joined host while call is still ringing', () => {
    const hostWaiting: KolamTeamChatCall = {
      _id: 'c-wait',
      participants: [
        {status: 'joined', userId: 'host'},
        {status: 'ringing', userId: 'peer'},
      ],
      status: 'ringing',
    };
    const invitee: KolamTeamChatCall = {
      _id: 'c-invite',
      participants: [
        {status: 'joined', userId: 'host'},
        {status: 'ringing', userId: 'peer'},
      ],
      status: 'ringing',
    };
    const active: KolamTeamChatCall = {
      _id: 'c-active',
      participants: [
        {status: 'joined', userId: 'host'},
        {status: 'joined', userId: 'peer'},
      ],
      status: 'active',
    };

    expect(isKolamTeamChatCallWaitingRingbackForMe(hostWaiting, 'host')).toBe(
      true,
    );
    expect(isKolamTeamChatCallWaitingRingbackForMe(invitee, 'peer')).toBe(
      false,
    );
    expect(isKolamTeamChatCallRingingForMe(invitee, 'peer')).toBe(true);
    expect(isKolamTeamChatCallWaitingRingbackForMe(active, 'host')).toBe(false);
  });

  it('stops host ringback once another peer has joined even if status lags', () => {
    const statusLag: KolamTeamChatCall = {
      _id: 'c-lag',
      onlineInCall: 1,
      participants: [
        {status: 'joined', userId: 'host'},
        {status: 'joined', userId: 'peer'},
        {status: 'ringing', userId: 'other'},
      ],
      status: 'ringing',
    };
    const countSaysTwo: KolamTeamChatCall = {
      _id: 'c-count',
      onlineInCall: 2,
      participants: [
        {status: 'joined', userId: 'host'},
        {status: 'ringing', userId: 'peer'},
      ],
      status: 'ringing',
    };

    expect(isKolamTeamChatCallWaitingRingbackForMe(statusLag, 'host')).toBe(
      false,
    );
    expect(isKolamTeamChatCallRingingForMe(statusLag, 'other')).toBe(true);
    expect(isKolamTeamChatCallWaitingRingbackForMe(countSaysTwo, 'host')).toBe(
      false,
    );
  });

  it('resolves participant display name from room members and status label', () => {
    const participant = {
      status: 'ringing' as const,
      userId: 'u-peer',
    };
    const members = [
      {
        _id: 'u-peer',
        first_name: 'Budi',
        last_name: 'Santoso',
        username: 'budi',
      },
    ];

    expect(
      resolveKolamTeamChatCallParticipantDisplayName({
        participant,
        members,
      }),
    ).toBe('Budi Santoso');
    expect(formatKolamTeamChatCallParticipantStatusLabel('ringing')).toBe(
      'Memanggil',
    );
    expect(
      formatKolamTeamChatCallParticipantRowLabel({
        participant,
        members,
      }),
    ).toBe('Budi Santoso · Memanggil');
    expect(
      resolveKolamTeamChatCallParticipantDisplayName({
        participant: {status: 'joined', userId: 'unknown'},
        members,
      }),
    ).toBe('Peserta');
  });

  it('gates manage vs mute roles', () => {
    const call: KolamTeamChatCall = {
      _id: 'c-1',
      startedBy: 'host-1',
      status: 'active',
    };

    expect(
      canManageKolamTeamChatCall({
        call,
        userId: 'host-1',
      }),
    ).toBe(true);
    expect(
      canManageKolamTeamChatCall({
        call,
        members: [{_id: 'admin-1', role: 'admin'}],
        userId: 'admin-1',
      }),
    ).toBe(true);
    expect(
      canManageKolamTeamChatCall({
        call,
        userId: 'member-1',
      }),
    ).toBe(false);

    expect(
      canMuteKolamTeamChatCallParticipants({
        userId: 'host-1',
      }),
    ).toBe(false);
    expect(
      canMuteKolamTeamChatCallParticipants({
        members: [{_id: 'host-1', role: 'admin'}],
        userId: 'host-1',
      }),
    ).toBe(true);
  });

  it('formats onlineInCall strip label and handover notice', () => {
    expect(
      formatKolamTeamChatCallOnlineLabel({
        _id: 'c-1',
        onlineInCall: 4,
        participantCount: 9,
        status: 'active',
      }),
    ).toBe('Call · 4 online');
    expect(
      formatKolamTeamChatCallOnlineLabel(
        {
          _id: 'c-1',
          onlineInCall: 1,
          status: 'ringing',
        },
        {countdownSeconds: 12},
      ),
    ).toBe('Call · 1 online · 12s');
    expect(formatKolamTeamChatCallHandoverNotice('abcdefghijklmnop')).toBe(
      'Handover token: abcdefghijkl…',
    );
  });

  it('forces local participant status after join so ringing stops', () => {
    const call: KolamTeamChatCall = {
      _id: 'c-1',
      participants: [{status: 'ringing', userId: 'me'}],
      status: 'ringing',
    };
    const joined = withKolamTeamChatCallMyParticipantStatus(call, 'me', 'joined');
    expect(isKolamTeamChatCallRingingForMe(joined, 'me')).toBe(false);
    expect(joined?.participants?.[0]?.status).toBe('joined');
  });

  it('gates LiveKit media-token on config.media and joined status', () => {
    expect(
      isKolamTeamChatCallMediaReady({
        enabled: true,
        media: {enabled: false, url: 'wss://lk.example'},
      }),
    ).toBe(false);
    expect(
      isKolamTeamChatCallMediaReady({
        enabled: true,
        media: {enabled: true, url: 'wss://lk.example'},
      }),
    ).toBe(true);

    const joined: KolamTeamChatCall = {
      _id: 'c-1',
      participants: [{status: 'joined', userId: 'me'}],
      status: 'active',
    };
    const ringing: KolamTeamChatCall = {
      _id: 'c-1',
      participants: [{status: 'ringing', userId: 'me'}],
      status: 'ringing',
    };
    const readyConfig = {
      enabled: true,
      media: {enabled: true, url: 'wss://lk.example', maxParticipants: 8, audioOnly: true},
    };

    expect(
      canRequestKolamTeamChatCallMediaToken({
        call: joined,
        config: readyConfig,
        userId: 'me',
      }),
    ).toBe(true);
    expect(
      canRequestKolamTeamChatCallMediaToken({
        call: ringing,
        config: readyConfig,
        userId: 'me',
      }),
    ).toBe(false);
    expect(
      canRequestKolamTeamChatCallMediaToken({
        call: joined,
        config: {enabled: true, media: {enabled: false}},
        userId: 'me',
      }),
    ).toBe(false);
  });
});
