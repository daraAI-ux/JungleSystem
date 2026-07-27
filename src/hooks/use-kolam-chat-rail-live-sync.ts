import {useCallback, useEffect, useRef} from 'react';
import type {KolamChatLiveClassification} from '../domain/kolam-chat-live-classifier';

export type KolamChatRailLiveSyncOptions = {
  debounceMs?: number;
  refreshDetail: () => Promise<void> | void;
  refreshList: () => Promise<void> | void;
};

export function useKolamChatRailLiveSync({
  debounceMs = 250,
  refreshDetail,
  refreshList,
}: KolamChatRailLiveSyncOptions) {
  const listTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearListTimer = useCallback(() => {
    if (!listTimerRef.current) {
      return;
    }

    clearTimeout(listTimerRef.current);
    listTimerRef.current = null;
  }, []);

  const clearDetailTimer = useCallback(() => {
    if (!detailTimerRef.current) {
      return;
    }

    clearTimeout(detailTimerRef.current);
    detailTimerRef.current = null;
  }, []);

  const scheduleListRefresh = useCallback(() => {
    clearListTimer();
    listTimerRef.current = setTimeout(() => {
      listTimerRef.current = null;
      Promise.resolve(refreshList()).catch(() => undefined);
    }, debounceMs);
  }, [clearListTimer, debounceMs, refreshList]);

  const scheduleDetailRefresh = useCallback(() => {
    clearDetailTimer();
    detailTimerRef.current = setTimeout(() => {
      detailTimerRef.current = null;
      Promise.resolve(refreshDetail()).catch(() => undefined);
    }, debounceMs);
  }, [clearDetailTimer, debounceMs, refreshDetail]);

  const syncFromLiveClassification = useCallback(
    (classification: KolamChatLiveClassification) => {
      if (classification.refreshList) {
        scheduleListRefresh();
      }

      if (classification.refreshDetail) {
        scheduleDetailRefresh();
      }
    },
    [scheduleDetailRefresh, scheduleListRefresh],
  );

  useEffect(
    () => () => {
      clearListTimer();
      clearDetailTimer();
    },
    [clearDetailTimer, clearListTimer],
  );

  return {
    syncFromLiveClassification,
  };
}
