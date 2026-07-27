import {
  createKolamRuntimeNotificationSoundAdapter,
  getKolamNotificationSoundNativeBridge,
  getKolamNotificationSoundRuntimePath,
  playKolamRuntimeNotificationSound,
} from '../src/services/kolam-notification-sound-runtime';

describe('kolam notification sound runtime', () => {
  it('detects the future Windows native notification sound bridge', () => {
    const nativeModules = {
      KolamWindowsNotificationSound: {
        playNotificationSound: jest.fn(),
      },
    };

    expect(
      getKolamNotificationSoundNativeBridge({
        nativeModules,
        platformOS: 'windows',
      }),
    ).toBe(nativeModules.KolamWindowsNotificationSound);
    expect(
      getKolamNotificationSoundRuntimePath({
        nativeModules,
        platformOS: 'windows',
      }),
    ).toBe('native-windows');
  });

  it('delegates playback to the Windows native bridge when available', async () => {
    const playNotificationSound = jest.fn().mockResolvedValue(undefined);

    await expect(
      playKolamRuntimeNotificationSound(
        'https://cdn.test/sound.wav',
        {intent: 'handoff', volume: 2},
        {
          nativeModules: {
            KolamWindowsNotificationSound: {playNotificationSound},
          },
          platformOS: 'windows',
        },
      ),
    ).resolves.toBe('native-windows');

    expect(playNotificationSound).toHaveBeenCalledWith(
      'https://cdn.test/sound.wav',
      {intent: 'handoff', volume: 1},
    );
  });

  it('falls back to headless Audio without rendering a player', async () => {
    const play = jest.fn().mockResolvedValue(undefined);
    const audio = {play};
    const audioFactory = jest.fn(() => audio);

    await expect(
      playKolamRuntimeNotificationSound(
        'data:audio/wav;base64,abc',
        {intent: 'assigned', volume: 0.35},
        {audioFactory, platformOS: 'ios'},
      ),
    ).resolves.toBe('web-audio');

    expect(audioFactory).toHaveBeenCalledWith('data:audio/wav;base64,abc');
    expect(audio).toEqual(
      expect.objectContaining({
        currentTime: 0,
        volume: 0.35,
      }),
    );
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('resolves unsupported when no runtime playback path exists', async () => {
    await expect(
      playKolamRuntimeNotificationSound(
        'https://cdn.test/sound.wav',
        {intent: 'sales', volume: Number.NaN},
        {nativeModules: {}, platformOS: 'windows'},
      ),
    ).resolves.toBe('unsupported');
  });

  it('creates an adapter compatible with the headless sound service', async () => {
    const playSound = jest.fn().mockResolvedValue(undefined);
    const adapter = createKolamRuntimeNotificationSoundAdapter({
      nativeModules: {
        KolamNotificationSound: {playSound},
      },
      platformOS: 'windows',
    });

    await adapter.play('https://cdn.test/ring.wav', {
      intent: 'group-call',
      volume: 0.8,
    });

    expect(playSound).toHaveBeenCalledWith('https://cdn.test/ring.wav', {
      intent: 'group-call',
      volume: 0.8,
    });
  });
});
