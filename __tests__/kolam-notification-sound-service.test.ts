import {
  createKolamNotificationSoundService,
  KOLAM_DEFAULT_NOTIFICATION_BEEP_URI,
  resolveKolamNotificationSoundUri,
  type KolamNotificationSoundAdapter,
} from '../src/services/kolam-notification-sound-service';

describe('kolam notification sound service', () => {
  it('resolves configured sound paths by intent', () => {
    const webSetting = {
      notificationSound: 'media/audios/assigned.wav',
      unassignedNotificationSound: 'media/audios/unassigned.wav',
      handoffNotificationSound: 'media/audios/handoff.wav',
      groupCallRingtone: 'media/audios/ring.wav',
      salesNotificationSound: 'media/audios/sales.wav',
    };

    expect(
      resolveKolamNotificationSoundUri({intent: 'assigned', webSetting}),
    ).toBe('https://amfibi.dunia-anura.com/media/audios/assigned.wav');
    expect(
      resolveKolamNotificationSoundUri({intent: 'unassigned', webSetting}),
    ).toBe('https://amfibi.dunia-anura.com/media/audios/unassigned.wav');
    expect(
      resolveKolamNotificationSoundUri({intent: 'handoff', webSetting}),
    ).toBe('https://amfibi.dunia-anura.com/media/audios/handoff.wav');
    expect(
      resolveKolamNotificationSoundUri({intent: 'group-call', webSetting}),
    ).toBe('https://amfibi.dunia-anura.com/media/audios/ring.wav');
    expect(resolveKolamNotificationSoundUri({intent: 'sales', webSetting})).toBe(
      'https://amfibi.dunia-anura.com/media/audios/sales.wav',
    );
  });

  it('uses fallback beep when no configured sound exists', () => {
    expect(
      resolveKolamNotificationSoundUri({
        fallbackUri: 'fallback.wav',
        intent: 'assigned',
        webSetting: {notificationSound: ''},
      }),
    ).toBe('fallback.wav');
  });

  it('plays sounds through the supplied headless adapter', async () => {
    let now = 10_000;
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockResolvedValue(undefined),
    };
    const service = createKolamNotificationSoundService({
      adapter,
      clock: () => now,
      cooldownMs: 500,
      fallbackUri: 'fallback.wav',
      volume: 0.4,
    });

    await expect(
      service.play({
        intent: 'handoff',
        webSetting: {handoffNotificationSound: 'media/audios/handoff.wav'},
      }),
    ).resolves.toEqual({
      intent: 'handoff',
      played: true,
      uri: 'https://amfibi.dunia-anura.com/media/audios/handoff.wav',
    });

    expect(adapter.play).toHaveBeenCalledWith(
      'https://amfibi.dunia-anura.com/media/audios/handoff.wav',
      {intent: 'handoff', volume: 0.4},
    );

    now += 100;
    await expect(
      service.play({intent: 'assigned', webSetting: null}),
    ).resolves.toEqual({played: false, reason: 'cooldown'});
    expect(adapter.play).toHaveBeenCalledTimes(1);

    now += 500;
    await expect(
      service.play({intent: 'assigned', webSetting: null}),
    ).resolves.toEqual({
      intent: 'assigned',
      played: true,
      uri: 'fallback.wav',
    });
    expect(adapter.play).toHaveBeenCalledTimes(2);
  });

  it('does nothing for none intent', async () => {
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockResolvedValue(undefined),
    };
    const service = createKolamNotificationSoundService({adapter});

    await expect(
      service.play({intent: 'none', webSetting: null}),
    ).resolves.toEqual({played: false, reason: 'none'});
    expect(adapter.play).not.toHaveBeenCalled();
  });

  it('uses local fallback immediately when preferInstantLocal and uri is remote', async () => {
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockResolvedValue(undefined),
    };
    const service = createKolamNotificationSoundService({
      adapter,
      fallbackUri: 'fallback.wav',
    });

    await expect(
      service.play({
        intent: 'assigned',
        preferInstantLocal: true,
        webSetting: {notificationSound: 'media/audios/assigned.wav'},
      }),
    ).resolves.toEqual({
      intent: 'assigned',
      played: true,
      uri: 'fallback.wav',
    });
    expect(adapter.play).toHaveBeenCalledWith('fallback.wav', {
      intent: 'assigned',
      volume: 0.5,
    });
  });

  it('exports the default beep as a data audio URI for native fallback', () => {
    expect(KOLAM_DEFAULT_NOTIFICATION_BEEP_URI).toMatch(/^data:audio\/wav/);
  });
});
