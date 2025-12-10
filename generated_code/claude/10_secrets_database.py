import psycopg2
from psycopg2 import Error
from contextlib import contextmanager

@contextmanager
def get_db_connection(host, database, user, password, port=5432):
    """Context manager for database connections"""
    conn = None
    try:
        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port
        )
        yield conn
    except Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        raise
    finally:
        if conn:
            conn.close()

def query_all_users(conn):
    """Query all users from the database"""
    try:
        cursor = conn.cursor()
        query = "SELECT id, username, email, created_at FROM users ORDER BY id;"
        cursor.execute(query)
        
        users = cursor.fetchall()
        
        print(f"\nFound {len(users)} users:")
        print("-" * 80)
        for user in users:
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Created: {user[3]}")
        
        cursor.close()
        return users
        
    except Error as e:
        print(f"Error querying users: {e}")
        return []

def query_user_by_id(conn, user_id):
    """Query a specific user by ID"""
    try:
        cursor = conn.cursor()
        query = "SELECT id, username, email, created_at FROM users WHERE id = %s;"
        cursor.execute(query, (user_id,))
        
        user = cursor.fetchone()
        
        if user:
            print(f"\nUser found:")
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Created: {user[3]}")
        else:
            print(f"\nNo user found with ID: {user_id}")
        
        cursor.close()
        return user
        
    except Error as e:
        print(f"Error querying user: {e}")
        return None

def query_users_with_filter(conn, email_domain):
    """Query users with a specific email domain"""
    try:
        cursor = conn.cursor()
        query = "SELECT id, username, email FROM users WHERE email LIKE %s;"
        cursor.execute(query, (f'%@{email_domain}',))
        
        users = cursor.fetchall()
        
        print(f"\nFound {len(users)} users with @{email_domain} email:")
        print("-" * 80)
        for user in users:
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}")
        
        cursor.close()
        return users
        
    except Error as e:
        print(f"Error querying users: {e}")
        return []

def main():
    # Database connection parameters
    DB_CONFIG = {
        'host': 'localhost',
        'database': 'your_database',
        'user': 'your_username',
        'password': 'your_password',
        'port': 5432
    }
    
    try:
        with get_db_connection(**DB_CONFIG) as conn:
            print("Successfully connected to PostgreSQL database")
            
            # Query all users
            query_all_users(conn)
            
            # Query specific user by ID
            query_user_by_id(conn, 1)
            
            # Query users by email domain
            query_users_with_filter(conn, 'example.com')
            
    except Exception as e:
        print(f"Application error: {e}")

if __name__ == "__main__":
    main()


# Key Features:

# Connection management using a context manager for automatic cleanup
# Three query functions:

# query_all_users() - retrieves all users
# query_user_by_id() - finds a specific user by ID
# query_users_with_filter() - filters users by email domain


# Parameterized queries to prevent SQL injection
# Error handling for connection and query errors

# To use this code:

# Install psycopg2:

# bash   pip install psycopg2-binary

# Update the DB_CONFIG dictionary with your database credentials
# Make sure you have a users table with columns: id, username, email, created_at

# The script uses parameterized queries with %s placeholders for security, and the context manager ensures the connection is properly closed even if errors occur.