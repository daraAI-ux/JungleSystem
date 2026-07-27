import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamChatRailLiveSync} from '../src/hooks/use-kolam-chat-rail-live-sync';
import type {KolamChatLiveClassification} from '../src/domain/kolam-chat-live-classifier';

const listOnlyClassification: KolamChatLiveClassification = {
  eventName: 'conversation.updated',
  isForSelectedDetail: false,
  refreshCallState: false,
  refreshDetail: false,
  refreshList: true,
  refreshPresence: false,
  refreshTargets: ['inbox-list'],
  soundIntent: 'none',
  stream: 'inbox',
};

const listAndDetailClassification: KolamChatLiveClassification = {
  ...listOnlyClassification,
  eventName: 'message.created',
  isForSelectedDetail: true,
  refreshDetail: true,
  refreshTargets: ['inbox-list', 'inbox-detail', 'unread-badge'],
  targetId: 'conv-1',
};

function LiveSyncProbe({
  onReady,
  refreshDetail,
  refreshList,
}: {
  onReady: (sync: ReturnType<typeof useKolamChatRailLiveSync>) => void;
  refreshDetail: () => Promise<void>;
  refreshList: () => Promise<void>;
}) {
  const sync = useKolamChatRailLiveSync({
    debounceMs: 100,
    refreshDetail,
    refreshList,
  });
  onReady(sync);

  return null;
}

describe('useKolamChatRailLiveSync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('coalesces repeated live list refreshes', async () => {
    const refreshList = jest.fn().mockResolvedValue(undefined);
    const refreshDetail = jest.fn().mockResolvedValue(undefined);
    let sync: ReturnType<typeof useKolamChatRailLiveSync> | undefined;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <LiveSyncProbe
          onReady={value => {
            sync = value;
          }}
          refreshDetail={refreshDetail}
          refreshList={refreshList}
        />,
      );
    });

    sync!.syncFromLiveClassification(listOnlyClassification);
    sync!.syncFromLiveClassification(listOnlyClassification);
    sync!.syncFromLiveClassification(listOnlyClassification);

    expect(refreshList).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(refreshList).toHaveBeenCalledTimes(1);
    expect(refreshDetail).not.toHaveBeenCalled();
  });

  it('runs list and detail refreshes from a matching detail event', async () => {
    const refreshList = jest.fn().mockResolvedValue(undefined);
    const refreshDetail = jest.fn().mockResolvedValue(undefined);
    let sync: ReturnType<typeof useKolamChatRailLiveSync> | undefined;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <LiveSyncProbe
          onReady={value => {
            sync = value;
          }}
          refreshDetail={refreshDetail}
          refreshList={refreshList}
        />,
      );
    });

    sync!.syncFromLiveClassification(listAndDetailClassification);

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(refreshList).toHaveBeenCalledTimes(1);
    expect(refreshDetail).toHaveBeenCalledTimes(1);
  });
});
