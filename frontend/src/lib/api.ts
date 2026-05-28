import type { BacktestRequest, BacktestResponse } from "./types";

const BACKTEST_URL = "http://localhost:5000/api/backtest";

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
