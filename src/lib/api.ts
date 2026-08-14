export const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000";

export type ApplicationStatus = "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

export type Application = {
  _id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  nextAction?: string;
  jobUrl?: string;
  appliedDate: string;
};

export type StoredUser = { id: string; name: string; email: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getErrorMessage(response: Response) {
  try {
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  } catch {
    // The server may return an empty or non-JSON error response.
  }
  if (response.status === 400) return "Please review your input and try again.";
  if (response.status === 401) return "Your session has expired. Please log in again.";
  if (response.status === 403) return "You are not allowed to perform that action.";
  if (response.status === 404) return "The requested resource was not found.";
  if (response.status === 429)
    return "AI analysis is temporarily unavailable. Please try again shortly.";
  if (response.status >= 500)
    return "The server could not complete that request. Please try again.";
  return "Request failed. Please try again.";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) throw new ApiError(await getErrorMessage(response), response.status);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Unable to connect to the server. Make sure the backend is running and try again.",
      0,
    );
  }
}

export function getStoredToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("token");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("user");
  if (!value) return null;
  try {
    return JSON.parse(value) as StoredUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
  }
}

export function authHeaders(token: string, json = false) {
  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}
