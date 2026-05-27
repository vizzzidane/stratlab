from flask import Blueprint, jsonify, request

from api.validation import validate_backtest_payload


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

    return jsonify({"ok": True, "message": "Backtest endpoint scaffolded"})
