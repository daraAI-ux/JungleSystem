import {
  buildKolamYoutubeContent,
  extractKolamYoutubeVideoId,
  isKolamYoutubeOnlyMessage,
  resolveKolamYoutubeFromContent,
  resolveKolamYoutubeFromMessage,
} from '../src/domain/kolam-chat-youtube';

describe('kolam-chat-youtube domain', () => {
  it('extracts video ids from common YouTube URL shapes', () => {
    expect(
      extractKolamYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
    expect(extractKolamYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
    expect(
      extractKolamYoutubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
    expect(
      extractKolamYoutubeVideoId(
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      ),
    ).toBe('dQw4w9WgXcQ');
  });

  it('builds youtube content only for youtube-only messages', () => {
    expect(isKolamYoutubeOnlyMessage('https://youtu.be/dQw4w9WgXcQ')).toBe(
      true,
    );
    expect(
      isKolamYoutubeOnlyMessage('lihat https://youtu.be/dQw4w9WgXcQ'),
    ).toBe(false);
    expect(buildKolamYoutubeContent('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      type: 'youtube',
      text: 'https://youtu.be/dQw4w9WgXcQ',
      youtube: {
        videoId: 'dQw4w9WgXcQ',
        url: 'https://youtu.be/dQw4w9WgXcQ',
      },
    });
  });

  it('resolves from structured content or plain body', () => {
    expect(
      resolveKolamYoutubeFromContent({
        type: 'youtube',
        youtube: {videoId: 'dQw4w9WgXcQ', title: 'Demo'},
      }),
    ).toEqual({
      videoId: 'dQw4w9WgXcQ',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Demo',
    });

    expect(
      resolveKolamYoutubeFromMessage({
        body: 'https://youtu.be/dQw4w9WgXcQ',
      })?.videoId,
    ).toBe('dQw4w9WgXcQ');
  });
});
