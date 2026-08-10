import {
  buildKolamKpiRoute,
  buildKolamKpiSummaryCards,
  buildKolamKpiTeamPeriodQuery,
  getKolamKpiTab,
  isKolamKpiPluginEnabled,
  isKolamKpiRoute,
  kolamKpiLeaderboardRowLabel,
  kolamKpiPeriodKeysForDate,
  kolamKpiPreviousWeekKey,
  normalizeKolamKpiCharts,
  normalizeKolamKpiChatReviewPage,
  normalizeKolamKpiTeamLeaderboard,
  normalizeKolamKpiTeamSummary,
  resolveKolamKpiAccess,
} from '../src/domain/kolam-kpi';

describe('kolam-kpi domain', () => {
  it('resolves route, tab, and access like FE team page', () => {
    expect(isKolamKpiRoute('/list-of-users/kpi')).toBe(true);
    expect(isKolamKpiRoute('/list-of-users/kpi?tab=review-chat')).toBe(true);
    expect(isKolamKpiRoute('/portal/kpi')).toBe(false);
    expect(isKolamKpiRoute('/list-of-users/hr')).toBe(false);

    expect(getKolamKpiTab('/list-of-users/kpi')).toBe('ringkasan');
    expect(getKolamKpiTab('/list-of-users/kpi?tab=review-chat')).toBe(
      'review-chat',
    );
    expect(buildKolamKpiRoute('review-chat')).toBe(
      '/list-of-users/kpi?tab=review-chat',
    );

    expect(resolveKolamKpiAccess({roleKey: 'super-admin'}).canSee).toBe(true);
    expect(
      resolveKolamKpiAccess({
        roleKey: 'staff',
        permissions: [{resource: 'user', actions: ['view_by_admin']}],
      }).canViewTeam,
    ).toBe(true);
    expect(
      resolveKolamKpiAccess({
        roleKey: 'cashier',
        permissions: [],
      }).canSee,
    ).toBe(false);
  });

  it('builds period keys and previous week like plugin utils', () => {
    const keys = kolamKpiPeriodKeysForDate(new Date(Date.UTC(2026, 7, 10)));
    expect(keys.month).toBe('2026-08');
    expect(keys.week).toMatch(/^2026-W\d{2}$/);
    expect(kolamKpiPreviousWeekKey('2026-W33')).toMatch(/^2026-W\d{2}$/);

    expect(buildKolamKpiTeamPeriodQuery('month', new Date(Date.UTC(2026, 7, 10)))).toEqual({
      period: 'month',
      month: '2026-08',
    });
  });

  it('normalizes team summary, leaderboard, charts, and chat reviews', () => {
    const summary = normalizeKolamKpiTeamSummary({
      data: {
        period: 'week',
        periodKey: '2026-W33',
        totalPoints: 120,
        weekPoints: 40,
        prevWeekPoints: 30,
        weekDelta: 10,
        activeStaffCount: 3,
        eventCount: 8,
        topPerformer: {
          rank: 1,
          userId: 'u1',
          firstName: 'Ada',
          lastName: 'Lovelace',
          points: 50,
        },
      },
    });
    expect(summary?.totalPoints).toBe(120);
    expect(kolamKpiLeaderboardRowLabel(summary!.topPerformer!)).toBe(
      'Ada Lovelace',
    );
    expect(buildKolamKpiSummaryCards(summary!)[0].value).toBe('120');

    const leaderboard = normalizeKolamKpiTeamLeaderboard({
      data: {
        period: 'week',
        periodKey: '2026-W33',
        limit: 20,
        rows: [
          {
            rank: 1,
            userId: 'u1',
            displayName: 'Ada',
            points: 50,
          },
        ],
      },
    });
    expect(leaderboard.rows).toHaveLength(1);

    const charts = normalizeKolamKpiCharts({
      data: {
        granularity: 'week',
        count: 2,
        totalPoints: 90,
        series: [
          {key: 'w1', label: 'W1', points: 40},
          {key: 'w2', label: 'W2', points: 50},
        ],
        breakdown: [{ruleKey: 'task.done', points: 90, count: 4}],
      },
    });
    expect(charts?.series).toHaveLength(2);
    expect(charts?.breakdown[0].ruleKey).toBe('task.done');

    const reviews = normalizeKolamKpiChatReviewPage({
      success: true,
      data: [
        {
          id: 'r1',
          reviewedAt: '2026-08-10T01:00:00.000Z',
          contactLabel: 'Budi',
          platform: 'wa',
          conversationStartedAt: null,
          rating: 2,
          reviewNotes: 'OK',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(reviews.rows).toHaveLength(1);
    expect(reviews.rows[0].rating).toBe(2);
  });

  it('treats kpi plugin as enabled unless explicitly false', () => {
    expect(isKolamKpiPluginEnabled(undefined)).toBe(true);
    expect(isKolamKpiPluginEnabled({kpi: {}})).toBe(true);
    expect(isKolamKpiPluginEnabled({kpi: {enabled: false}})).toBe(false);
  });
});
