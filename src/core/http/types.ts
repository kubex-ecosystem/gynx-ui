export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ResponseParser =
  | "json"
  | "text"
  | "blob"
  | "arrayBuffer"
  | "void"
  | "response";

export type QueryPrimitive = string | number | boolean | Date;

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
