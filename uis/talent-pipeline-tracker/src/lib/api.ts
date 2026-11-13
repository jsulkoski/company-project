import type {
  Candidate,
  CandidateFilters,
  CandidateInput,
  CandidateNote,
  CandidatePage,
  CandidatePatch,
  NotesResponse,
} from "@/types/candidate";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://playground.4geeks.com/tracker/api/v1";
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      throw new ApiError(readErrorMessage(body, response.status), response.status);
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError("The server returned an unreadable response.", response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.");
    }
    throw new ApiError(
      "Could not connect to the Talent Tracker API. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function readErrorMessage(body: unknown, status: number): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "detail" in body
  ) {
    const detail = body.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          typeof item === "object" &&
          item !== null &&
          "msg" in item &&
          typeof item.msg === "string"
            ? item.msg
            : null,
        )
        .filter((message): message is string => message !== null)
        .join(" ");
    }
  }
  if (status === 404) return "This candidate or note could not be found.";
  if (status >= 500) return "The server is having trouble. Please try again shortly.";
  return `The request could not be completed (HTTP ${status}).`;
}

export async function getCandidates(
  filters: CandidateFilters,
): Promise<CandidatePage> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return request<CandidatePage>(`/records?${params.toString()}`);
}

export function getCandidate(id: string): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`);
}

export function createCandidate(input: CandidateInput): Promise<Candidate> {
  return request<Candidate>("/records", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function replaceCandidate(
  id: string,
  input: CandidateInput,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function updateCandidate(
  id: string,
  patch: CandidatePatch,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function getNotes(id: string): Promise<CandidateNote[]> {
  const response = await request<NotesResponse>(
    `/records/${encodeURIComponent(id)}/notes`,
  );
  return response.data;
}

export async function createNote(
  id: string,
  content: string,
): Promise<void> {
  await request<unknown>(
    `/records/${encodeURIComponent(id)}/notes`,
    { method: "POST", body: JSON.stringify({ content }) },
  );
}

export function removeNote(id: string, noteId: string): Promise<void> {
  return request<void>(
    `/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" },
  );
}
