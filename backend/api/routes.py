from flask import Blueprint, jsonify, request

from api.validation import validate_backtest_payload
from services.backtester import run_sma_backtest


api_bp = Blueprint("api", __name__)


@api_bp.post("/health")
def health():
    return jsonify({"ok": True, "service": "stratlab-backend"})


@api_bp.post("/backtest")
def backtest():
    payload = request.get_json(silent=True)
    errors = validate_backtest_payload(payload)

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    try:
        result = run_sma_backtest(payload)
    except ValueError as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400
    except Exception:
        return jsonify({"ok": False, "error": "Internal server error"}), 500

    return jsonify(
        {
            "ok": True,
            "ticker": payload["ticker"].strip().upper(),
            "period": payload["period"],
            "short_sma": int(payload["short_sma"]),
            "long_sma": int(payload["long_sma"]),
            "initial_capital": float(payload["initial_capital"]),
            "stats": result["stats"],
            "chart_data": result["chart_data"],
        }
    )
