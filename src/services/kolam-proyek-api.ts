import { appConfig } from '../config/app';
import {
  normalizeKolamProyekDetail,
  normalizeKolamProyekList,
  type KolamProyekDetail,
  type KolamProyekLifecycleStatus,
  type KolamProyekListQuery,
  type KolamProyekListResult,
  type KolamProyekQuotationPayload,
  type KolamProyekSubmitRoundInput,
} from '../domain/kolam-proyek';
import { apiRequest } from '../lib/api-client';

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
