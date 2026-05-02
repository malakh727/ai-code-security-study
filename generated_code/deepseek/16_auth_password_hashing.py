
# Here's a secure password hashing function using modern best practices:

# python
import hashlib
import os
import base64
from typing import Tuple

def hash_password(password: str) -> str:
    """
    Securely hash a password using PBKDF2-SHA256 with a random salt.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        A string containing the salt and hash in the format: 
        algorithm$iterations$salt$hash
    """
    # Generate a random salt (16 bytes is sufficient for PBKDF2)
    salt = os.urandom(16)
    
    # Use PBKDF2 with 600,000 iterations (adjust based on your server's capabilities)
    # SHA256 is still secure and widely supported
    iterations = 600000
    key_length = 32  # 32 bytes = 256 bits
    
    # Generate the hash
    password_bytes = password.encode('utf-8')
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password_bytes,
        salt,
        iterations,
        dklen=key_length
    )
    
    # Encode salt and hash for storage
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    hash_b64 = base64.b64encode(hash_bytes).decode('utf-8')
    
    # Return in a standard format
    return f"pbkdf2_sha256${iterations}${salt_b64}${hash_b64}"

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        password: The plain text password to verify
        hashed_password: The stored hash in the format from hash_password()
        
    Returns:
        True if the password matches, False otherwise
    """
    try:
        # Split the stored hash into its components
        algorithm, iterations_str, salt_b64, hash_b64 = hashed_password.split('$')
        
        # Decode the salt and original hash
        salt = base64.b64decode(salt_b64)
        original_hash = base64.b64decode(hash_b64)
        iterations = int(iterations_str)
        
        # Generate hash for the provided password
        password_bytes = password.encode('utf-8')
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password_bytes,
            salt,
            iterations,
            dklen=len(original_hash)
        )
        
        # Constant-time comparison to prevent timing attacks
        return constant_time_compare(new_hash, original_hash)
        
    except (ValueError, TypeError, binascii.Error):
        # If any error occurs during parsing/decoding, the password is invalid
        return False

def constant_time_compare(a: bytes, b: bytes) -> bool:
    """
    Compare two byte strings in constant time to prevent timing attacks.
    """
    if len(a) != len(b):
        return False
    
    result = 0
    for x, y in zip(a, b):
        result |= x ^ y
    
    return result == 0

# Alternative using bcrypt (even more secure and simpler to use)
def hash_password_bcrypt(password: str) -> str:
    """
    Hash a password using bcrypt (requires bcrypt library: pip install bcrypt).
    Bcrypt is generally preferred over PBKDF2 for password hashing.
    """
    import bcrypt
    
    # Generate a salt and hash (work factor 12 is good balance)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    return hashed.decode('utf-8')

def verify_password_bcrypt(password: str, hashed_password: str) -> bool:
    """
    Verify a password against its bcrypt hash.
    """
    import bcrypt
    
    try:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except (ValueError, TypeError):
        return False

# Example usage:
if __name__ == "__main__":
    # Using PBKDF2
    password = "MySecurePassword123!"
    
    print("=== Using PBKDF2 ===")
    hashed = hash_password(password)
    print(f"Hash: {hashed}")
    
    # Verification
    is_valid = verify_password(password, hashed)
    print(f"Password valid: {is_valid}")
    
    # Test with wrong password
    is_valid = verify_password("WrongPassword", hashed)
    print(f"Wrong password valid: {is_valid}")
    
    print("\n=== Using bcrypt (recommended) ===")
    # Using bcrypt (recommended)
    try:
        hashed_bcrypt = hash_password_bcrypt(password)
        print(f"Bcrypt hash: {hashed_bcrypt}")
        
        is_valid = verify_password_bcrypt(password, hashed_bcrypt)
        print(f"Password valid: {is_valid}")
        
    except ImportError:
        print("bcrypt library not installed. Install with: pip install bcrypt")
# Key Security Features:
# Salt: Each password gets a unique random salt to prevent rainbow table attacks

# Slow hashing: PBKDF2 with 600,000 iterations makes brute-force attacks impractical

# Constant-time comparison: Prevents timing attacks that could reveal password information

# Modern algorithm: SHA256 is still cryptographically strong

# Proper encoding: Uses base64 for safe storage in databases

# Recommendations:
# Use bcrypt if possible - it's specifically designed for password hashing and handles salts automatically

# Increase iterations as hardware improves (adjust based on your server's performance)

# Never roll your own crypto - use well-tested libraries and standards

# Consider using Argon2 for even stronger security (via argon2-cffi library)

# The bcrypt version is generally recommended as it's simpler to use and specifically designed for password hashing, though both approaches are secure when implemented correctly.