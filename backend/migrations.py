from sqlalchemy import text
from database import engine


def run_migrations():
    """Adds columns that may not exist in older DB schemas."""
    statements = [
        "ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL",
        "ALTER TABLE users ADD COLUMN verification_token_expires DATETIME NULL",
        "ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) NULL",
        "ALTER TABLE users ADD COLUMN password_reset_token_expires DATETIME NULL",
    ]
    with engine.connect() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # column already exists
