"""SMA crossover backtesting engine."""

from __future__ import annotations

import numpy as np
import pandas as pd
import yfinance as yf


TRADING_DAYS_PER_YEAR = 252
REQUIRED_COLUMNS = {"Open", "High", "Low", "Close", "Volume"}


def run_backtest(
    ticker: str,
    short_sma: int,
    long_sma: int,
    initial_capital: float,
    period: str,
):
    """Run a long/flat SMA crossover backtest for a ticker."""
    _validate_inputs(ticker, short_sma, long_sma, initial_capital, period)

    data = _fetch_ohlcv(ticker.strip().upper(), period)
    data = _prepare_indicators(data, short_sma, long_sma)

    if len(data) < 2:
        raise ValueError("Insufficient data after calculating moving averages.")

    portfolio = _calculate_portfolios(data, initial_capital)
    stats = _calculate_stats(portfolio, initial_capital)
    chart_data = _build_chart_data(portfolio)

    return {"stats": stats, "chart_data": chart_data}


def _validate_inputs(
    ticker: str,
    short_sma: int,
    long_sma: int,
    initial_capital: float,
    period: str,
) -> None:
    if not isinstance(ticker, str) or not ticker.strip():
        raise ValueError("Invalid ticker: ticker must be a non-empty string.")

    if not isinstance(short_sma, int) or isinstance(short_sma, bool) or short_sma <= 0:
        raise ValueError("short_sma must be a positive integer.")

    if not isinstance(long_sma, int) or isinstance(long_sma, bool) or long_sma <= 0:
        raise ValueError("long_sma must be a positive integer.")

    if long_sma <= short_sma:
        raise ValueError("long_sma must be greater than short_sma.")

    if (
        not isinstance(initial_capital, (int, float))
        or isinstance(initial_capital, bool)
        or initial_capital <= 0
    ):
        raise ValueError("initial_capital must be a positive number.")

    if not isinstance(period, str) or not period.strip():
        raise ValueError("period must be a non-empty string.")


def _fetch_ohlcv(ticker: str, period: str) -> pd.DataFrame:
    try:
        data = yf.download(
            ticker,
            period=period,
            interval="1d",
            progress=False,
            auto_adjust=False,
        )
    except Exception as exc:
        raise ValueError(f"Failed to fetch historical data for ticker '{ticker}'.") from exc

    if data is None or data.empty:
        raise ValueError(f"No historical data returned for ticker '{ticker}'.")

    data = _normalize_yfinance_columns(data)
    missing_columns = REQUIRED_COLUMNS.difference(data.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Historical data is missing required columns: {missing}.")

    data = data.sort_index()
    data = data.loc[:, ["Open", "High", "Low", "Close", "Volume"]].copy()
    data = data.dropna(subset=["Close"])

    if data.empty:
        raise ValueError(f"Historical data for ticker '{ticker}' has no usable close prices.")

    return data


def _normalize_yfinance_columns(data: pd.DataFrame) -> pd.DataFrame:
    if isinstance(data.columns, pd.MultiIndex):
        if len(data.columns.names) > 1 and "Price" in data.columns.names:
            data = data.droplevel([name for name in data.columns.names if name != "Price"], axis=1)
        else:
            data = data.droplevel(-1, axis=1)

    return data


def _prepare_indicators(
    data: pd.DataFrame,
    short_sma: int,
    long_sma: int,
) -> pd.DataFrame:
    if len(data) < long_sma:
        raise ValueError("Insufficient data for the requested long_sma window.")

    prepared = data.copy()
    prepared["short_sma"] = prepared["Close"].rolling(window=short_sma).mean()
    prepared["long_sma"] = prepared["Close"].rolling(window=long_sma).mean()
    prepared = prepared.dropna(subset=["short_sma", "long_sma"])

    if prepared.empty:
        raise ValueError("Insufficient data after calculating moving averages.")

    prepared["signal"] = (prepared["short_sma"] > prepared["long_sma"]).astype(int)
    prepared["entry_signal"] = (
        (prepared["signal"] == 1) & (prepared["signal"].shift(1, fill_value=0) == 0)
    ).astype(int)
    prepared["exit_signal"] = (
        (prepared["signal"] == 0) & (prepared["signal"].shift(1, fill_value=0) == 1)
    ).astype(int)

    return prepared


def _calculate_portfolios(data: pd.DataFrame, initial_capital: float) -> pd.DataFrame:
    portfolio = data.copy()
    portfolio["buy_hold_daily_returns"] = portfolio["Close"].pct_change().fillna(0.0)
    portfolio["strategy_daily_returns"] = (
        portfolio["buy_hold_daily_returns"] * portfolio["signal"].shift(1, fill_value=0)
    )

    portfolio["strategy"] = initial_capital * (
        1 + portfolio["strategy_daily_returns"]
    ).cumprod()
    portfolio["buy_hold"] = initial_capital * (
        1 + portfolio["buy_hold_daily_returns"]
    ).cumprod()

    return portfolio


def _calculate_stats(portfolio: pd.DataFrame, initial_capital: float) -> dict[str, float | int]:
    strategy_returns = portfolio["strategy_daily_returns"]
    buy_hold_returns = portfolio["buy_hold_daily_returns"]
    total_days = int(len(portfolio))
    total_years = total_days / TRADING_DAYS_PER_YEAR

    final_strategy = float(portfolio["strategy"].iloc[-1])
    final_buy_hold = float(portfolio["buy_hold"].iloc[-1])
    total_returns = final_strategy / initial_capital - 1
    buy_hold_total_returns = final_buy_hold / initial_capital - 1

    return {
        "total_returns": _round_float(total_returns),
        "buy_hold_returns": _round_float(buy_hold_total_returns),
        "annualized_return": _round_float(_annualized_return(total_returns, total_years)),
        "annualized_buy_hold_return": _round_float(
            _annualized_return(buy_hold_total_returns, total_years)
        ),
        "strategy_volatility": _round_float(_annualized_volatility(strategy_returns)),
        "buy_hold_volatility": _round_float(_annualized_volatility(buy_hold_returns)),
        "sharpe_ratio": _round_float(_sharpe_ratio(strategy_returns)),
        "buy_hold_sharpe": _round_float(_sharpe_ratio(buy_hold_returns)),
        "max_drawdown": _round_float(_max_drawdown(portfolio["strategy"])),
        "buy_hold_max_drawdown": _round_float(_max_drawdown(portfolio["buy_hold"])),
        "total_trades": int(portfolio["entry_signal"].sum()),
        "win_rate": _round_float(_win_rate(portfolio)),
        "total_days": total_days,
        "total_years": _round_float(total_years),
    }


def _annualized_return(total_return: float, total_years: float) -> float:
    if total_years <= 0:
        return 0.0

    ending_multiple = 1 + total_return
    if ending_multiple <= 0:
        return -1.0

    return ending_multiple ** (1 / total_years) - 1


def _annualized_volatility(returns: pd.Series) -> float:
    volatility = returns.std(ddof=0) * np.sqrt(TRADING_DAYS_PER_YEAR)
    return float(volatility) if pd.notna(volatility) else 0.0


def _sharpe_ratio(returns: pd.Series) -> float:
    volatility = returns.std(ddof=0)
    if pd.isna(volatility) or volatility == 0:
        return 0.0

    return float((returns.mean() / volatility) * np.sqrt(TRADING_DAYS_PER_YEAR))


def _max_drawdown(values: pd.Series) -> float:
    running_max = values.cummax()
    drawdown = values / running_max - 1
    return float(drawdown.min()) if not drawdown.empty else 0.0


def _win_rate(portfolio: pd.DataFrame) -> float:
    entries = portfolio.index[portfolio["entry_signal"] == 1]
    if len(entries) == 0:
        return 0.0

    wins = 0
    completed_trades = 0

    for entry_date in entries:
        future = portfolio.loc[entry_date:]
        exits = future.index[(future["exit_signal"] == 1) & (future.index > entry_date)]
        exit_date = exits[0] if len(exits) > 0 else portfolio.index[-1]

        entry_price = float(portfolio.at[entry_date, "Close"])
        exit_price = float(portfolio.at[exit_date, "Close"])

        completed_trades += 1
        if exit_price > entry_price:
            wins += 1

    return wins / completed_trades if completed_trades else 0.0


def _build_chart_data(portfolio: pd.DataFrame) -> list[dict[str, str | float]]:
    chart = portfolio.loc[:, ["strategy", "buy_hold"]].copy()
    chart.index = pd.to_datetime(chart.index)

    return [
        {
            "date": index.date().isoformat(),
            "strategy": round(float(row["strategy"]), 2),
            "buy_hold": round(float(row["buy_hold"]), 2),
        }
        for index, row in chart.iterrows()
    ]


def _round_float(value: float) -> float:
    if pd.isna(value) or np.isinf(value):
        return 0.0

    return round(float(value), 6)
