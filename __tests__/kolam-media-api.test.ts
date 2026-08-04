import {appConfig} from '../src/config/app';
import {setAccessToken} from '../src/lib/api-client';
import {
  getKolamMediaList,
  getKolamMediaOrphanFilenames,
} from '../src/services/kolam-media-api';

const fetchMock = jest.fn();

describe('Kolam media API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
  });

  it('requests the live media list endpoint and normalizes items', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          media: [
            {
              filename: 'frog.jpg',
              isOrphan: false,
              owners: [{name: 'Azureus', type: 'species'}],
              path: 'media/frog.jpg',
              title: 'Frog',
            },
          ],
          page: 2,
          total: 12,
          totalPages: 3,
        },
      }),
    );

    await expect(
      getKolamMediaList({
        filter: 'orphan',
        limit: 24,
        page: 2,
        search: ' frog ',
        type: 'image',
      }),
    ).resolves.toEqual({
      items: [
        {
          filename: 'frog.jpg',
          isOrphan: false,
          owners: [{name: 'Azureus', type: 'species'}],
          path: 'media/frog.jpg',
          title: 'Frog',
          type: 'image',
        },
      ],
      page: 2,
      total: 12,
      totalPages: 3,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/media/list?filter=orphan&limit=24&page=2&search=frog&type=image`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
        method: 'GET',
      }),
    );
  });

  it('reads orphan filenames from the live media endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({data: {filenames: ['unused.jpg', 42, 'old.jpg']}}),
    );

    await expect(getKolamMediaOrphanFilenames('image')).resolves.toEqual([
      'unused.jpg',
      'old.jpg',
    ]);
  });
});

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: {'Content-Type': 'application/json'},
    status: 200,
  });
}

