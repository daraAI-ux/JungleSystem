import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoSentimentKind,
  type KolamDaraSeoSentimentRow,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  deleteKolamDaraSeoSentiment,
  fetchKolamDaraSeoSentiment,
  fetchKolamDaraSeoSentimentLlmEnabled,
  ingestKolamDaraSeoSentiment,
} from '../services/kolam-dara-seo-api';

export type KolamDaraSeoSentimentFilter = 'all' | KolamDaraSeoSentimentKind;

export interface KolamDaraSeoSentimentSummary {
  negative: number;
  neutral: number;
  positive: number;
  topics: string[];
}

export interface KolamDaraSeoSentimentController {
  busy: boolean;
  deletingId: string | null;
  error: string | null;
  filter: KolamDaraSeoSentimentFilter;
  filteredRows: KolamDaraSeoSentimentRow[];
  llamaEnabled: boolean;
  loading: boolean;
  notice: string | null;
  rows: KolamDaraSeoSentimentRow[];
  summary: KolamDaraSeoSentimentSummary;
  text: string;
  useLlm: boolean;
  onDelete: (id: string) => Promise<void>;
  onIngest: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSetFilter: (filter: KolamDaraSeoSentimentFilter) => void;
  onSetText: (value: string) => void;
  onSetUseLlm: (value: boolean) => void;
  onUseQuickChip: (text: string) => void;
}

const TOPIC_STOPWORDS = new Set([
  'yang',
  'dengan',
  'untuk',
  'dari',
  'dan',
  'atau',
  'ini',
  'itu',
  'saya',
  'kami',
  'kita',
  'akan',
  'sudah',
  'juga',
  'tidak',
  'ada',
  'nya',
  'ke',
  'di',
  'sangat',
]);

export function useKolamDaraSeoSentimentController(
  route: string,
): KolamDaraSeoSentimentController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'sentiment';
  const [rows, setRows] = useState<KolamDaraSeoSentimentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<KolamDaraSeoSentimentFilter>('all');
  const [llamaEnabled, setLlamaEnabled] = useState(false);
  const [useLlm, setUseLlm] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [sentimentRows, llmEnabled] = await Promise.all([
        fetchKolamDaraSeoSentiment(),
        fetchKolamDaraSeoSentimentLlmEnabled(),
      ]);
      setRows(sentimentRows);
      setLlamaEnabled(llmEnabled);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat sentimen',
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

  const onIngest = useCallback(async () => {
    const value = text.trim();
    if (!value) {
      setNotice('Isi teks dulu');
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await ingestKolamDaraSeoSentiment({
        text: value,
        useLlm: llamaEnabled && useLlm,
      });
      setText('');
      setNotice('Sentimen tercatat');
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
  }, [llamaEnabled, onRefresh, text, useLlm]);

  const onDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setNotice(null);
      try {
        await deleteKolamDaraSeoSentiment(id);
        setNotice('Entri dihapus');
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal menghapus',
        );
      } finally {
        setDeletingId(null);
      }
    },
    [onRefresh],
  );

  const filteredRows = useMemo(
    () =>
      filter === 'all' ? rows : rows.filter(row => row.sentiment === filter),
    [filter, rows],
  );

  const summary = useMemo<KolamDaraSeoSentimentSummary>(() => {
    const counts = {positive: 0, neutral: 0, negative: 0};
    const freq = new Map<string, number>();
    rows.forEach(row => {
      counts[row.sentiment] += 1;
      row.text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(word => word.length >= 4 && !TOPIC_STOPWORDS.has(word))
        .forEach(word => {
          freq.set(word, (freq.get(word) ?? 0) + 1);
        });
    });
    const topics = Array.from(freq.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    return {...counts, topics};
  }, [rows]);

  return {
    busy,
    deletingId,
    error,
    filter,
    filteredRows,
    llamaEnabled,
    loading,
    notice,
    rows,
    summary,
    text,
    useLlm,
    onDelete,
    onIngest,
    onRefresh,
    onSetFilter: setFilter,
    onSetText: setText,
    onSetUseLlm: setUseLlm,
    onUseQuickChip: setText,
  };
}
