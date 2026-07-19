import {appConfig} from '../config/app';

export function getKolamFileUrl(
  path: string | null | undefined,
  baseUrl = appConfig.fileBaseUrl,
): string | null {
  if (!path) {
    return null;
  }

  let normalized = path.replace(/\\/g, '/');

  if (/^https?:\/\//.test(normalized)) {
    return normalized;
  }

  if (!/\/api\/?$/.test(baseUrl)) {
    normalized = normalized.replace(/^\/?api\//, '/');
  }

  return `${baseUrl.replace(/\/+$/, '')}/${normalized.replace(/^\/+/, '')}`;
}
