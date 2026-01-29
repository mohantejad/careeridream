const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const buildUrl = (input: string) =>
  input.startsWith("http") ? input : `${API_BASE_URL}${input}`;

export const getApiBaseUrl = () => API_BASE_URL;

const withTimeout = (timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};

export const refreshAccessToken = async (): Promise<boolean> => {
  const { controller, timeoutId } = withTimeout();
  const response = await fetch(buildUrl("/auth/jwt/refresh/"), {
    method: "POST",
    credentials: "include",
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
  return response.ok;
};

export const apiFetch = async (
  input: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> => {
  const requestInit: RequestInit = {
    credentials: "include",
    ...init,
  };
  const url = buildUrl(input);

  const { controller, timeoutId } = withTimeout(timeoutMs);
  let response = await fetch(url, {
    ...requestInit,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    return response;
  }

  response = await fetch(url, requestInit);
  return response;
};
