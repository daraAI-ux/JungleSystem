export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload = {}) {
    super(payload.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.errors = payload.errors;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

