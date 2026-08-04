import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';

export interface KolamDaraKnowledgeBody {
  title: string;
  category: string;
  contentMarkdown: string;
  version?: string;
}

export interface KolamKatakTerbangWorkerPhotoResponse {
  success?: boolean;
  message?: string;
  katakTerbangWorkerPhotoUrl?: string;
}

export interface KolamRajaAnemonWorkerPhotoResponse {
  success?: boolean;
  message?: string;
  rajaAnemonWorkerPhotoUrl?: string;
}

export function createKolamDaraKnowledge(body: KolamDaraKnowledgeBody) {
  return kolamPost('/dara/knowledge', body);
}

export function uploadKolamKatakTerbangWorkerPhoto(localUri: string) {
  const body = new FormData();
  body.append('image', createImageFilePart(localUri) as unknown as Blob);

  return kolamPost<KolamKatakTerbangWorkerPhotoResponse>(
    '/websetting/katak-terbang-worker-photo',
    body,
  );
}

export function uploadKolamRajaAnemonWorkerPhoto(localUri: string) {
  const body = new FormData();
  body.append('image', createImageFilePart(localUri) as unknown as Blob);

  return kolamPost<KolamRajaAnemonWorkerPhotoResponse>(
    '/websetting/raja-anemon-worker-photo',
    body,
  );
}

export interface KolamPangeranIsopodWorkerPhotoResponse {
  success?: boolean;
  message?: string;
  pangeranIsopodWorkerPhotoUrl?: string;
}

export function uploadKolamPangeranIsopodWorkerPhoto(localUri: string) {
  const body = new FormData();
  body.append('image', createImageFilePart(localUri) as unknown as Blob);

  return kolamPost<KolamPangeranIsopodWorkerPhotoResponse>(
    '/websetting/pangeran-isopod-worker-photo',
    body,
  );
}

function kolamPost<T = unknown>(path: string, body: unknown) {
  return apiRequest<T>({
    method: 'POST',
    path,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function createImageFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'dara-photo.jpg';

  return {
    uri: normalizedUri,
    name,
    type: inferImageMimeType(name),
  };
}

function inferImageMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}
