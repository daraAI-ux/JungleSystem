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

export type KolamDaraSeoSentimentTopic = {
  title: string;
  pct: number;
};

export interface KolamDaraSeoSentimentSummary {
  daraSummary: string;
  negative: number;
  negativePct: number;
  neutral: number;
  neutralPct: number;
  positive: number;
  positivePct: number;
  topics: KolamDaraSeoSentimentTopic[];
  total: number;
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

/** FE `computeTopics` — DA-Dara-Plugin DaraSentimentDashboard. */
function computeSentimentTopics(
  rows: KolamDaraSeoSentimentRow[],
): KolamDaraSeoSentimentTopic[] {
  const keys = {
    product: ['produk', 'bagus', 'kualitas', 'warna', 'vivid', 'cacat', 'rusak'],
    shipping: ['kirim', 'pengiriman', 'packing', 'ongkir', 'lambat'],
    service: ['respon', 'layanan', 'cs', 'komplain', 'kecewa'],
    price: ['harga', 'mahal', 'murah', 'diskon'],
  };
  const counts = {product: 0, shipping: 0, service: 0, price: 0};
  for (const row of rows) {
    const text = row.text.toLowerCase();
    (Object.keys(keys) as Array<keyof typeof keys>).forEach(key => {
      if (keys[key].some(word => text.includes(word))) {
        counts[key] += 1;
      }
    });
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return [
    {
      title: 'Kualitas Produk',
      pct: Math.round((counts.product / total) * 100),
    },
    {
      title: 'Pengiriman & Packing',
      pct: Math.round((counts.shipping / total) * 100),
    },
    {
      title: 'Respon & Layanan',
      pct: Math.round((counts.service / total) * 100),
    },
    {title: 'Harga', pct: Math.round((counts.price / total) * 100)},
  ];
}

/** FE `buildDaraSummary`. */
function buildDaraSentimentSummary(stats: {
  positivePct: number;
  negativePct: number;
  negative: number;
}) {
  const parts: string[] = [];
  if (stats.positivePct >= 50) {
    parts.push('Mayoritas sentimen positif.');
  } else if (stats.negativePct >= 40) {
    parts.push('Perhatian: sentimen negatif meningkat.');
  } else {
    parts.push('Distribusi sentimen relatif seimbang.');
  }
  parts.push('Topik utama: kualitas produk, pengiriman, dan harga.');
  if (stats.negative > 0) {
    parts.push('Perlu perhatian: respon lambat dan komplain pelanggan.');
  }
  return parts.join(' ');
}

export function formatKolamDaraSeoSentimentRelativeTime(input?: string) {
  if (!input) {
    return '—';
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'Baru saja';
  }
  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam lalu`;
  }
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

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
      if (!llmEnabled) {
        setUseLlm(false);
      }
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
    if (useLlm && !llamaEnabled) {
      setNotice(
        'Llama sentiment nonaktif. Aktifkan di Settings → AI-Tools → DARA SEO Sentiment Llama.',
      );
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
      setNotice('Sentimen dicatat');
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal analisis sentimen',
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
        setNotice('Sentimen dihapus');
        setRows(prev => prev.filter(row => row.id !== id));
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal hapus sentimen',
        );
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const filteredRows = useMemo(
    () =>
      filter === 'all' ? rows : rows.filter(row => row.sentiment === filter),
    [filter, rows],
  );

  const summary = useMemo<KolamDaraSeoSentimentSummary>(() => {
    const total = rows.length || 1;
    const positive = rows.filter(row => row.sentiment === 'positive').length;
    const neutral = rows.filter(row => row.sentiment === 'neutral').length;
    const negative = rows.filter(row => row.sentiment === 'negative').length;
    const positivePct = Math.round((positive / total) * 100);
    const neutralPct = Math.round((neutral / total) * 100);
    const negativePct = Math.round((negative / total) * 100);
    return {
      total: rows.length,
      positive,
      neutral,
      negative,
      positivePct,
      neutralPct,
      negativePct,
      topics: computeSentimentTopics(rows),
      daraSummary: buildDaraSentimentSummary({
        positivePct,
        negativePct,
        negative,
      }),
    };
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
