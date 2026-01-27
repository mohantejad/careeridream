const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const buildUrl = (input: string) =>
  input.startsWith("http") ? input : `${API_BASE_URL}${input}`;

export const getApiBaseUrl = () => API_BASE_URL;

export const refreshAccessToken = async (): Promise<boolean> => {
  const response = await fetch(buildUrl("/auth/jwt/refresh/"), {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
};

export const apiFetch = async (
  input: string,
  init: RequestInit = {}
): Promise<Response> => {
  const requestInit: RequestInit = {
    credentials: "include",
    ...init,
  };
  const url = buildUrl(input);

  let response = await fetch(url, requestInit);
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

