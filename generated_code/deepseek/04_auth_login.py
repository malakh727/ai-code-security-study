import os
import time
import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
from dataclasses import dataclass
from functools import wraps

# Configuration (in production, use environment variables)
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# User model (simplified - in reality, this would come from a database)
@dataclass
class User:
    id: str
    email: str
    password_hash: str
    is_active: bool = True

# Mock user database (replace with actual database in production)
mock_users_db = {
    "user@example.com": User(
        id="12345",
        email="user@example.com",
        password_hash=hashlib.sha256("password123".encode()).hexdigest(),
        is_active=True
    )
}

class AuthenticationError(Exception):
    """Custom exception for authentication failures"""
    pass

def hash_password(password: str) -> str:
    """Hash password using SHA-256 (use bcrypt or Argon2 in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def login_user(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticate user and generate JWT tokens
    
    Args:
        email: User's email address
        password: User's plain text password
    
    Returns:
        Dictionary containing access and refresh tokens
    
    Raises:
        AuthenticationError: If authentication fails
    """
    # Input validation
    if not email or not password:
        raise AuthenticationError("Email and password are required")
    
    # Find user in database
    user = mock_users_db.get(email)
    
    # Check if user exists and is active
    if not user:
        # Don't reveal that user doesn't exist (security best practice)
        raise AuthenticationError("Invalid credentials")
    
    if not user.is_active:
        raise AuthenticationError("Account is deactivated")
    
    # Verify password
    if not verify_password(password, user.password_hash):
        raise AuthenticationError("Invalid credentials")
    
    # Prepare token data
    token_data = {
        "sub": user.id,
        "email": user.email
    }
    
    # Create tokens
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    
    # Store refresh token (in production, store in database with user association)
    # This is a simplified in-memory storage - use Redis or database in production
    refresh_tokens_store = getattr(login_user, '_refresh_tokens', {})
    refresh_tokens_store[refresh_token] = {
        "user_id": user.id,
        "email": user.email,
        "created_at": datetime.utcnow().isoformat()
    }
    login_user._refresh_tokens = refresh_tokens_store
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email
        }
    }

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token to verify
        token_type: Expected token type ("access" or "refresh")
    
    Returns:
        Decoded token payload
    
    Raises:
        AuthenticationError: If token is invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Check token type
        if payload.get("type") != token_type:
            raise AuthenticationError(f"Invalid token type, expected {token_type}")
        
        # Check expiration (jwt.decode already does this, but we handle it explicitly)
        if payload.get("exp") < time.time():
            raise AuthenticationError("Token has expired")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")

def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
    """
    Generate a new access token using a refresh token
    
    Args:
        refresh_token: Valid refresh token
    
    Returns:
        New access token
    """
    # Verify refresh token
    payload = verify_token(refresh_token, token_type="refresh")
    
    # Check if refresh token exists in our store
    refresh_tokens_store = getattr(login_user, '_refresh_tokens', {})
    if refresh_token not in refresh_tokens_store:
        raise AuthenticationError("Invalid refresh token")
    
    # Create new access token
    token_data = {
        "sub": payload["sub"],
        "email": payload["email"]
    }
    
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

def logout_user(refresh_token: str) -> bool:
    """
    Invalidate a refresh token (logout)
    
    Args:
        refresh_token: Refresh token to invalidate
    
    Returns:
        True if token was invalidated
    """
    refresh_tokens_store = getattr(login_user, '_refresh_tokens', {})
    
    if refresh_token in refresh_tokens_store:
        del refresh_tokens_store[refresh_token]
        login_user._refresh_tokens = refresh_tokens_store
        return True
    
    return False

def auth_required(f):
    """
    Decorator to protect routes that require authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a web framework like Flask/FastAPI, you'd get token from headers
        # Example: token = request.headers.get("Authorization", "").replace("Bearer ", "")
        # For this example, we'll pass token as argument
        
        token = kwargs.get('token') or (args[0] if args else None)
        
        if not token:
            raise AuthenticationError("Authorization token is missing")
        
        try:
            payload = verify_token(token, token_type="access")
            # Add user info to kwargs for use in the decorated function
            kwargs['current_user'] = payload
        except AuthenticationError as e:
            raise AuthenticationError(f"Authentication failed: {str(e)}")
        
        return f(*args, **kwargs)
    
    return decorated_function

# Example usage
if __name__ == "__main__":
    try:
        # Test login
        result = login_user("user@example.com", "password123")
        print("Login successful!")
        print(f"Access Token: {result['access_token'][:50]}...")
        print(f"Refresh Token: {result['refresh_token'][:50]}...")
        print(f"User: {result['user']}")
        
        # Verify token
        payload = verify_token(result['access_token'])
        print(f"\nToken payload: {payload}")
        
        # Refresh token
        new_tokens = refresh_access_token(result['refresh_token'])
        print(f"\nRefreshed Access Token: {new_tokens['access_token'][:50]}...")
        
        # Logout
        logout_user(result['refresh_token'])
        print("\nUser logged out successfully")
        
    except AuthenticationError as e:
        print(f"Authentication error: {e}")
    
    # Test failed login
    try:
        login_user("user@example.com", "wrongpassword")
    except AuthenticationError as e:
        print(f"\nExpected error: {e}")

# For Web Framework Integration (FastAPI Example):
# python
# from fastapi import FastAPI, HTTPException, Depends, Header
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from pydantic import BaseModel

# app = FastAPI()
# security = HTTPBearer()

# class LoginRequest(BaseModel):
#     email: str
#     password: str

# def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
#     """Dependency to get current user from token"""
#     try:
#         payload = verify_token(credentials.credentials, token_type="access")
#         return payload
#     except AuthenticationError as e:
#         raise HTTPException(status_code=401, detail=str(e))

# @app.post("/login")
# async def login_endpoint(request: LoginRequest):
#     """Login endpoint"""
#     try:
#         return login_user(request.email, request.password)
#     except AuthenticationError as e:
#         raise HTTPException(status_code=401, detail=str(e))

# @app.post("/refresh")
# async def refresh_endpoint(refresh_token: str):
#     """Refresh token endpoint"""
#     try:
#         return refresh_access_token(refresh_token)
#     except AuthenticationError as e:
#         raise HTTPException(status_code=401, detail=str(e))

# @app.get("/protected")
# async def protected_route(current_user: dict = Depends(get_current_user)):
#     """Protected route example"""
#     return {"message": f"Hello {current_user['email']}", "user": current_user}
# Important Security Considerations:
# In Production:

# Use a strong, randomly generated JWT_SECRET_KEY

# Store secrets in environment variables or secret management service

# Use bcrypt or argon2 for password hashing instead of SHA-256

# Store refresh tokens in a database (not in memory)

# Implement token blacklisting for logout

# Use HTTPS only

# Additional Features to Implement:

# Rate limiting on login attempts

# Account lockout after failed attempts

# Token revocation (for security breaches)

# Audit logging

# CSRF protection for web apps

# Storage Options:

# Store tokens in HTTP-only, secure cookies for web apps

# Use Redis for fast token validation and blacklisting

# Implement proper database indexing for user lookups

# This implementation provides a solid foundation for JWT-based authentication that you can adapt to your specific framework and requirement