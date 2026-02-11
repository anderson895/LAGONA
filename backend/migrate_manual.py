"""
Manual migration script — runs CREATE TABLE directly against Supabase.
Use this if you prefer not to use the Flask-Migrate CLI.
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Fix: '@' in password must be percent-encoded or psycopg2 misreads the host
_raw = os.getenv("DIRECT_URL", "")
DIRECT_URL = _raw.replace("@@", "%40@") if "@@" in _raw else _raw

CREATE_ENUM = """
DO $$ BEGIN
    CREATE TYPE vehicle_type_enum AS ENUM ('jeep', 'bus', 'tricycle');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
"""

CREATE_USERS = """
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_email    ON users (email);
"""

CREATE_ROUTES = """
CREATE TABLE IF NOT EXISTS routes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin       VARCHAR(255) NOT NULL,
    destination  VARCHAR(255) NOT NULL,
    fare         FLOAT        NOT NULL,
    distance_km  FLOAT        NOT NULL,
    vehicle_type vehicle_type_enum NOT NULL DEFAULT 'jeep',
    description  TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP NOT NULL DEFAULT now()
);
"""

CREATE_TRIGGER_FN = """
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
"""

CREATE_TRIGGERS = """
DO $$ BEGIN
    CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_routes_updated_at
        BEFORE UPDATE ON routes
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
"""


def run_migration():
    engine = create_engine(DIRECT_URL)
    steps = [
        ("Creating ENUM type", CREATE_ENUM),
        ("Creating users table", CREATE_USERS),
        ("Creating routes table", CREATE_ROUTES),
        ("Creating updated_at trigger function", CREATE_TRIGGER_FN),
        ("Attaching triggers", CREATE_TRIGGERS),
    ]

    with engine.connect() as conn:
        for label, sql in steps:
            print(f"  -> {label}...")
            conn.execute(text(sql))
        conn.commit()

    print("\nMigration complete - tables created on Supabase.")


if __name__ == "__main__":
    run_migration()