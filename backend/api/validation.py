ALLOWED_PERIODS = {"6mo", "1y", "2y", "5y", "10y"}


def validate_backtest_payload(payload: object) -> dict[str, str]:
    if not isinstance(payload, dict):
        return {"body": "Request body must be a JSON object."}

    errors: dict[str, str] = {}

    ticker = payload.get("ticker")
    short_sma = payload.get("short_sma")
    long_sma = payload.get("long_sma")
    initial_capital = payload.get("initial_capital")
    period = payload.get("period")

    if not isinstance(ticker, str) or not ticker.strip():
        errors["ticker"] = "ticker must be a non-empty string."

    if not _is_positive_number(short_sma):
        errors["short_sma"] = "short_sma must be greater than 0."

    if not _is_positive_number(long_sma):
        errors["long_sma"] = "long_sma must be greater than 0."
    elif _is_positive_number(short_sma) and long_sma <= short_sma:
        errors["long_sma"] = "long_sma must be greater than short_sma."

    if not _is_positive_number(initial_capital):
        errors["initial_capital"] = "initial_capital must be greater than 0."

    if period not in ALLOWED_PERIODS:
        errors["period"] = "period must be one of: 6mo, 1y, 2y, 5y, 10y."

    return errors


def _is_positive_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and value > 0
