import hashlib
import os
import re
from datetime import datetime
from typing import Tuple, Optional, Dict, Any

# Database interface (abstracted for different database systems)
class Database:
    def __init__(self):
        # Initialize database connection
        # This is a mock implementation - replace with actual DB connection
        self.users = {}  # In production, use actual database
    
    def user_exists(self, email: str) -> bool:
        """Check if user already exists"""
        # In production, query your database
        return email in self.users
    
    def create_user(self, user_data: Dict[str, Any]) -> bool:
        """Store user in database"""
        try:
            self.users[user_data['email']] = user_data
            # In production: execute INSERT query
            # Example SQL: INSERT INTO users (email, password_hash, salt, created_at) VALUES (?, ?, ?, ?)
            return True
        except:
            return False
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Retrieve user by email"""
        return self.users.get(email)


class UserRegistration:
    def __init__(self, db: Database):
        self.db = db
        # Minimum password requirements
        self.MIN_PASSWORD_LENGTH = 8
        self.MAX_PASSWORD_LENGTH = 128
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def validate_password_strength(self, password: str) -> Tuple[bool, str]:
        """Check password meets security requirements"""
        if len(password) < self.MIN_PASSWORD_LENGTH:
            return False, f"Password must be at least {self.MIN_PASSWORD_LENGTH} characters long"
        
        if len(password) > self.MAX_PASSWORD_LENGTH:
            return False, f"Password must be at most {self.MAX_PASSWORD_LENGTH} characters long"
        
        # Check for at least one uppercase letter
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        # Check for at least one lowercase letter
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        # Check for at least one digit
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit"
        
        # Check for at least one special character
        special_chars = "!@#$%^&*()-_=+[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character"
        
        return True, "Password is strong"
    
    @staticmethod
    def generate_salt() -> str:
        """Generate a random salt for password hashing"""
        return os.urandom(32).hex()
    
    @staticmethod
    def hash_password(password: str, salt: str) -> str:
        """Hash password with salt using SHA-256 (consider using bcrypt or Argon2 in production)"""
        # For production, use: bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        salted_password = password + salt
        return hashlib.sha256(salted_password.encode()).hexdigest()
    
    def register_user(self, email: str, password: str) -> Tuple[bool, str]:
        """
        Register a new user
        
        Returns:
            Tuple[bool, str]: (success, message)
        """
        # Validate input
        if not email or not password:
            return False, "Email and password are required"
        
        # Validate email format
        if not self.validate_email(email):
            return False, "Invalid email format"
        
        # Validate password strength
        is_strong, message = self.validate_password_strength(password)
        if not is_strong:
            return False, f"Weak password: {message}"
        
        # Check if user already exists
        if self.db.user_exists(email):
            return False, "User with this email already exists"
        
        # Generate salt and hash password
        salt = self.generate_salt()
        password_hash = self.hash_password(password, salt)
        
        # Prepare user data
        user_data = {
            'email': email.lower().strip(),  # Normalize email
            'password_hash': password_hash,
            'salt': salt,
            'created_at': datetime.now().isoformat(),
            'is_active': True,
            'failed_login_attempts': 0
        }
        
        # Store user in database
        if self.db.create_user(user_data):
            return True, "User registered successfully"
        else:
            return False, "Failed to register user"
    
    def verify_password(self, email: str, password: str) -> bool:
        """Verify user's password"""
        user = self.db.get_user_by_email(email)
        if not user:
            return False
        
        # Hash the provided password with stored salt
        test_hash = self.hash_password(password, user['salt'])
        return test_hash == user['password_hash']


# Example usage with SQLite (production-ready example)
import sqlite3
import bcrypt
from contextlib import contextmanager

class SQLiteDatabase:
    def __init__(self, db_path: str = "users.db"):
        self.db_path = db_path
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except:
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def init_database(self):
        """Initialize database with users table"""
        with self.get_connection() as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_login TIMESTAMP,
                    failed_login_attempts INTEGER DEFAULT 0
                )
            ''')
    
    def user_exists(self, email: str) -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute(
                "SELECT 1 FROM users WHERE email = ? AND is_active = TRUE",
                (email.lower(),)
            )
            return cursor.fetchone() is not None
    
    def create_user(self, email: str, password_hash: str) -> bool:
        try:
            with self.get_connection() as conn:
                conn.execute(
                    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                    (email.lower(), password_hash)
                )
            return True
        except sqlite3.IntegrityError:
            return False  # User already exists
        except:
            return False


class ProductionUserRegistration:
    """Production-ready implementation with bcrypt"""
    
    def __init__(self, db: SQLiteDatabase):
        self.db = db
    
    def register_user(self, email: str, password: str) -> Tuple[bool, str]:
        # Validate inputs
        if not self.validate_email(email):
            return False, "Invalid email format"
        
        if self.db.user_exists(email):
            return False, "User already exists"
        
        # Hash password with bcrypt
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Store user
        if self.db.create_user(email, password_hash):
            return True, "Registration successful"
        return False, "Registration failed"
    
    @staticmethod
    def validate_email(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))


# Example usage
if __name__ == "__main__":
    # Simple example
    db = Database()
    registration = UserRegistration(db)
    
    # Test registration
    success, message = registration.register_user(
        "user@example.com",
        "SecurePass123!"
    )
    print(f"Registration: {success}, Message: {message}")
    
    # Test password verification
    if success:
        is_valid = registration.verify_password(
            "user@example.com",
            "SecurePass123!"
        )
        print(f"Password valid: {is_valid}")
    
    # Production example with SQLite and bcrypt
    print("\n--- Production Example ---")
    sqlite_db = SQLiteDatabase()
    prod_registration = ProductionUserRegistration(sqlite_db)
    
    success, message = prod_registration.register_user(
        "john.doe@example.com",
        "MySecurePass123!"
    )
    print(f"Production Registration: {success}, Message: {message}")




# Key Security Considerations:
# Password Hashing: Never store plain text passwords. Use strong hashing algorithms like bcrypt, Argon2, or PBKDF2.

# Input Validation: Validate and sanitize all user inputs to prevent injection attacks.

# Email Normalization: Convert emails to lowercase and trim whitespace.

# Password Strength: Enforce minimum complexity requirements.

# SQL Injection Prevention: Use parameterized queries (shown in SQLite example).

# Error Handling: Don't leak sensitive information in error messages.

# For Production Use:
# Use a real database: PostgreSQL, MySQL, or MongoDB with proper security configurations.

# Add rate limiting: Prevent brute force attacks.

# Implement email verification: Send confirmation emails.

# Add logging: Log registration attempts for security monitoring.

# Use HTTPS: Always transmit credentials over encrypted connections.

# Consider OAuth2/OpenID Connect: For more secure authentication flows.

# Choose the implementation based on your specific requirements and security needs. The SQLite with bcrypt example is more production-ready, while the first example demonstrates the concepts more clearly.