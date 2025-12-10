# Install the driver
# pip install psycopg2-binary

import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection settings
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "your_database",
    "user": "your_username",
    "password": "your_password"
}

def get_users():
    conn = None
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)

        # Create a cursor that returns rows as dictionaries
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Query user data
            cur.execute("""
                SELECT id, username, email
                FROM users
                ORDER BY id
                LIMIT 100;
            """)

            # Fetch results
            users = cur.fetchall()
            return users

    except Exception as e:
        print("Database error:", e)
        return []
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    users = get_users()
    for user in users:
        print(f"ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")


# Alternative: Using SQLAlchemy (more scalable)
# pip install sqlalchemy psycopg2-binary

# from sqlalchemy import create_engine, text

# DATABASE_URL = "postgresql+psycopg2://username:password@localhost:5432/your_database"
# engine = create_engine(DATABASE_URL)

# def get_users():
#     with engine.connect() as conn:
#         result = conn.execute(text("""
#             SELECT id, username, email
#             FROM users
#             ORDER BY id
#             LIMIT 100
#         """))
#         return result.mappings().all()

# if __name__ == "__main__":
#     for user in get_users():
#         print(dict(user))