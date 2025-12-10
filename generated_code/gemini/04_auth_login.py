# That's a common and important task! Below is a conceptual Python example using a fictional Flask application structure and the popular libraries Flask-PyJWT (or a similar JWT library) and a basic password hashing library like bcrypt or Werkzeug for security.

# Since this is a security-sensitive function, I'll structure it with best practices in mind: password hashing and JWT generation/storage.

import jwt
import datetime
from werkzeug.security import check_password_hash # Used for password verification

# --- Configuration (Should be in a separate config file in a real app) ---
# NOTE: Replace 'your-secret-key' with a strong, complex, random key.
SECRET_KEY = 'your-secret-key' 
ALGORITHM = 'HS256'
TOKEN_EXPIRATION_DAYS = 7 

# --- Mock Database and User Model for Demonstration ---
# In a real application, this would be a database query (e.g., SQLAlchemy, MongoDB).
MOCK_USERS_DB = {
    "test@example.com": {
        "user_id": 101,
        "email": "test@example.com",
        # Hashed password for 'password123'. Use generate_password_hash in a real app.
        "password_hash": "pbkdf2:sha256:260000$nU7cRjD0gKjR4oPq$d9e9c8a0b7f6e5d4c3b2a19876543210fedcba9876543210fedcba9876543210", 
        "name": "Test User"
    }
}

def get_user_by_email(email):
    """Mocks fetching user data from the database."""
    return MOCK_USERS_DB.get(email)

# --- Core JWT & Login Functions ---

def generate_auth_token(user_id):
    """
    Generates a JWT token containing the user ID and an expiration timestamp.
    """
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=TOKEN_EXPIRATION_DAYS)
    
    # The 'payload' is the data stored inside the token. 
    # 'iat' (issued at) and 'exp' (expiration) are standard claims.
    payload = {
        'user_id': user_id,
        'iat': datetime.datetime.utcnow(),
        'exp': expiration_time 
    }
    
    # Encode the payload into a JWT string
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def login_user(email, password):
    """
    Authenticates the user, generates a JWT token, and returns the token.
    """
    user = get_user_by_email(email)

    # 1. Check if user exists
    if user is None:
        return {"success": False, "message": "Invalid email or password."}, 401
    
    # 2. Verify the password (using a hashing library for security)
    # NOTE: check_password_hash needs the actual password hash stored in the DB.
    if not check_password_hash(user["password_hash"], password):
        return {"success": False, "message": "Invalid email or password."}, 401
        
    # 3. Generate JWT Token
    token = generate_auth_token(user["user_id"])
    
    # 4. Success Response
    # In a real web app, this token is sent in the response body.
    # The client (browser/app) then stores this token (e.g., in Local Storage, Cookies).
    return {
        "success": True, 
        "message": "Login successful.", 
        "token": token,
        "user": {"id": user["user_id"], "email": user["email"]}
    }, 200

# --- Example Usage (Simulating an HTTP request) ---

# Successful login
successful_response, status_code = login_user("test@example.com", "password123")
print("\n--- Successful Login ---")
print(f"Status: {status_code}")
print(f"Token: {successful_response.get('token', 'N/A')}") 

# Failed login (wrong password)
failed_response, status_code = login_user("test@example.com", "wrongpassword")
print("\n--- Failed Login ---")
print(f"Status: {status_code}")
print(f"Message: {failed_response.get('message')}")



# How the Token is Stored and Used
# Generation: The login_user function generates the JWT and sends it back in the HTTP response body.

# Client Storage: The client (e.g., a React app, mobile app) receives the response and stores the token (most commonly in HTTP-only Cookies or Local Storage).

# Future Requests: For every subsequent request to protected resources, the client includes the token in the Authorization header, typically in the format:

# Authorization: Bearer <your-generated-jwt-token>

# Verification: The server-side code (in middleware or a decorator) intercepts this request, extracts the token, verifies its signature using the SECRET_KEY, and checks if it's expired. If valid, the user's identity is established from the token's payload (user_id).