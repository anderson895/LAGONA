# Flask + Supabase Migration

## Project Structure

```
.
├── .env                  # Your environment variables
├── app.py                # Flask app factory (Flask-Migrate entrypoint)
├── models.py             # SQLAlchemy models
├── migrate_manual.py     # Alternative: run SQL directly (no CLI needed)
└── requirements.txt
```

---

## Option A — Flask-Migrate (recommended)

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialise Flask-Migrate (first time only)
```bash
flask --app app.py db init
```
This creates a `migrations/` folder.

### 3. Generate a migration from your models
```bash
flask --app app.py db migrate -m "create users and routes tables"
```

### 4. Apply the migration to Supabase
```bash
flask --app app.py db upgrade
```

> ⚠️ The app uses `DIRECT_URL` (port 5432) for migrations, not the pooler URL.
> PgBouncer (port 6543) does not support DDL statements like `CREATE TABLE`.

---

## Option B — Run SQL directly (no Flask-Migrate CLI)

If you just want to create the tables immediately without managing migration files:

```bash
python migrate_manual.py
```

This will:
- Create the `vehicle_type_enum` ENUM type
- Create the `users` table with indexes
- Create the `routes` table
- Add `updated_at` auto-update triggers on both tables

---

## Future migrations

When you change your models, run:
```bash
flask --app app.py db migrate -m "describe your change"
flask --app app.py db upgrade
```

To roll back the last migration:
```bash
flask --app app.py db downgrade
```
