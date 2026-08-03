import {appConfig} from '../src/config/app';
import {fetchKolamDaraMarketingHub} from '../src/services/kolam-dara-marketing-hub-api';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return {
    ok: init.status ? init.status >= 200 && init.status < 300 : true,
    status: init.status ?? 200,
    headers: new Headers(init.headers),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('kolam dara marketing hub api', () => {
  it('fetches marketing hub without brand filter by default', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          seo: {seoScore: 70, pendingApprovals: 0, negativeMentions: 0, keywordCount: 1},
          market: {pendingApprovals: 0, tooCheap: 0, tooExpensive: 0, lowMargin: 0},
          integrations: {serpConfigured: false, searxngReachable: true},
          serpSnapshotsStored: 0,
          quickLinks: [],
          brands: [],
          selectedBrandId: 'all',
        },
      }),
    );

    const hub = await fetchKolamDaraMarketingHub();
    expect(hub.seo?.seoScore).toBe(70);
    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/dara-seo/marketing-hub`,
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('passes brandId query when not all', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          market: {pendingApprovals: 1},
          integrations: {},
          serpSnapshotsStored: 0,
          quickLinks: [],
          brands: [],
          selectedBrandId: 'brand-1',
        },
      }),
    );

    await fetchKolamDaraMarketingHub('brand-1');
    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/dara-seo/marketing-hub?brandId=brand-1`,
      expect.objectContaining({method: 'GET'}),
    );
  });
});
