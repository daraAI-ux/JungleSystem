import {appConfig} from '../config/app';
import {
  normalizeKolamKpiCharts,
  normalizeKolamKpiChatReviewPage,
  normalizeKolamKpiLeaderboard,
  normalizeKolamKpiMeSummary,
  normalizeKolamKpiTeamLeaderboard,
  normalizeKolamKpiTeamSummary,
  type KolamKpiChartsData,
  type KolamKpiChartGranularity,
  type KolamKpiChatReviewPage,
  type KolamKpiLeaderboard,
  type KolamKpiMeSummary,
  type KolamKpiTeamLeaderboard,
  type KolamKpiTeamQueryParams,
  type KolamKpiTeamSummary,
} from '../domain/kolam-kpi';
import {apiRequest} from '../lib/api-client';

export async function fetchKolamKpiMeSummary(): Promise<KolamKpiMeSummary | null> {
  const payload = await kolamRequest<unknown>('/kpi/me/summary');
  return normalizeKolamKpiMeSummary(payload);
}

export async function fetchKolamKpiLeaderboard(
  params: {period?: 'week' | 'month'; limit?: number} = {},
): Promise<KolamKpiLeaderboard> {
  const payload = await kolamRequest<unknown>('/kpi/leaderboard', {
    query: {
      period: params.period,
      limit: params.limit ?? 3,
    },
  });
  return normalizeKolamKpiLeaderboard(payload);
}

export async function fetchKolamKpiTeamSummary(
  params: KolamKpiTeamQueryParams = {},
): Promise<KolamKpiTeamSummary | null> {
  const payload = await kolamRequest<unknown>('/kpi/team/summary', {
    query: {
      period: params.period,
      week: params.week,
      month: params.month,
    },
  });
  return normalizeKolamKpiTeamSummary(payload);
}

export async function fetchKolamKpiTeamCharts(params: {
  granularity?: KolamKpiChartGranularity;
  count?: number;
}): Promise<KolamKpiChartsData | null> {
  const payload = await kolamRequest<unknown>('/kpi/team/charts', {
    query: {
      granularity: params.granularity,
      count: params.count,
    },
  });
  return normalizeKolamKpiCharts(payload);
}

export async function fetchKolamKpiTeamLeaderboard(
  params: KolamKpiTeamQueryParams & {limit?: number} = {},
): Promise<KolamKpiTeamLeaderboard> {
  const payload = await kolamRequest<unknown>('/kpi/team/leaderboard', {
    query: {
      period: params.period,
      week: params.week,
      month: params.month,
      limit: params.limit ?? 20,
    },
  });
  return normalizeKolamKpiTeamLeaderboard(payload);
}

export async function fetchKolamKpiChatReviews(input?: {
  page?: number;
  limit?: number;
}): Promise<KolamKpiChatReviewPage> {
  const payload = await kolamRequest<unknown>('/kpi/chat-reviews', {
    query: {
      page: input?.page ?? 1,
      limit: input?.limit ?? 20,
    },
  });
  return normalizeKolamKpiChatReviewPage(payload);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}
