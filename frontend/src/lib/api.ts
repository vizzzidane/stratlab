import type { BacktestRequest, BacktestResponse } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:5000";
const BACKTEST_URL = `${API_BASE_URL}/api/backtest`;

interface BackendErrorBody {
  error?: string;
  message?: string;
}

function isBackendErrorBody(value: unknown): value is BackendErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    ("error" in value || "message" in value)
  );
}

async function parseError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (isBackendErrorBody(body)) {
      return body.error ?? body.message ?? response.statusText;
    }
  } catch {
    return response.statusText;
  }

  return response.statusText;
}

export async function runBacktest(
  payload: BacktestRequest,
): Promise<BacktestResponse> {
  const response = await fetch(BACKTEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message || "Backtest request failed");
  }

  return (await response.json()) as BacktestResponse;
}
