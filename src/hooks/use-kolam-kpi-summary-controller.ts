import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  buildKolamKpiSummaryCards,
  buildKolamKpiTeamPeriodQuery,
  isKolamKpiPluginEnabled,
  kolamKpiPeriodKeysForDate,
  type KolamKpiChartGranularity,
  type KolamKpiChartsData,
  type KolamKpiPeriodView,
  type KolamKpiTeamLeaderboard,
  type KolamKpiTeamSummary,
} from '../domain/kolam-kpi';
import {ApiError} from '../lib/api-error';
import {getKolamWebSetting} from '../services/kolam-api';
import {
  fetchKolamKpiTeamCharts,
  fetchKolamKpiTeamLeaderboard,
  fetchKolamKpiTeamSummary,
} from '../services/kolam-kpi-team-api';

export function useKolamKpiSummaryController(options: {enabled: boolean}) {
  const [pluginLoading, setPluginLoading] = useState(true);
  const [pluginEnabled, setPluginEnabled] = useState(true);
  const [periodView, setPeriodView] = useState<KolamKpiPeriodView>('week');
  const [granularity, setGranularity] =
    useState<KolamKpiChartGranularity>('week');
  const [summary, setSummary] = useState<KolamKpiTeamSummary | null>(null);
  const [leaderboard, setLeaderboard] =
    useState<KolamKpiTeamLeaderboard | null>(null);
  const [charts, setCharts] = useState<KolamKpiChartsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartsError, setChartsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setPluginLoading(true);
    void getKolamWebSetting()
      .then(setting => {
        if (cancelled) {
          return;
        }
        setPluginEnabled(isKolamKpiPluginEnabled(setting.kolamPlugins));
      })
      .catch(() => {
        if (!cancelled) {
          setPluginEnabled(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPluginLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = options.enabled && pluginEnabled && !pluginLoading;
  const periodParams = useMemo(
    () => buildKolamKpiTeamPeriodQuery(periodView),
    [periodView],
  );

  const loadSummary = useCallback(async () => {
    if (!ready) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [nextSummary, nextLeaderboard] = await Promise.all([
        fetchKolamKpiTeamSummary(periodParams),
        fetchKolamKpiTeamLeaderboard({...periodParams, limit: 20}),
      ]);
      setSummary(nextSummary);
      setLeaderboard(nextLeaderboard);
      if (!nextSummary) {
        setError(
          'Gagal memuat data KPI tim. Periksa izin user:view_by_admin lalu refresh halaman.',
        );
      }
    } catch (err) {
      setSummary(null);
      setLeaderboard(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat data KPI tim. Periksa izin user:view_by_admin lalu refresh halaman.',
      );
    } finally {
      setLoading(false);
    }
  }, [periodParams, ready]);

  const loadCharts = useCallback(async () => {
    if (!ready) {
      return;
    }
    setChartsLoading(true);
    setChartsError('');
    try {
      const next = await fetchKolamKpiTeamCharts({
        granularity,
        count: granularity === 'day' ? 14 : 12,
      });
      setCharts(next);
      if (!next) {
        setChartsError('Gagal memuat tren poin.');
      }
    } catch (err) {
      setCharts(null);
      setChartsError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat tren poin.',
      );
    } finally {
      setChartsLoading(false);
    }
  }, [granularity, ready]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadCharts();
  }, [loadCharts]);

  const cards = useMemo(
    () => (summary ? buildKolamKpiSummaryCards(summary) : []),
    [summary],
  );

  const currentWeekKey = kolamKpiPeriodKeysForDate().week;
  const showWeekEmptyHint =
    periodView === 'week' &&
    !loading &&
    !error &&
    Boolean(summary) &&
    summary!.eventCount === 0 &&
    summary!.periodKey === currentWeekKey;

  return {
    pluginLoading,
    pluginEnabled,
    ready,
    periodView,
    setPeriodView,
    granularity,
    setGranularity,
    summary,
    leaderboard,
    charts,
    cards,
    loading,
    chartsLoading,
    error,
    chartsError,
    showWeekEmptyHint,
    currentWeekKey,
    onRefresh: async () => {
      await Promise.all([loadSummary(), loadCharts()]);
    },
  };
}
