# You can write a function to register a new user that takes the email and password as input, and then uses a database connector (like sqlite3, psycopg2, or an ORM like SQLAlchemy) to insert this information into a users table.

# Here is a conceptual example using Python with the built-in sqlite3 library for simplicity.
import sqlite3
import hashlib # For hashing the password securely

# --- Configuration ---
DATABASE_FILE = 'user_data.db'
# You should use a strong, industry-standard library like 'bcrypt' or 'Argon2'
# in a real-world application, not just simple hashlib for production.

def hash_password(password):
    """
    Hashes the password using SHA-256 for storage.
    Note: This is a simplified example. Use bcrypt or Argon2 in production.
    """
    # We'll encode the password to bytes before hashing
    hashed_bytes = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return hashed_bytes

def register_user(email, password):
    """
    Registers a new user by storing their email and hashed password 
    in the database.

    Args:
        email (str): The user's unique email address.
        password (str): The user's raw password.

    Returns:
        bool: True if registration was successful, False otherwise.
    """
    # 1. Input Validation (Basic)
    if not email or not password:
        print("Error: Email and password must not be empty.")
        return False

    # 2. Hash the password
    hashed_pwd = hash_password(password)
    
    # 3. Connect to the database
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        # Optional: Ensure the table exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        ''')
        
        # 4. Insert the new user data
        # Use parameterized queries (?) to prevent SQL Injection attacks
        cursor.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)", 
            (email, hashed_pwd)
        )
        
        # 5. Commit the changes
        conn.commit()
        print(f"Success: User {email} registered successfully.")
        return True

    except sqlite3.IntegrityError:
        # This typically catches UNIQUE constraint violations (e.g., email already exists)
        print(f"Error: A user with email '{email}' already exists.")
        return False
        
    except sqlite3.Error as e:
        # Catch other database-related errors
        print(f"An unexpected database error occurred: {e}")
        return False
        
    finally:
        # 6. Close the connection
        if conn:
            conn.close()

# --- Example Usage ---
print("--- Attempting to Register a New User ---")
register_user("jane.doe@example.com", "SecureP@ssw0rd123")

print("\n--- Attempting to Register the Same User (Should Fail) ---")
register_user("jane.doe@example.com", "AnotherPassword")

print("\n--- Attempting to Register Another User ---")
register_user("john.smith@example.com", "MyStrongPwd!")


# ⚠️ Key Security Considerations
# In a production environment, you must prioritize security for password storage:

# Use a Dedicated Hashing Library: Do not use hashlib.sha256 for passwords. Use dedicated, slow-to-calculate hashing algorithms designed for passwords, such as Bcrypt or Argon2, which include salting automatically to protect against rainbow table attacks.

# Prevent SQL Injection: Always use parameterized queries (as shown above with ?) to separate the SQL command from user data.

# Validate Input: Add more robust validation for email format and password strength (length, characters, etc.).

# Would you like to see a more advanced example using a library like bcrypt for better password security?