import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamNotificationSoundSettings} from '../src/hooks/use-kolam-notification-sound-settings';
import {getKolamWebSetting} from '../src/services/kolam-api';

jest.mock('../src/services/kolam-api', () => ({
  getKolamWebSetting: jest.fn(),
}));

const getWebSettingMock = getKolamWebSetting as jest.MockedFunction<
  typeof getKolamWebSetting
>;

function SettingsProbe({
  onState,
}: {
  onState: (
    state: ReturnType<typeof useKolamNotificationSoundSettings>,
  ) => void;
}) {
  const state = useKolamNotificationSoundSettings({intervalMs: 60_000});
  onState(state);

  return null;
}

describe('useKolamNotificationSoundSettings', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    getWebSettingMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads only notification sound fields from web settings', async () => {
    const states: Array<ReturnType<typeof useKolamNotificationSoundSettings>> =
      [];
    getWebSettingMock.mockResolvedValue({
      groupCallRingtone: 'media/audios/ring.wav',
      handoffNotificationSound: 'media/audios/handoff.wav',
      notificationSound: 'media/audios/assigned.wav',
      salesNotificationSound: 'media/audios/sales.wav',
      unassignedNotificationSound: 'media/audios/unassigned.wav',
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SettingsProbe onState={state => states.push(state)} />,
      );
    });

    expect(states.at(-1)).toEqual({
      loading: false,
      webSetting: {
        groupCallRingtone: 'media/audios/ring.wav',
        handoffNotificationSound: 'media/audios/handoff.wav',
        notificationSound: 'media/audios/assigned.wav',
        salesNotificationSound: 'media/audios/sales.wav',
        unassignedNotificationSound: 'media/audios/unassigned.wav',
      },
    });
  });

  it('keeps null settings when loading fails so sound can use fallback beep', async () => {
    const states: Array<ReturnType<typeof useKolamNotificationSoundSettings>> =
      [];
    getWebSettingMock.mockRejectedValue(new Error('offline'));

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SettingsProbe onState={state => states.push(state)} />,
      );
    });

    expect(states.at(-1)).toEqual({
      loading: false,
      webSetting: null,
    });
  });
});
