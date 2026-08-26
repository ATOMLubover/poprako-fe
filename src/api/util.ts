import { appConfig } from "@/config/config";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { useAppStore } from "@/store/app";
import type { Result, ResultFailure } from "@/types/utils/result";

type FormatResponse<T> = {
  code: number;
  message?: string;
  data?: T;
};

const BASE_URL = appConfig.apiBaseUrl;

export class ApiRequestError extends Error {
  readonly httpStatus?: number;

  constructor(failure: ResultFailure) {
    super(failure.error);
    this.name = "ApiRequestError";
    this.httpStatus = failure.httpStatus;
  }
}

export function createHttpFailure(
  error: string,
  httpStatus: number,
): ResultFailure {
  if (httpStatus === 422) {
    useToastStore.getState().showToast(error, "error");
  }

  return { success: false, error, httpStatus };
}

export function resolveHttpErrorMessage(
  message: unknown,
  statusText: string,
  httpStatus: number,
): string {
  if (typeof message === "string" && message.trim().length > 0) return message;
  if (httpStatus === 422) {
    console.error("[API] HTTP 422 响应缺少有效 message", { message });
  }
  return statusText || `HTTP ${httpStatus}`;
}

export function toApiRequestError(failure: ResultFailure): ApiRequestError {
  return new ApiRequestError(failure);
}

export function isReportedValidationError(error: unknown): boolean {
  if (error instanceof ApiRequestError) return error.httpStatus === 422;
  if (typeof error !== "object" || error === null) return false;
  return "httpStatus" in error && error.httpStatus === 422;
}

type ErrorNotifier = (message: string, type: "error") => void;

export function showLocalApiFailure(
  failure: ResultFailure,
  showToast: ErrorNotifier,
  fallback = failure.error,
): void {
  if (failure.httpStatus === 422) return;
  showToast(fallback, "error");
}

export function showLocalCaughtError(
  error: unknown,
  showToast: ErrorNotifier,
  fallback: string,
  preserveErrorMessage = false,
): void {
  if (isReportedValidationError(error)) return;
  const message = preserveErrorMessage && error instanceof Error
    ? error.message
    : fallback;
  showToast(message, "error");
}

type QueryParams = Record<
  string,
  | string
  | number
  | boolean
  | undefined
  | null
  | (string | number | boolean | undefined | null)[]
>;

function buildQuery(
  url: string,
  params?: QueryParams,
): string {
  if (!params || Object.keys(params).length === 0) return url;

  const usp = new URLSearchParams();

  for (const key of Object.keys(params)) {
    const val = params[key as keyof typeof params];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v === undefined || v === null) continue;
        usp.append(key, String(v));
      }
    } else {
      usp.append(key, String(val));
    }
  }

  const qs = usp.toString();

  if (!qs) return url;

  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}
function stripNulls(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripNulls);
  if (typeof obj !== "object") return obj;

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (val === null || val === undefined) continue;
    result[key] = stripNulls(val);
  }
  return result;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  needAuth: boolean = true,
): Promise<Result<T>> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // 自动携带 Auth 头
  if (needAuth) {
    const token = useAppStore.getState().getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "omit",
  };

  const startTime = performance.now();
  const method = options.method ?? "GET";

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);

    if (response.status === 204) {
      if (response.ok) {
        console.debug(
          `[API] ${method} ${url} → 204 (${(performance.now() - startTime).toFixed(0)}ms)`,
        );
        return { success: true, data: undefined as T };
      }

      console.error(
        `[API] ${method} ${url} → HTTP ${response.status}`,
        {
          statusText: response.statusText,
          durationMs: Math.round(performance.now() - startTime),
        },
      );
      return {
        success: false,
        error: response.statusText || `HTTP ${response.status}`,
        httpStatus: response.status,
      };
    }

    // clone 一份用于日志，避免 JSON 解析失败后 body 已消费无法读取
    const clonedResponse = response.clone();

    let body: FormatResponse<T> | null = null;
    try {
      body = (await response.json()) as FormatResponse<T>;
    } catch {
      const rawText = await clonedResponse
        .text()
        .catch(() => "(无法读取响应体)");
      console.error(
        `[API] ${method} ${url} → HTTP ${response.status}, JSON 解析失败`,
        {
          rawBody: rawText.slice(0, 500),
          durationMs: Math.round(performance.now() - startTime),
        },
      );
      const error = response.statusText || `HTTP ${response.status}`;
      return createHttpFailure(error, response.status);
    }

    if (!response.ok) {
      console.error(
        `[API] ${method} ${url} → HTTP ${response.status}`,
        {
          body,
          durationMs: Math.round(performance.now() - startTime),
        },
      );
      const error = resolveHttpErrorMessage(
        body.message,
        response.statusText,
        response.status,
      );
      return createHttpFailure(error, response.status);
    }

    if (body.code !== 0) {
      console.error(
        `[API] ${method} ${url} → code=${body.code}`,
        {
          body,
          durationMs: Math.round(performance.now() - startTime),
        },
      );
      return {
        success: false,
        error: body.message ?? `API code ${body.code}`,
      };
    }

    console.debug(
      `[API] ${method} ${url} → ${response.status} (${(performance.now() - startTime).toFixed(0)}ms)`,
    );
    return { success: true, data: body.data as T };
  } catch (err) {
    console.error(
      `[API] ${method} ${url} → 网络异常`,
      err instanceof Error ? err : { message: String(err) },
      { durationMs: Math.round(performance.now() - startTime) },
    );
    const message = err instanceof Error ? err.message : "未知错误";
    return {
      success: false,
      error: message,
    };
  }
}

function buildQueryUrl(
  url: string,
  params?: QueryParams,
) {
  return buildQuery(url, params);
}

function resolveQueryAndAuth(
  queryParamsOrNeedAuth?: QueryParams | boolean,
  needAuth = true,
): { queryParams?: QueryParams; needAuth: boolean } {
  if (typeof queryParamsOrNeedAuth === "boolean") {
    return { needAuth: queryParamsOrNeedAuth };
  }

  return { queryParams: queryParamsOrNeedAuth, needAuth };
}

export const api = {
  get: <T>(
    url: string,
    queryParams?: QueryParams,
    needAuth = true,
  ) => request<T>(buildQueryUrl(url, queryParams), { method: "GET" }, needAuth),

  post: <T, B>(
    url: string,
    body: B,
    queryParamsOrNeedAuth?: QueryParams | boolean,
    needAuth = true,
  ) => {
    const options = resolveQueryAndAuth(queryParamsOrNeedAuth, needAuth);
    return request<T>(
      buildQueryUrl(url, options.queryParams),
      { method: "POST", body: JSON.stringify(stripNulls(body)) },
      options.needAuth,
    );
  },

  put: <T, B>(
    url: string,
    body: B,
    queryParamsOrNeedAuth?: QueryParams | boolean,
    needAuth = true,
  ) => {
    const options = resolveQueryAndAuth(queryParamsOrNeedAuth, needAuth);
    return request<T>(
      buildQueryUrl(url, options.queryParams),
      { method: "PUT", body: JSON.stringify(stripNulls(body)) },
      options.needAuth,
    );
  },

  delete: <T>(
    url: string,
    queryParamsOrNeedAuth?: QueryParams | boolean,
    needAuth = true,
  ) => {
    const options = resolveQueryAndAuth(queryParamsOrNeedAuth, needAuth);
    return request<T>(
      buildQueryUrl(url, options.queryParams),
      { method: "DELETE" },
      options.needAuth,
    );
  },

  deleteWithBody: <T, B>(
    url: string,
    body: B,
    queryParamsOrNeedAuth?: QueryParams | boolean,
    needAuth = true,
  ) => {
    const options = resolveQueryAndAuth(queryParamsOrNeedAuth, needAuth);
    return request<T>(
      buildQueryUrl(url, options.queryParams),
      { method: "DELETE", body: JSON.stringify(stripNulls(body)) },
      options.needAuth,
    );
  },

  patch: <T, B>(
    url: string,
    body: B,
    queryParamsOrNeedAuth?: QueryParams | boolean,
    needAuth = true,
  ) => {
    const options = resolveQueryAndAuth(queryParamsOrNeedAuth, needAuth);
    return request<T>(
      buildQueryUrl(url, options.queryParams),
      { method: "PATCH", body: JSON.stringify(stripNulls(body)) },
      options.needAuth,
    );
  },
};
