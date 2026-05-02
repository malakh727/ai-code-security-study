# Here's a secure password hashing function using bcrypt, the industry standard for password hashing:
# pythonimport bcrypt

def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt.
    
    Args:
        plain_password: The user's plain-text password.
    
    Returns:
        A hashed password string (includes salt + algorithm metadata).
    """
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)  # 12 is a solid default work factor
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")  # Store as string in DB


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    
    Args:
        plain_password: The password the user just typed in.
        hashed_password: The hash retrieved from the database.
    
    Returns:
        True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )
# Example usage:
# python# On registration — hash and store
hashed = hash_password("my_secret_password")
# Store `hashed` in your DB, e.g.: INSERT INTO users (password_hash) VALUES (?)

# On login — retrieve hash from DB and verify
is_valid = verify_password("my_secret_password", hashed)
print(is_valid)  # True

is_valid = verify_password("wrong_password", hashed)
print(is_valid)  # False

# Why this is secure:
# Bcrypt (not SHA/MD5) — General-purpose hash functions like SHA-256 are designed to be fast, which makes brute-force attacks easy. Bcrypt is deliberately slow and designed specifically for passwords.
# Automatic salting — bcrypt.gensalt() generates a unique random salt per password, so two users with the same password will have completely different hashes. This defeats rainbow table attacks.
# Configurable work factor — The rounds=12 parameter controls how computationally expensive hashing is. Increase it over time as hardware gets faster (13 or 14 is also reasonable for stricter security needs). Each increment roughly doubles the cost.
# Timing-safe comparison — bcrypt.checkpw() uses a constant-time comparison internally, preventing timing-based side-channel attacks.
# Never store plain text — The plain password is only ever held in memory momentarily and never written anywhere.

# Installation:
# bashpip install bcrypt
# Alternative: If you're using a framework like Django or Passlib, they have built-in password hashing utilities (django.contrib.auth.hashers, passlib.context) that wrap bcrypt or Argon2 and are worth considering for larger projects.