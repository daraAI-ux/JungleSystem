import {appConfig} from '../src/config/app';
import {
  getKolamAppDownloadArtifactUrl,
  getKolamAppDownloads,
} from '../src/services/kolam-app-download-api';
import {setAccessToken} from '../src/lib/api-client';

const fetchMock = jest.fn();

describe('Kolam app download API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
  });

  it('loads public app downloads and normalizes versions', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            _id: 'app-1',
            name: 'Kolam Desktop',
            slug: 'kolam-desktop',
            description: 'Desktop installer',
            sortOrder: 2,
            isActive: true,
            versionCount: 1,
            latestVersion: '2.3.10',
            versions: [
              {
                _id: 'version-1',
                version: '2.3.10',
                releaseNotes: 'Stable',
                createdAt: '2026-08-01T00:00:00.000Z',
                artifacts: [
                  {
                    _id: 'artifact-1',
                    platform: 'windows',
                    platformLabel: 'Windows',
                    fileKind: 'Installer',
                    originalName: 'KolamSetup.exe',
                    fileSize: 1048576,
                    extension: '.exe',
                    md5: 'abc123',
                    downloadUrl: 'https://example.test/KolamSetup.exe',
                  },
                ],
              },
            ],
          },
        ],
      }),
    );

    await expect(getKolamAppDownloads()).resolves.toEqual([
      {
        id: 'app-1',
        name: 'Kolam Desktop',
        slug: 'kolam-desktop',
        description: 'Desktop installer',
        sortOrder: 2,
        isActive: true,
        versionCount: 1,
        latestVersion: '2.3.10',
        versions: [
          {
            id: 'version-1',
            version: '2.3.10',
            releaseNotes: 'Stable',
            createdAt: '2026-08-01T00:00:00.000Z',
            artifacts: [
              {
                id: 'artifact-1',
                platform: 'windows',
                platformLabel: 'Windows',
                fileKind: 'Installer',
                originalName: 'KolamSetup.exe',
                fileSize: 1048576,
                extension: '.exe',
                md5: 'abc123',
                downloadUrl: 'https://example.test/KolamSetup.exe',
              },
            ],
          },
        ],
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/app-downloads`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
        method: 'GET',
      }),
    );
  });

  it('builds an API download endpoint when the artifact has no public URL', () => {
    expect(
      getKolamAppDownloadArtifactUrl({
        appId: 'app 1',
        versionId: 'v/1',
        artifact: {
          id: 'artifact 1',
          platform: 'other',
          platformLabel: 'Lainnya',
          originalName: 'file.bin',
          fileSize: 0,
          md5: 'abc',
        },
      }),
    ).toBe(
      `${appConfig.kolamApiBaseUrl}/app-downloads/app%201/versions/v%2F1/artifacts/artifact%201/download`,
    );
  });
});

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: {'Content-Type': 'application/json'},
    status: 200,
  });
}
