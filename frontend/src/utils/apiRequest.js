export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { onUnauthorized, ...options } = {}) {
  let response;
  try {
    response = await fetch(path, { credentials: "same-origin", ...options });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Cannot reach the server. Please try again.", 0);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;
    data = null;
  }
  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    const retryAfter = Number(response.headers.get("Retry-After"));
    const message = response.status === 429 && retryAfter > 0
      ? `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`
      : data?.error || "The server could not complete your request. Please try again.";
    throw new ApiError(message, response.status);
  }
  if (data === null) throw new ApiError("The server returned an invalid response.", response.status);
  return data;
}
