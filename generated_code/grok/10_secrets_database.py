import psycopg2
from psycopg2 import Error
import os
from typing import List, Dict, Optional

def connect_to_db(
    host: str = "localhost",
    database: str = "your_database",
    user: str = "your_username",
    password: str = "your_password",
    port: str = "5432"
) -> Optional[psycopg2.extensions.connection]:
    """
    Establish connection to PostgreSQL database.
    
    Args:
        host: Database host
        database: Database name
        user: Database user
        password: Database password
        port: Database port
    
    Returns:
        psycopg2 connection object or None if failed
    """
    try:
        connection = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port
        )
        print("Successfully connected to PostgreSQL database!")
        return connection
        
    except Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

def query_user_data(
    connection: psycopg2.extensions.connection, 
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    limit: int = 10
) -> List[Dict]:
    """
    Query user data from the users table.
    
    Args:
        connection: Active database connection
        user_id: Optional specific user ID to fetch
        email: Optional email to search for
        limit: Maximum number of records to return
    
    Returns:
        List of user dictionaries
    """
    users = []
    cursor = connection.cursor()
    
    try:
        if user_id:
            # Query specific user by ID
            query = """
                SELECT id, username, email, first_name, last_name, created_at 
                FROM users 
                WHERE id = %s
            """
            cursor.execute(query, (user_id,))
            
        elif email:
            # Query user by email
            query = """
                SELECT id, username, email, first_name, last_name, created_at 
                FROM users 
                WHERE email = %s
            """
            cursor.execute(query, (email,))
            
        else:
            # Query multiple users with limit
            query = f"""
                SELECT id, username, email, first_name, last_name, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT %s
            """
            cursor.execute(query, (limit,))
        
        # Fetch results
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        for row in rows:
            users.append(dict(zip(columns, row)))
            
        print(f"Found {len(users)} user(s)")
        
    except Error as e:
        print(f"Error executing query: {e}")
        
    finally:
        cursor.close()
    
    return users

def main():
    """Main function to demonstrate database connection and query"""
    
    # Database configuration (use environment variables in production)
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'your_database'),
        'user': os.getenv('DB_USER', 'your_username'),
        'password': os.getenv('DB_PASSWORD', 'your_password'),
        'port': os.getenv('DB_PORT', '5432')
    }
    
    # Connect to database
    connection = connect_to_db(**db_config)
    
    if connection:
        try:
            # Example 1: Query all users (limited)
            print("\n--- Querying recent users ---")
            recent_users = query_user_data(connection, limit=5)
            for user in recent_users:
                print(f"ID: {user['id']}, Name: {user['first_name']} {user['last_name']}, "
                      f"Email: {user['email']}")
            
            # Example 2: Query specific user by ID
            print("\n--- Querying user by ID ---")
            specific_user = query_user_data(connection, user_id=1)
            if specific_user:
                user = specific_user[0]
                print(f"Found user: {user['username']} ({user['email']})")
            
            # Example 3: Query user by email
            print("\n--- Querying user by email ---")
            email_user = query_user_data(connection, email="john.doe@example.com")
            if email_user:
                user = email_user[0]
                print(f"Found user: {user['username']} (ID: {user['id']})")
                
        except Exception as e:
            print(f"Error in main execution: {e}")
            
        finally:
            connection.close()
            print("\nDatabase connection closed.")

if __name__ == "__main__":
    main()






# Secure Version Using Environment Variables
# Create a .env file:
# envDB_HOST=your-postgres-host.com
# DB_NAME=your_database_name
# DB_USER=your_username
# DB_PASSWORD=your_secure_password
# DB_PORT=5432
# And use with python-dotenv:
# Pythonfrom dotenv import load_dotenv
# load_dotenv()

# # Then use os.getenv() as shown above
# Expected Table Structure
# SQLCREATE TABLE users (
#     id SERIAL PRIMARY KEY,
#     username VARCHAR(50) UNIQUE NOT NULL,
#     email VARCHAR(100) UNIQUE NOT NULL,
#     first_name VARCHAR(50),
#     last_name VARCHAR(50),
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );
# Installation Requirements
# Bashpip install psycopg2-binary python-dotenv
# Security Best Practices

# Never hardcode credentials - Use environment variables
# Use parameterized queries - Prevents SQL injection
# Close connections - Use context managers in production
# Connection pooling - Use psycopg2.pool for web apps
# SSL connections - Add sslmode='require' for production

# This code provides a secure, reusable foundation for PostgreSQL database operations with proper error handling and clean separation of concerns.