import {appConfig} from '../src/config/app';
import {fetchServerMetrics} from '../src/services/server-metrics-api';
import {clearAuthToken, saveAuthToken} from '../src/services/token-store';

const fetchMock = jest.fn();

describe('server metrics api', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    clearAuthToken();
  });

  it('reads Kolam BE host metrics with the active runtime token', async () => {
    saveAuthToken('runtime-token');
    fetchMock.mockResolvedValueOnce(jsonResponse({
      success: true,
      data: {
        checkedAt: '2026-07-19T00:00:00.000Z',
        hostname: 'kolam-prod',
        cpu: {percent: 12.4},
        memory: {usedPercent: 58.9},
        disk: {usedPercent: 71},
      },
    }));

    await expect(fetchServerMetrics()).resolves.toEqual({
      checkedAt: '2026-07-19T00:00:00.000Z',
      hostname: 'kolam-prod',
      cpuPercent: 12.4,
      memoryPercent: 58.9,
      diskPercent: 71,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/system/host-metrics`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer runtime-token',
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: jest.fn(),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}

