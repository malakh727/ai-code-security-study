import sqlite3
import bcrypt
import re
from typing import Tuple

def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> Tuple[bool, str]:
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

def register_user(email: str, password: str, db_path: str = 'users.db') -> Tuple[bool, str]:
    """
    Register a new user by storing their email and hashed password in the database.
    
    Args:
        email: User's email address
        password: User's plain text password (will be hashed)
        db_path: Path to SQLite database file
    
    Returns:
        Tuple of (success: bool, message: str)
    """
    # Validate email
    if not validate_email(email):
        return False, "Invalid email format"
    
    # Validate password
    is_valid, msg = validate_password(password)
    if not is_valid:
        return False, msg
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check if user already exists
        cursor.execute('SELECT email FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return False, "User with this email already exists"
        
        # Hash the password
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Insert new user
        cursor.execute(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            (email, password_hash)
        )
        
        conn.commit()
        conn.close()
        
        return True, "User registered successfully"
    
    except sqlite3.Error as e:
        return False, f"Database error: {str(e)}"
    except Exception as e:
        return False, f"Error: {str(e)}"


# Example usage
if __name__ == "__main__":
    # Register a new user
    success, message = register_user("user@example.com", "SecurePass123")
    print(f"Registration: {message}")
    
    # Try to register the same user again (should fail)
    success, message = register_user("user@example.com", "AnotherPass456")
    print(f"Duplicate registration: {message}")
    
    # Try with weak password
    success, message = register_user("another@example.com", "weak")
    print(f"Weak password: {message}")


#     Key Features:

# Password Hashing: Uses bcrypt to securely hash passwords (never stores plain text)
# Email Validation: Checks for proper email format
# Password Strength: Requires minimum 8 characters, uppercase, lowercase, and digits
# Duplicate Prevention: Checks if email already exists
# Error Handling: Comprehensive error handling for database and validation errors
# SQL Injection Protection: Uses parameterized queries

# To use this in a real application:

# Install bcrypt: pip install bcrypt
# Consider using PostgreSQL or MySQL instead of SQLite for production
# Add additional security measures like rate limiting and email verification
# Store the database in a secure location with proper permissions

# The function returns a tuple of (success, message) so you can easily handle the result in your application logic.