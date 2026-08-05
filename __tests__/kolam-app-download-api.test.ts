import {appConfig} from '../src/config/app';
import {
  createKolamSupportingApp,
  deleteKolamAppDownloadArtifact,
  deleteKolamAppDownloadVersion,
  deleteKolamSupportingApp,
  getKolamAppDownloadArtifactUrl,
  getKolamAppDownloads,
  updateKolamSupportingApp,
  uploadKolamAppDownloadVersion,
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

  it('loads admin app downloads with the admin query flag', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({data: []}));

    await expect(getKolamAppDownloads({admin: true})).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/app-downloads?admin=1`,
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('creates, updates, and deletes supporting apps through admin endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({data: {_id: 'app-1', name: 'Kolam Desktop'}}),
      )
      .mockResolvedValueOnce(
        jsonResponse({data: {_id: 'app-1', name: 'Kolam Windows'}}),
      )
      .mockResolvedValueOnce(jsonResponse({message: 'Aplikasi dihapus'}));

    await expect(
      createKolamSupportingApp({name: 'Kolam Desktop'}),
    ).resolves.toMatchObject({id: 'app-1', name: 'Kolam Desktop'});
    await expect(
      updateKolamSupportingApp('app-1', {name: 'Kolam Windows'}),
    ).resolves.toMatchObject({id: 'app-1', name: 'Kolam Windows'});
    await expect(deleteKolamSupportingApp('app-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/app-downloads`,
      expect.objectContaining({method: 'POST'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/app-downloads/app-1`,
      expect.objectContaining({method: 'PUT'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/app-downloads/app-1`,
      expect.objectContaining({method: 'DELETE'}),
    );
  });

  it('uploads app versions as multipart files', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          _id: 'app-1',
          name: 'Kolam Desktop',
          versions: [{_id: 'version-1', version: '2.4.0', artifacts: []}],
        },
      }),
    );

    await expect(
      uploadKolamAppDownloadVersion('app-1', {
        version: '2.4.0',
        releaseNotes: 'Stable',
        files: [
          {
            uri: 'C:\\Downloads\\KolamSetup.exe',
            name: 'KolamSetup.exe',
          },
        ],
      }),
    ).resolves.toMatchObject({id: 'app-1', latestVersion: null});

    expect(appendSpy).toHaveBeenCalledWith('version', '2.4.0');
    expect(appendSpy).toHaveBeenCalledWith('releaseNotes', 'Stable');
    expect(appendSpy).toHaveBeenCalledWith(
      'files',
      expect.objectContaining({
        name: 'KolamSetup.exe',
        type: 'application/vnd.microsoft.portable-executable',
        uri: 'file:///C:/Downloads/KolamSetup.exe',
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/app-downloads/app-1/versions`,
      expect.objectContaining({
        body: expect.any(FormData),
        method: 'POST',
      }),
    );

    appendSpy.mockRestore();
  });

  it('deletes app versions and artifacts through admin endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({data: {_id: 'app-1', name: 'Kolam Desktop'}}),
      )
      .mockResolvedValueOnce(
        jsonResponse({data: {_id: 'app-1', name: 'Kolam Desktop'}}),
      );

    await expect(
      deleteKolamAppDownloadVersion('app-1', 'version-1'),
    ).resolves.toMatchObject({id: 'app-1'});
    await expect(
      deleteKolamAppDownloadArtifact('app-1', 'version-1', 'artifact-1'),
    ).resolves.toMatchObject({id: 'app-1'});

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/app-downloads/app-1/versions/version-1`,
      expect.objectContaining({method: 'DELETE'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/app-downloads/app-1/versions/version-1/artifacts/artifact-1`,
      expect.objectContaining({method: 'DELETE'}),
    );
  });
});

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: {'Content-Type': 'application/json'},
    status: 200,
  });
}
