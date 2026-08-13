import {KOLAM_DEFAULT_NOTIFICATION_BEEP_URI} from '../src/services/kolam-notification-sound-service';
import {playKolamChatSendBeep} from '../src/services/kolam-chat-send-beep';
import type {KolamNotificationSoundAdapter} from '../src/services/kolam-notification-sound-service';

describe('kolam chat send beep', () => {
  it('plays the same default beep URI as Settings tes suara', async () => {
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      playKolamChatSendBeep({
        adapter,
        volume: 0.5,
      }),
    ).resolves.toEqual({
      played: true,
      uri: KOLAM_DEFAULT_NOTIFICATION_BEEP_URI,
    });

    expect(adapter.play).toHaveBeenCalledWith(
      KOLAM_DEFAULT_NOTIFICATION_BEEP_URI,
      {
        intent: 'assigned',
        volume: 0.5,
      },
    );
  });

  it('does not throw when playback is unavailable', async () => {
    const adapter: KolamNotificationSoundAdapter = {
      play: jest.fn().mockRejectedValue(new Error('no runtime')),
    };

    await expect(playKolamChatSendBeep({adapter})).resolves.toEqual({
      played: false,
      reason: 'playback-failed',
    });
  });
});
