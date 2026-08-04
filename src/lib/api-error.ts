export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  insufficientStock?: string[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: Record<string, string[]>;
  readonly insufficientStock?: string[];

  constructor(status: number, payload: ApiErrorPayload = {}) {
    super(
      sanitizeApiErrorMessage(
        payload.message || `Request failed with status ${status}`,
        status,
      ),
    );
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.errors = payload.errors;
    this.insufficientStock = payload.insufficientStock;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return sanitizeApiErrorMessage(error.message);
  }

  return 'Unknown error';
}

/** Strip HTML bodies so RN empty-states never dump raw markup. */
export function sanitizeApiErrorMessage(
  message: string,
  status?: number,
): string {
  const text = String(message ?? '').trim();
  if (!text) {
    return status
      ? `Request failed with status ${status}`
      : 'Unknown error';
  }

  if (looksLikeHtmlDocument(text)) {
    const statusPart = status ? ` (${status})` : '';
    // Nginx/static maintenance.html is often served on 502/503 when BE is down —
    // not the same as Settings "maintenance POS".
    if (
      /dunia anura - maintenance/i.test(text) ||
      (/maintenance/i.test(text) && /dunia anura/i.test(text))
    ) {
      return `API mengembalikan halaman HTML${statusPart}. Backend mungkin down / gateway error.`;
    }
    return `API mengembalikan HTML${statusPart}, bukan JSON.`;
  }

  if (text.length > 280) {
    return `${text.slice(0, 280)}…`;
  }

  return text;
}

function looksLikeHtmlDocument(text: string) {
  const sample = text.slice(0, 400).toLowerCase();
  return (
    sample.startsWith('<!doctype') ||
    sample.startsWith('<html') ||
    sample.includes('<html') ||
    (sample.includes('<head') && sample.includes('<style'))
  );
}

