# Here's a secure, modern, and practical way to hash passwords in several popular programming languages (2025–2026 best practices):
# Python (recommended choice in 2025/2026)
# Pythonimport os
from argon2 import PasswordHasher, exceptions

# Recommended parameters (2024–2026) — good balance between security & performance
ph = PasswordHasher(
    time_cost=2,          # number of iterations
    memory_cost=19*1024,  # 19 MiB
    parallelism=2,        # lanes/threads
    hash_len=32,          # output length
    salt_len=16,
    encoding='utf-8'
)

def hash_password(password: str) -> str:
    """
    Securely hashes a password using Argon2id (recommended in 2025).
    
    Returns: encoded hash string (argon2id$v=19$m=19456,t=2,p=2$...)
    """
    if not password or len(password.strip()) == 0:
        raise ValueError("Password cannot be empty")
        
    try:
        return ph.hash(password)
    except Exception as e:
        raise RuntimeError(f"Password hashing failed: {str(e)}")


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a password against a stored Argon2 hash.
    Returns True if correct, False otherwise.
    """
    try:
        ph.verify(hashed_password, password)
        return True
    except exceptions.VerifyMismatchError:
        return False
    except exceptions.InvalidHashError:
        return False


# Example usage:
if __name__ == "__main__":
    password = "mySuperSekretP@ssw0rd2026"
    
    hashed = hash_password(password)
    print("Stored hash:", hashed)
    
    # Later when user logs in:
    correct = verify_password("mySuperSekretP@ssw0rd2026", hashed)
    wrong   = verify_password("wrongpass", hashed)
    
    print("Correct password →", correct)   # True
    print("Wrong password  →", wrong)     # False


# Node.js (using argon2 — most future-proof choice)
# JavaScript
# const argon2 = require('argon2');

# async function hashPassword(password) {
#   if (!password || typeof password !== 'string' || password.trim() === '') {
#     throw new Error('Password cannot be empty');
#   }

#   try {
#     // 2025–2026 sensible parameters
#     const hash = await argon2.hash(password, {
#       type: argon2.argon2id,
#       memoryCost: 19456,    // 19 MiB
#       timeCost: 2,
#       parallelism: 2,
#       hashLength: 32,
#       saltLength: 16,
#     });
#     return hash;
#   } catch (err) {
#     throw new Error(`Password hashing failed: ${err.message}`);
#   }
# }

# async function verifyPassword(password, hashedPassword) {
#   try {
#     return await argon2.verify(hashedPassword, password);
#   } catch (err) {
#     return false;
#   }
# }

# // Usage example with async/await
# (async () => {
#   const pw = "correct horse battery staple 2026";
#   const hash = await hashPassword(pw);
#   console.log("Hash:", hash);

#   console.log("Correct →", await verifyPassword(pw, hash));
#   console.log("Wrong   →", await verifyPassword("wrong", hash));
# })();
# Quick reference – what to use in 2026




# AlgorithmStatus in 2026RecommendationLibraryArgon2idWinner (password hashing competition)Best choiceargon2-cffi (Python), argon2 (Node.js)bcryptStill very commonAcceptable (but slower to tune)bcryptscryptGoodAcceptable alternativescrypt / libsodiumPBKDF2-HMAC-SHA-256Legacy but NIST approvedOnly if forced by compliancebuilt-in cryptoSHA-256 / SHA-512NeverDo NOT use—
# 2026 Bottom line recommendation:
# Use Argon2id with at least:

# 15–20 MiB memory
# 2–4 iterations
# 2–4 threads

# Pick whichever option above matches your programming language/stack.
# Would you like the version for a different language (Go, Java, PHP, Ruby, Rust, C# …)?