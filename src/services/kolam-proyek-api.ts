import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import {
  buildKolamProyekHppPayload,
  normalizeKolamProyekDetail,
  normalizeKolamProyekList,
  type KolamProyekDetail,
  type KolamProyekHppMaterial,
  type KolamProyekLifecycleStatus,
  type KolamProyekListQuery,
  type KolamProyekListResult,
  type KolamProyekQuotationPayload,
  type KolamProyekSubmitRoundInput,
} from '../domain/kolam-proyek';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

interface DataResponse<T> {
  data: T;
}

export type KolamCustomProjectOption = {
  id: string;
  label: string;
  quotationNumber: string;
};

/** Thin picker options for Task Manager (existing consumers). */
export async function getKolamCustomProjectOptions({
  limit = 200,
  page = 1,
}: {
  limit?: number;
  page?: number;
} = {}): Promise<KolamCustomProjectOption[]> {
  const list = await getKolamProyekList({ limit, page });
  return list.items.map(item => ({
    id: item.id,
    label: item.quotationNumber || item.clientName || item.id,
    quotationNumber: item.quotationNumber,
  }));
}

export async function getKolamProyekList(
  query: KolamProyekListQuery = {},
): Promise<KolamProyekListResult> {
  const payload = await kolamRequest<unknown>('/custom-project', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 50,
      ...(query.lifecycleStatus
        ? { lifecycleStatus: query.lifecycleStatus }
        : {}),
      ...(query.customer?.trim() ? { customer: query.customer.trim() } : {}),
    },
  });
  return normalizeKolamProyekList(payload, query);
}

export async function getKolamProyek(ref: string): Promise<KolamProyekDetail> {
  const id = String(ref || '').trim();
  if (!id) {
    throw new Error('Proyek tidak ditemukan.');
  }
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}`,
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Proyek tidak ditemukan.');
  }
  return detail;
}

export async function createKolamProyekQuotation(
  body: KolamProyekQuotationPayload,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>('/custom-project/quotations', {
    method: 'POST',
    body,
  });
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal membuat surat penawaran.');
  }
  return detail;
}

export async function updateKolamProyekQuotation(
  id: string,
  body: KolamProyekQuotationPayload,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/quotation`,
    {
      method: 'PATCH',
      body,
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal memperbarui surat penawaran.');
  }
  return detail;
}

export async function updateKolamProyek(
  id: string,
  body: Record<string, unknown>,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal memperbarui proyek.');
  }
  return detail;
}

export async function updateKolamProyekHppMaterials(
  id: string,
  lifecycleStatus: string | null | undefined,
  lines: KolamProyekHppMaterial[],
): Promise<KolamProyekDetail> {
  const body = {
    hppFromMaterials: buildKolamProyekHppPayload(lines),
  };
  const status = String(lifecycleStatus || '').trim();
  if (status === 'draft' || status === 'revision_in_progress') {
    return updateKolamProyekQuotation(id, body);
  }
  return updateKolamProyek(id, body);
}

export async function sendKolamProyekQuotation(
  id: string,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/quotation/send`,
    { method: 'POST' },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal mengirim surat penawaran.');
  }
  return detail;
}

export async function resendKolamProyekQuotation(
  id: string,
  resolutionNote?: string,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/quotation/resend`,
    {
      method: 'POST',
      body: resolutionNote?.trim()
        ? { resolutionNote: resolutionNote.trim() }
        : {},
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal mengirim ulang surat penawaran.');
  }
  return detail;
}

export async function cancelKolamProyek(
  id: string,
  reason: string,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      body: { reason },
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal membatalkan proyek.');
  }
  return detail;
}

export async function deleteKolamProyek(
  id: string,
  password: string,
): Promise<void> {
  await kolamRequest<unknown>(`/custom-project/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    body: { password },
  });
}

export async function confirmKolamProyekDpReceived(
  id: string,
  index: number,
  body: { amount: number; note?: string },
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/dp-schedule/${index}/confirm-received`,
    {
      method: 'POST',
      body: {
        amount: body.amount,
        ...(body.note?.trim() ? { note: body.note.trim() } : {}),
      },
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal mengonfirmasi pembayaran DP.');
  }
  return detail;
}

export async function uploadKolamProyekDpProofs(
  id: string,
  index: number,
  files: Array<{ uri: string; name?: string; mimeType?: string }>,
  note?: string,
): Promise<KolamProyekDetail> {
  if (!files.length) {
    throw new Error('Pilih minimal satu file bukti.');
  }
  const body = new FormData();
  for (const file of files) {
    body.append(
      'proofs',
      createReactNativeFilePart(
        file.uri,
        file.name || 'bukti.bin',
        file.mimeType,
      ) as unknown as Blob,
    );
  }
  if (note?.trim()) {
    body.append('note', note.trim());
  }
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/dp-schedule/${index}/proofs`,
    {
      method: 'POST',
      body,
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal mengunggah bukti pembayaran DP.');
  }
  return detail;
}

export async function reverseKolamProyekDpConfirmation(
  id: string,
  index: number,
  confirmationIndex: number,
  reason?: string,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/dp-schedule/${index}/reverse-confirmation`,
    {
      method: 'POST',
      body: {
        confirmationIndex,
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      },
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal membatalkan konfirmasi pembayaran DP.');
  }
  return detail;
}

export async function downloadKolamProyekKwitansi(
  id: string,
  index: number,
  kwitansiNumber?: string | null,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/custom-project/${encodeURIComponent(id)}/dp-schedule/${index}/kwitansi`;
  const safe = String(kwitansiNumber || `dp-${index + 1}`).replace(
    /[^\w.-]+/g,
    '_',
  );
  return downloadKolamProyekBinary(url, `Kwitansi-${safe}.pdf`);
}

export async function transitionKolamProyekLifecycle(
  id: string,
  to: KolamProyekLifecycleStatus,
  note: string,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/lifecycle`,
    {
      method: 'PATCH',
      body: { to, note },
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal mengubah status proyek.');
  }
  return detail;
}

export async function updateKolamProyekProgress(
  id: string,
  body: { progressPercent: number; progressNote?: string },
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/progress`,
    {
      method: 'PUT',
      body: {
        progressPercent: body.progressPercent,
        ...(body.progressNote != null
          ? { progressNote: body.progressNote }
          : {}),
      },
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal memperbarui progress.');
  }
  return detail;
}

export async function submitKolamProyekDesign(
  id: string,
  input: KolamProyekSubmitRoundInput,
): Promise<KolamProyekDetail> {
  return submitKolamProyekRound(
    `/custom-project/${encodeURIComponent(id)}/design/submit`,
    input,
    'Gagal mengirim desain.',
  );
}

export async function submitKolamProyekDelivery(
  id: string,
  input: KolamProyekSubmitRoundInput,
): Promise<KolamProyekDetail> {
  return submitKolamProyekRound(
    `/custom-project/${encodeURIComponent(id)}/delivery/submit`,
    input,
    'Gagal mengirim bukti pengerjaan.',
  );
}

export async function closeKolamProyek(id: string): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/close-project`,
    {
      method: 'POST',
      body: {},
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal menutup proyek.');
  }
  return detail;
}

export async function downloadKolamProyekInvoice(
  id: string,
  quotationNumber?: string | null,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/custom-project/${encodeURIComponent(id)}/invoice`;
  const safe = String(quotationNumber || id || 'invoice').replace(
    /[^\w.-]+/g,
    '_',
  );
  return downloadKolamProyekBinary(url, `Invoice-${safe}.pdf`);
}

async function submitKolamProyekRound(
  path: string,
  input: KolamProyekSubmitRoundInput,
  fallbackError: string,
): Promise<KolamProyekDetail> {
  const body = new FormData();
  for (const file of input.files) {
    body.append(
      'files',
      createReactNativeFilePart(
        file.uri,
        file.name || 'upload.bin',
        file.mimeType,
      ) as unknown as Blob,
    );
  }
  if (input.note?.trim()) {
    body.append('note', input.note.trim());
  }
  if (input.roundTitle?.trim()) {
    body.append('roundTitle', input.roundTitle.trim());
  }
  if (input.deadline?.trim()) {
    body.append('deadline', input.deadline.trim());
  }
  if (input.resolutionNote?.trim()) {
    body.append('resolutionNote', input.resolutionNote.trim());
  }

  const payload = await kolamRequest<unknown>(path, {
    method: 'POST',
    body,
  });
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error(fallbackError);
  }
  return detail;
}

function createReactNativeFilePart(
  localUri: string,
  fallbackName: string,
  mimeType?: string,
) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = fallbackName || normalizedUri.split('/').pop() || 'upload.bin';
  return {
    uri: normalizedUri,
    name,
    type: mimeType || inferFileMimeType(name),
  };
}

function inferFileMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'mp4':
      return 'video/mp4';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

async function downloadKolamProyekBinary(
  url: string,
  fallbackName: string,
): Promise<{ path?: string; name: string }> {
  const headers: Record<string, string> = {
    Accept: 'application/pdf,*/*',
    ...getRuntimeClientHeaders({ sourceHeader: appConfig.kolamSourceHeader }),
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const nativeIdentity = getNativeDeviceIdentity();
  const macHeader = nativeIdentity.macAddresses?.join(',');
  if (macHeader) {
    headers['x-device-mac'] = macHeader;
  }
  if (nativeIdentity.macSignature) {
    headers['x-device-mac-signature'] = nativeIdentity.macSignature;
  }

  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    let message: string | undefined;
    let code: string | undefined;
    try {
      const body: unknown = await response.json();
      const record =
        body && typeof body === 'object'
          ? (body as Record<string, unknown>)
          : {};
      message = typeof record.message === 'string' ? record.message : undefined;
      code =
        typeof record.errorCode === 'string'
          ? record.errorCode
          : typeof record.code === 'string'
            ? record.code
            : undefined;
    } catch {
      message = await response.text();
    }
    throw new ApiError(response.status, { message, code });
  }

  const filename =
    deriveFilenameFromDisposition(
      response.headers.get('content-disposition') ?? undefined,
    ) ?? fallbackName;
  const buffer = await response.arrayBuffer();
  const saveResult = await saveNativeBase64File(
    filename,
    arrayBufferToBase64(buffer),
  );
  if (saveResult.cancelled) {
    throw new Error('Unduhan dibatalkan.');
  }
  return {
    name: saveResult.name ?? filename,
    path: saveResult.path,
  };
}

function deriveFilenameFromDisposition(value?: string) {
  if (!value) {
    return undefined;
  }
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(value);
  return plainMatch?.[1]?.trim() || undefined;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return globalThis.btoa(binary);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}
