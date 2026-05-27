from dotenv import load_dotenv
from flask import Flask


def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)

    return app


app = create_app()


if __name__ == "__main__":
    app.run()
