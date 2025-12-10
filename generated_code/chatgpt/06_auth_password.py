import sqlite3
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(email: str, password: str) -> bool:
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()

        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)

        hashed_password = hash_password(password)

        # Insert user
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, hashed_password)
        )

        conn.commit()
        conn.close()
        return True

    except sqlite3.IntegrityError:
        # Email already exists
        return False

    except Exception as e:
        print("Error:", e)
        return False
