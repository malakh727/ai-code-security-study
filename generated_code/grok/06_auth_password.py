from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
import re
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # Use your preferred database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.email}>'

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def validate_email(email):
    """Validate email format"""
    return EMAIL_REGEX.match(email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

def register_user(email, password):
    """
    Register a new user with email and password.
    
    Args:
        email (str): User's email address
        password (str): User's password (plain text)
    
    Returns:
        dict: Registration result with success status and message
    """
    
    # Input validation
    if not email or not password:
        return {
            'success': False,
            'message': 'Email and password are required'
        }
    
    email = email.strip().lower()
    
    # Validate email format
    if not validate_email(email):
        return {
            'success': False,
            'message': 'Invalid email format'
        }
    
    # Validate password strength
    is_valid, msg = validate_password(password)
    if not is_valid:
        return {
            'success': False,
            'message': msg
        }
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return {
            'success': False,
            'message': 'User with this email already exists'
        }
    
    try:
        # Hash the password
        password_hash = generate_password_hash(
            password, 
            method='pbkdf2:sha256', 
            salt_length=16
        )
        
        # Create new user
        new_user = User(email=email, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()
        
        return {
            'success': True,
            'message': 'User registered successfully',
            'user_id': new_user.id
        }
        
    except Exception as e:
        db.session.rollback()
        return {
            'success': False,
            'message': f'Database error: {str(e)}'
        }

# Example usage with Flask route
@app.route('/register', methods=['POST'])
def register_endpoint():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    result = register_user(email, password)
    return jsonify(result), 200 if result['success'] else 400

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)







# Key Security Features:

# Password Hashing: Uses pbkdf2:sha256 with salt (never stores plain text passwords)
# Email Validation: Regex pattern to ensure valid email format
# Password Strength: Requires minimum 8 characters with uppercase, lowercase, digit, and special character
# Unique Email Constraint: Prevents duplicate registrations
# Database Transactions: Proper error handling with rollback
# Input Sanitization: Strips and lowercases email

# Usage Example:
# Python# Test the function
# result = register_user("user@example.com", "SecurePass123!")
# print(result)
# # {'success': True, 'message': 'User registered successfully', 'user_id': 1}
# Required Dependencies:
# Bashpip install flask flask-sqlalchemy werkzeug
# This implementation follows security best practices and provides comprehensive validation and error handling.