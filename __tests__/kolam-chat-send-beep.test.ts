import {
  playKolamChatSendBeep,
  resolveKolamChatSendBeepUri,
} from '../src/services/kolam-chat-send-beep';
import type {KolamNotificationSoundAdapter} from '../src/services/kolam-notification-sound-service';

describe('kolam chat send beep', () => {
  it('resolves the local send beep asset URI', () => {
    const resolveAssetSource = jest.fn(() => ({
      height: 0,
      scale: 1,
      uri: 'asset:/chat-send-beep.wav',
      width: 0,
    }));

    expect(resolveKolamChatSendBeepUri(resolveAssetSource)).toBe(
      'asset:/chat-send-beep.wav',
    );
  });

  it('plays the send beep through the supplied adapter', async () => {
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      playKolamChatSendBeep({
        adapter,
        resolveAssetSource: () => ({
          height: 0,
          scale: 1,
          uri: 'asset:/chat-send-beep.wav',
          width: 0,
        }),
        volume: 0.3,
      }),
    ).resolves.toEqual({
      played: true,
      uri: 'asset:/chat-send-beep.wav',
    });

    expect(adapter.play).toHaveBeenCalledWith('asset:/chat-send-beep.wav', {
      intent: 'assigned',
      volume: 0.3,
    });
  });

  it('does not throw when playback is unavailable', async () => {
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockRejectedValue(new Error('no runtime')),
    };

    await expect(
      playKolamChatSendBeep({
        adapter,
        resolveAssetSource: () => ({
          height: 0,
          scale: 1,
          uri: 'asset:/chat-send-beep.wav',
          width: 0,
        }),
      }),
    ).resolves.toEqual({played: false, reason: 'playback-failed'});
  });
});
