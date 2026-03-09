import type { HttpMethod } from "./types";

export interface HttpErrorContext<TData = unknown> {
  url: string;
  method: HttpMethod;
  status: number;
  statusText: string;
  code?: string;
  data?: TData;
}

export class HttpError<TData = unknown> extends Error {
  public readonly url: string;
  public readonly method: HttpMethod;
  public readonly status: number;
  public readonly statusText: string;
  public readonly code?: string;
  public readonly data?: TData;

  constructor(message: string, context: HttpErrorContext<TData>) {
    super(message);
    this.name = "HttpError";
    this.url = context.url;
    this.method = context.method;
    this.status = context.status;
    this.statusText = context.statusText;
    this.code = context.code;
    this.data = context.data;
  }
}

export const isHttpError = (error: unknown): error is HttpError => error instanceof HttpError;

export class APIError<TDetails = unknown> extends HttpError<TDetails> {
  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: TDetails,
    context: Partial<HttpErrorContext<TDetails>> = {},
  ) {
    super(message, {
      url: context.url ?? "unknown",
      method: context.method ?? "GET",
      status: status ?? context.status ?? 0,
      statusText: context.statusText ?? "API_ERROR",
      code: code ?? context.code,
      data: details ?? context.data,
    });
    this.name = "APIError";
  }

  get details(): TDetails | undefined {
    return this.data;
  }
}

export const isAPIError = (error: unknown): error is APIError => error instanceof APIError;

const extractMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  return "Unexpected network error";
};

export const toHttpError = (
  error: unknown,
  fallback: HttpErrorContext = {
    url: "unknown",
    method: "GET",
    status: 0,
    statusText: "NETWORK_ERROR",
  },
): HttpError => {
  if (isHttpError(error)) {
    return error;
  }

  return new HttpError(extractMessage(error), fallback);
};

export const toAPIError = (
  error: unknown,
  fallback: HttpErrorContext = {
    url: "unknown",
    method: "GET",
    status: 0,
    statusText: "API_ERROR",
  },
): APIError => {
  if (isAPIError(error)) {
    return error;
  }

  const normalized = toHttpError(error, fallback);
  return new APIError(
    normalized.message,
    normalized.status,
    normalized.code,
    normalized.data,
    {
      url: normalized.url,
      method: normalized.method,
      statusText: normalized.statusText,
    },
  );
};
