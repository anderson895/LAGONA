import os
from flask import Flask
from flask_migrate import Migrate
from dotenv import load_dotenv
from urllib.parse import quote_plus
from models import db

load_dotenv()

migrate = Migrate()


def build_db_url(raw_url: str) -> str:
    """
    Fix URLs where the password contains a literal '@'.
    Supabase passwords ending in '@' must have it percent-encoded as '%40',
    otherwise psycopg2 mis-parses the host from the password field.

    Before: postgresql://user:Lagona2025@@host:5432/postgres
    After:  postgresql://user:Lagona2025%40@host:5432/postgres
    """
    if raw_url and "@@" in raw_url:
        # Replace every '@@' with '%40@' — the first @ is part of the password,
        # the second @ is the user-info / host separator.
        return raw_url.replace("@@", "%40@")
    return raw_url


def create_app():
    app = Flask(__name__)

    # Use DIRECT_URL for migrations (bypasses PgBouncer which doesn't support DDL)
    direct_url = build_db_url(os.getenv("DIRECT_URL"))
    app.config["SQLALCHEMY_DATABASE_URI"] = direct_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret")

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so Flask-Migrate can detect them
    from models import User, Route  # noqa: F401

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)