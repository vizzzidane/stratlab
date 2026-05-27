from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from api.routes import api_bp
from middleware.request_logging import register_request_logging


ALLOWED_ORIGINS = ["http://localhost:5173"]


def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})

    register_request_logging(app)
    app.register_blueprint(api_bp, url_prefix="/api")

    return app


app = create_app()


if __name__ == "__main__":
    app.run()
