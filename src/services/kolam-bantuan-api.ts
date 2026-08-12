import {appConfig} from '../config/app';
import {kolamBantuanLocalManifest} from '../data/kolam-bantuan-local-manifest';
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

/** Sync local first — remote refresh is optional and must never block hub mount. */
export function getKolamBantuanLocalManifest() {
  return kolamBantuanLocalManifest;
}

export async function fetchKolamBantuanManifest() {
  try {
    const payload = await fetchJson<KolamBantuanManifest>(
      `${getBantuanStaticBaseUrl()}/manifest.json`,
    );

    if (Array.isArray(payload.modules) && payload.modules.length > 0) {
      return {
        version: String(payload.version ?? ''),
        generatedAt: String(payload.generatedAt ?? ''),
        aliases: payload.aliases ?? {},
        modules: payload.modules,
      };
    }
  } catch {
    // Prefer local fallback for native stability.
  }

  return kolamBantuanLocalManifest;
}

export async function fetchKolamBantuanSearchIndex() {
  try {
    const payload = await fetchJson<{entries?: KolamBantuanSearchEntry[]}>(
      `${getBantuanStaticBaseUrl()}/search-index.json`,
    );

    if (Array.isArray(payload.entries) && payload.entries.length > 0) {
      return payload.entries;
    }
  } catch {
    // Fall through to local lazy module.
  }

  return loadLocalSearchIndex();
}

export async function fetchKolamBantuanDocBySlug(
  slug: string,
  docPath?: string,
) {
  const normalizedDocPath = docPath?.replace(/^\/+/, '');

  // Prefer per-doc local lazy load — avoids mega-module abort on RN Windows.
  if (normalizedDocPath) {
    try {
      const localDoc = await loadKolamBantuanLocalDoc(normalizedDocPath);
      if (typeof localDoc === 'string' && localDoc.length > 0) {
        return localDoc;
      }
    } catch {
      // Fall through to remote.
    }
  }

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

  if (!normalizedDocPath) {
    throw new Error(`Dokumen tidak ditemukan: ${slug}`);
  }

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

async function loadLocalSearchIndex() {
  const mod = await import('../data/kolam-bantuan-local-search-index');
  return mod.kolamBantuanLocalSearchIndex;
}

async function loadKolamBantuanLocalDoc(docPath: string) {
  const {loadKolamBantuanLocalDoc: loadOne} = await import(
    '../data/kolam-bantuan-local-doc-loader'
  );
  return loadOne(docPath);
}
