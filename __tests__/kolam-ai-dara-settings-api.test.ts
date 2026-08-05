import {appConfig} from '../src/config/app';
import {
  createKolamDaraKnowledge,
  uploadKolamKatakTerbangWorkerPhoto,
  uploadKolamRajaAnemonWorkerPhoto,
} from '../src/services/kolam-ai-dara-settings-api';

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

describe('kolam AI/DARA settings api', () => {
  it('creates DARA knowledge with the FE body contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({data: {_id: 'knowledge-1', title: 'SOP Kasir'}}),
    );

    await createKolamDaraKnowledge({
      title: 'SOP Kasir',
      category: 'sop_kasir',
      contentMarkdown: '# Buka kasir',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/dara/knowledge`,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"contentMarkdown":"# Buka kasir"'),
      }),
    );
  });

  it('uploads Katak Terbang worker photo with multipart image field', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        katakTerbangWorkerPhotoUrl: '/media/katak-terbang/photo.jpg',
      }),
    );

    await uploadKolamKatakTerbangWorkerPhoto(
      'C:\\Users\\user\\Pictures\\katak-terbang.png',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting/katak-terbang-worker-photo`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
  });

  it('uploads worker SVG avatars with SVG mime type', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        rajaAnemonWorkerPhotoUrl: '/media/dara/raja-anemon.svg',
      }),
    );

    await uploadKolamRajaAnemonWorkerPhoto(
      'C:\\Users\\user\\Pictures\\raja-anemon.svg',
    );

    expect(appendSpy).toHaveBeenCalledWith(
      'image',
      expect.objectContaining({
        name: 'raja-anemon.svg',
        type: 'image/svg+xml',
        uri: 'file:///C:/Users/user/Pictures/raja-anemon.svg',
      }),
    );
    appendSpy.mockRestore();
  });
});
