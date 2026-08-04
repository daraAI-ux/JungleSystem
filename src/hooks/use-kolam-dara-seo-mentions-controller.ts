import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoMentionRow,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraSeoBrandMentions,
  fetchKolamDaraSeoSerpKeyword,
  ingestKolamDaraSeoBacklink,
  ingestKolamDaraSeoCompetitor,
} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoMentionsController {
  backlinkUrl: string;
  busy: boolean;
  competitor: string;
  error: string | null;
  keyword: string;
  loading: boolean;
  notice: string | null;
  rows: KolamDaraSeoMentionRow[];
  onIngestBacklink: () => Promise<void>;
  onIngestCompetitor: () => Promise<void>;
  onFetchSerp: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSetBacklinkUrl: (value: string) => void;
  onSetCompetitor: (value: string) => void;
  onSetKeyword: (value: string) => void;
}

export function useKolamDaraSeoMentionsController(
  route: string,
): KolamDaraSeoMentionsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'mentions';
  const [rows, setRows] = useState<KolamDaraSeoMentionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [competitor, setCompetitor] = useState('');
  const [backlinkUrl, setBacklinkUrl] = useState('');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchKolamDaraSeoBrandMentions());
    } catch (err) {
      setRows([]);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat mentions',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const runBusy = useCallback(
    async (fn: () => Promise<void>, successNotice: string) => {
      setBusy(true);
      setNotice(null);
      try {
        await fn();
        setNotice(successNotice);
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal menyimpan',
        );
      } finally {
        setBusy(false);
      }
    },
    [onRefresh],
  );

  return {
    backlinkUrl,
    busy,
    competitor,
    error,
    keyword,
    loading,
    notice,
    rows,
    onFetchSerp: async () => {
      const value = keyword.trim();
      if (!value) {
        setNotice('Isi keyword dulu');
        return;
      }
      await runBusy(async () => {
        await fetchKolamDaraSeoSerpKeyword(value);
        setKeyword('');
      }, `SERP "${value}" tersimpan`);
    },
    onIngestCompetitor: async () => {
      const value = competitor.trim();
      if (!value) {
        setNotice('Isi nama kompetitor');
        return;
      }
      await runBusy(async () => {
        await ingestKolamDaraSeoCompetitor(value);
        setCompetitor('');
      }, `Kompetitor "${value}" tercatat`);
    },
    onIngestBacklink: async () => {
      const value = backlinkUrl.trim();
      if (!value) {
        setNotice('Isi URL backlink');
        return;
      }
      await runBusy(async () => {
        await ingestKolamDaraSeoBacklink(value);
        setBacklinkUrl('');
      }, 'Backlink tercatat');
    },
    onRefresh,
    onSetBacklinkUrl: setBacklinkUrl,
    onSetCompetitor: setCompetitor,
    onSetKeyword: setKeyword,
  };
}
