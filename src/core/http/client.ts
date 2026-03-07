/**
 * HTTP client foundation for GNyx frontend.
 * Goal: centralize request/response handling before service-by-service migration.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ResponseParser = "json" | "text" | "blob" | "arrayBuffer" | "void" | "response";

type QueryPrimitive = string | number | boolean | Date;
export type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;

export interface HttpClientConfig {
  baseURL?: string;
  defaultHeaders?: HeadersInit;
  timeoutMs?: number;
  credentials?: RequestCredentials;
}

export interface RequestOptions<TBody = unknown>
  extends Omit<RequestInit, "method" | "body" | "headers" | "credentials" | "signal"> {
  body?: TBody;
  headers?: HeadersInit;
  query?: Record<string, QueryValue>;
  timeoutMs?: number;
  parseAs?: ResponseParser;
  credentials?: RequestCredentials;
  useBaseURL?: boolean;
  signal?: AbortSignal;
}

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

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
const DEFAULT_HEADERS: HeadersInit = { Accept: "application/json" };
const DEFAULT_CREDENTIALS: RequestCredentials = "same-origin";

const isAbsoluteURL = (value: string): boolean => /^https?:\/\//i.test(value);

const toQueryStringValue = (value: QueryPrimitive): string => {
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const appendQuery = (params: URLSearchParams, key: string, value: QueryValue): void => {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    for (const item of value) {
      params.append(key, toQueryStringValue(item));
    }
    return;
  }

  params.append(key, toQueryStringValue(value));
};

const mergeSignal = (controller: AbortController, externalSignal?: AbortSignal): (() => void) => {
  if (!externalSignal) return () => {};

  if (externalSignal.aborted) {
    controller.abort();
    return () => {};
  }

  const onAbort = () => controller.abort();
  externalSignal.addEventListener("abort", onAbort, { once: true });
  return () => externalSignal.removeEventListener("abort", onAbort);
};

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: HeadersInit;
  private readonly timeoutMs: number;
  private readonly credentials: RequestCredentials;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL ?? DEFAULT_BASE_URL;
    this.defaultHeaders = config.defaultHeaders ?? DEFAULT_HEADERS;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.credentials = config.credentials ?? DEFAULT_CREDENTIALS;
  }

  async request<TResponse = unknown, TBody = unknown>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const {
      body,
      headers: requestHeaders,
      query,
      timeoutMs,
      parseAs,
      credentials,
      useBaseURL = true,
      signal,
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint, query, useBaseURL);
    const composedHeaders = new Headers(this.defaultHeaders);
    if (requestHeaders) {
      new Headers(requestHeaders).forEach((value, key) => composedHeaders.set(key, value));
    }

    const payload = this.serializeBody(body, composedHeaders);

    const controller = new AbortController();
    const cleanupSignal = mergeSignal(controller, signal);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs ?? this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers: composedHeaders,
        body: payload,
        credentials: credentials ?? this.credentials,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.buildHttpError(response, method, url);
      }

      return await this.parseResponse<TResponse>(response, parseAs);
    } catch (error) {
      if (error instanceof HttpError) throw error;

      const message = error instanceof Error ? error.message : "Unexpected network error";
      throw new HttpError(message, {
        url,
        method,
        status: 0,
        statusText: "NETWORK_ERROR",
      });
    } finally {
      clearTimeout(timeoutId);
      cleanupSignal();
    }
  }

  get<TResponse = unknown>(endpoint: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>("GET", endpoint, options);
  }

  post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>("POST", endpoint, { ...options, body });
  }

  put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>("PUT", endpoint, { ...options, body });
  }

  patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>("PATCH", endpoint, { ...options, body });
  }

  delete<TResponse = unknown>(endpoint: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>("DELETE", endpoint, options);
  }

  private buildURL(
    endpoint: string,
    query: Record<string, QueryValue> | undefined,
    useBaseURL: boolean,
  ): string {
    const baseTarget = useBaseURL ? this.baseURL : "";
    const rawURL = this.composeURL(baseTarget, endpoint);
    if (!query) return rawURL;

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => appendQuery(params, key, value));
    const queryString = params.toString();
    if (!queryString) return rawURL;

    return `${rawURL}${rawURL.includes("?") ? "&" : "?"}${queryString}`;
  }

  private composeURL(baseURL: string, endpoint: string): string {
    if (isAbsoluteURL(endpoint)) return endpoint;
    if (!baseURL) return endpoint;

    const normalizedBase = baseURL.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${normalizedBase}${normalizedEndpoint}`;
  }

  private serializeBody<TBody>(body: TBody | undefined, headers: Headers): BodyInit | undefined {
    if (body === undefined || body === null) return undefined;

    if (
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof URLSearchParams ||
      typeof body === "string"
    ) {
      return body as BodyInit;
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return JSON.stringify(body);
  }

  private async parseResponse<T>(response: Response, parseAs?: ResponseParser): Promise<T> {
    const mode = parseAs ?? this.inferParser(response);

    switch (mode) {
      case "void":
        return undefined as T;
      case "response":
        return response as T;
      case "text":
        return (await response.text()) as T;
      case "blob":
        return (await response.blob()) as T;
      case "arrayBuffer":
        return (await response.arrayBuffer()) as T;
      case "json":
      default:
        if (response.status === 204) return undefined as T;
        return (await response.json()) as T;
    }
  }

  private inferParser(response: Response): ResponseParser {
    if (response.status === 204) return "void";
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("application/json") ? "json" : "text";
  }

  private async buildHttpError(response: Response, method: HttpMethod, url: string): Promise<HttpError> {
    const contentType = response.headers.get("content-type") ?? "";
    const isJSON = contentType.includes("application/json");

    let data: unknown;
    if (isJSON) {
      data = await response.json().catch(() => undefined);
    } else {
      data = await response.text().catch(() => undefined);
    }

    const dataAsRecord = data && typeof data === "object" ? (data as Record<string, unknown>) : undefined;
    const code = typeof dataAsRecord?.code === "string"
      ? dataAsRecord.code
      : typeof dataAsRecord?.error === "string"
        ? dataAsRecord.error
        : undefined;
    const message = typeof dataAsRecord?.message === "string"
      ? dataAsRecord.message
      : `${response.status} ${response.statusText}`;

    return new HttpError(message, {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      code,
      data,
    });
  }
}

export const httpClient = new HttpClient();
