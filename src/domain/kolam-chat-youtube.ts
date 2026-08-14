/**
 * YouTube URL helpers for chat (SoT: DA-Chat-Plugin `lib/chat/youtube-url.ts`).
 */

const YT_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

export type KolamChatYoutubePayload = {
  videoId: string;
  url: string;
  title?: string;
};

export type KolamChatYoutubeContent = {
  type: 'youtube';
  text?: string;
  youtube: KolamChatYoutubePayload;
};

export function extractKolamYoutubeVideoId(rawUrl: string): string | null {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(
      trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    );
    const host = url.hostname.toLowerCase();
    if (!YT_HOSTS.has(host)) {
      return null;
    }

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    const fromQuery = url.searchParams.get('v');
    if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) {
      return fromQuery;
    }

    const shorts = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts?.[1]) {
      return shorts[1];
    }

    const embed = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed?.[1]) {
      return embed[1];
    }

    return null;
  } catch {
    return null;
  }
}

export function isKolamYoutubeOnlyMessage(text: string): boolean {
  const trimmed = String(text || '').trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return false;
  }
  return Boolean(extractKolamYoutubeVideoId(trimmed));
}

export function buildKolamYoutubeContent(
  url: string,
): KolamChatYoutubeContent | null {
  const trimmed = String(url || '').trim();
  const videoId = extractKolamYoutubeVideoId(trimmed);
  if (!videoId) {
    return null;
  }

  return {
    type: 'youtube',
    text: trimmed,
    youtube: {
      videoId,
      url: trimmed.startsWith('http')
        ? trimmed
        : `https://www.youtube.com/watch?v=${videoId}`,
    },
  };
}

/** Resolve youtube payload from structured field or URL in content/body text. */
export function resolveKolamYoutubeFromContent(content: {
  type?: string | null;
  text?: string | null;
  youtube?: {
    videoId?: string | null;
    url?: string | null;
    title?: string | null;
  } | null;
} | null | undefined): KolamChatYoutubePayload | null {
  const structuredId = content?.youtube?.videoId?.trim();
  if (structuredId) {
    return {
      videoId: structuredId,
      url:
        content?.youtube?.url?.trim() ||
        `https://www.youtube.com/watch?v=${structuredId}`,
      title: content?.youtube?.title?.trim() || undefined,
    };
  }

  const text = String(content?.text || '').trim();
  if (!text) {
    return null;
  }

  if (content?.type === 'youtube' || isKolamYoutubeOnlyMessage(text)) {
    return buildKolamYoutubeContent(text)?.youtube ?? null;
  }

  return null;
}

export function resolveKolamYoutubeFromMessage(input: {
  content?: {
    type?: string | null;
    text?: string | null;
    youtube?: {
      videoId?: string | null;
      url?: string | null;
      title?: string | null;
    } | null;
  } | null;
  body?: string | null;
}): KolamChatYoutubePayload | null {
  const fromContent = resolveKolamYoutubeFromContent(input.content);
  if (fromContent) {
    return fromContent;
  }

  const body = String(input.body || '').trim();
  if (!body || !isKolamYoutubeOnlyMessage(body)) {
    return null;
  }

  return buildKolamYoutubeContent(body)?.youtube ?? null;
}
