"""Backtesting service functions."""

try:
    from backend.strategies.sma_crossover import run_backtest
except ModuleNotFoundError:
    from strategies.sma_crossover import run_backtest


def run_sma_backtest(payload: dict):
    """Run the SMA crossover strategy from a validated API payload."""
    ticker = payload["ticker"].strip().upper()
    short_sma = int(payload["short_sma"])
    long_sma = int(payload["long_sma"])
    initial_capital = float(payload["initial_capital"])
    period = payload["period"]

    return run_backtest(
        ticker=ticker,
        short_sma=short_sma,
        long_sma=long_sma,
        initial_capital=initial_capital,
        period=period,
    )
