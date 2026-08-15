import {
  createKolamGroupCallRingtoneController,
  stopSharedKolamGroupCallRingtone,
} from '../src/services/kolam-group-call-ringtone';

describe('kolam group call ringtone controller', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    stopSharedKolamGroupCallRingtone();
    jest.useRealTimers();
  });

  it('loops group-call playback while started and stops cleanly', async () => {
    const play = jest.fn().mockResolvedValue({
      played: true,
      intent: 'group-call',
      uri: 'x',
    });
    const stopPlayback = jest.fn().mockResolvedValue(undefined);
    const controller = createKolamGroupCallRingtoneController({
      createSoundService: () => ({play}),
      intervalMs: 1000,
      stopPlayback,
    });

    controller.setRingtonePath('/media/ring.wav');
    controller.start();
    expect(play).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith(
      expect.objectContaining({
        bypassCooldown: true,
        intent: 'group-call',
        preferInstantLocal: false,
      }),
    );

    await jest.advanceTimersByTimeAsync(1000);
    expect(play).toHaveBeenCalledTimes(2);

    controller.stop();
    expect(stopPlayback).toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(2000);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('cancels in-flight play that finishes after stop', async () => {
    let resolvePlay: (() => void) | undefined;
    const play = jest.fn(
      () =>
        new Promise(resolve => {
          resolvePlay = () => resolve({played: true, intent: 'group-call', uri: 'x'});
        }),
    );
    const stopPlayback = jest.fn().mockResolvedValue(undefined);
    const controller = createKolamGroupCallRingtoneController({
      createSoundService: () => ({play}),
      intervalMs: 1000,
      stopPlayback,
    });

    controller.start();
    expect(play).toHaveBeenCalledTimes(1);

    controller.stop();
    expect(stopPlayback).toHaveBeenCalledTimes(1);

    resolvePlay?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(stopPlayback).toHaveBeenCalledTimes(2);
  });
});
