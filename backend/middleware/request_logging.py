import logging
import time
from uuid import uuid4

from flask import Flask, g, request


logger = logging.getLogger("stratlab.request")


def register_request_logging(app: Flask) -> None:
    logging.basicConfig(level=logging.INFO)

    @app.before_request
    def start_request_timer() -> None:
        g.request_id = request.headers.get("X-Request-ID", str(uuid4()))
        g.request_started_at = time.perf_counter()

    @app.after_request
    def log_request(response):
        duration_ms = _duration_ms()
        success = response.status_code < 400
        outcome = "success" if success else "failure"

        logger.info(
            "request_id=%s endpoint=%s duration_ms=%.2f status=%s outcome=%s",
            g.get("request_id"),
            request.endpoint or request.path,
            duration_ms,
            response.status_code,
            outcome,
        )

        response.headers["X-Request-ID"] = g.get("request_id", "")
        return response

    @app.teardown_request
    def log_request_failure(error: BaseException | None) -> None:
        if error is None:
            return

        logger.exception(
            "request_id=%s endpoint=%s duration_ms=%.2f outcome=failure",
            g.get("request_id"),
            request.endpoint or request.path,
            _duration_ms(),
            exc_info=True,
        )


def _duration_ms() -> float:
    started_at = g.get("request_started_at")
    if started_at is None:
        return 0.0

    return (time.perf_counter() - started_at) * 1000
