import {appConfig} from '../config/app';
import {
  kolamBantuanLocalDocsByPath,
  kolamBantuanLocalManifest,
  kolamBantuanLocalSearchIndex,
} from '../data/kolam-bantuan-local-data';
import {
  type KolamBantuanManifest,
  type KolamBantuanSearchEntry,
} from '../domain/kolam-bantuan';
import {apiRequest} from '../lib/api-client';

type BantuanDocResponse = {
  data?: {
    body?: string;
  };
};

export async function fetchKolamBantuanManifest() {
  let payload: KolamBantuanManifest;

  try {
    payload = await fetchJson<KolamBantuanManifest>(
      `${getBantuanStaticBaseUrl()}/manifest.json`,
    );
  } catch {
    return kolamBantuanLocalManifest;
  }

  if (!Array.isArray(payload.modules) || payload.modules.length === 0) {
    return kolamBantuanLocalManifest;
  }

  return {
    version: String(payload.version ?? ''),
    generatedAt: String(payload.generatedAt ?? ''),
    aliases: payload.aliases ?? {},
    modules: Array.isArray(payload.modules) ? payload.modules : [],
  };
}

export async function fetchKolamBantuanSearchIndex() {
  let payload: {entries?: KolamBantuanSearchEntry[]};

  try {
    payload = await fetchJson<{entries?: KolamBantuanSearchEntry[]}>(
      `${getBantuanStaticBaseUrl()}/search-index.json`,
    );
  } catch {
    return kolamBantuanLocalSearchIndex;
  }

  if (!Array.isArray(payload.entries) || payload.entries.length === 0) {
    return kolamBantuanLocalSearchIndex;
  }

  return Array.isArray(payload.entries) ? payload.entries : [];
}

export async function fetchKolamBantuanDocBySlug(
  slug: string,
  docPath?: string,
) {
  try {
    const response = await apiRequest<BantuanDocResponse>({
      baseUrl: `${appConfig.kolamWebUrl.replace(/\/$/, '')}/api`,
      path: `/bantuan/doc/${encodeURIComponent(slug)}`,
      method: 'GET',
      credentials: 'include',
      sourceHeader: appConfig.kolamSourceHeader,
    });
    const body = response.data?.body;

    if (typeof body === 'string') {
      return body;
    }
  } catch {
    // Native does not always share browser cookies with Next API routes.
  }

  if (!docPath) {
    throw new Error(`Dokumen tidak ditemukan: ${slug}`);
  }

  const normalizedDocPath = docPath.replace(/^\/+/, '');
  const staticUrl = `${getBantuanStaticBaseUrl()}/content/${normalizedDocPath}`;

  try {
    const response = await fetch(staticUrl, {
      headers: {Accept: 'text/markdown,text/plain,*/*'},
    });

    if (response.ok) {
      return response.text();
    }
  } catch {
    // Static plugin content may be unavailable outside the web host.
  }

  const localDoc = kolamBantuanLocalDocsByPath[normalizedDocPath];

  if (typeof localDoc === 'string') {
    return localDoc;
  }

  throw new Error(`Dokumen tidak ditemukan: ${slug}`);
}

function getBantuanStaticBaseUrl() {
  return `${appConfig.kolamWebUrl.replace(/\/$/, '')}/plugins/bantuan`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${url}?v=latest`, {
    headers: {Accept: 'application/json'},
  });

  if (!response.ok) {
    throw new Error('Gagal memuat bantuan');
  }

  return response.json() as Promise<T>;
}
