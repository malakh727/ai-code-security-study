# 1. Install Required Package
# First, install the PostgreSQL adapter for Python:

# bash
# pip install psycopg2-binary
# # or for async support
# pip install asyncpg
# # or using SQLAlchemy ORM
# pip install sqlalchemy psycopg2-binary
# 2. Basic Connection and Query with psycopg2

import psycopg2
from psycopg2 import sql
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv
import pandas as pd  # Optional, for DataFrame output

# Load environment variables
load_dotenv()

class PostgreSQLConnection:
    def __init__(self):
        self.connection = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(
                host=os.getenv("DB_HOST", "localhost"),
                database=os.getenv("DB_NAME", "mydatabase"),
                user=os.getenv("DB_USER", "postgres"),
                password=os.getenv("DB_PASSWORD", ""),
                port=os.getenv("DB_PORT", 5432)
            )
            print("✅ Connected to PostgreSQL database")
            return self.connection
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return None
    
    def execute_query(self, query, params=None, fetch=True):
        """Execute SQL query and return results"""
        cursor = None
        try:
            cursor = self.connection.cursor(cursor_factory=DictCursor)
            cursor.execute(query, params or ())
            
            if fetch:
                if query.strip().upper().startswith("SELECT"):
                    result = cursor.fetchall()
                    return result
                else:
                    self.connection.commit()
                    return cursor.rowcount
            else:
                self.connection.commit()
                return None
                
        except Exception as e:
            self.connection.rollback()
            print(f"❌ Query error: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("🔌 Connection closed")

def query_user_data():
    """Example function to query user data"""
    db = PostgreSQLConnection()
    connection = db.connect()
    
    if not connection:
        return
    
    try:
        # Example 1: Basic SELECT query
        print("\n📊 Example 1: Fetch all users")
        query = "SELECT * FROM users ORDER BY id LIMIT 10;"
        users = db.execute_query(query)
        
        if users:
            for user in users:
                print(dict(user))
        
        # Example 2: Query with parameters
        print("\n📊 Example 2: Fetch user by email")
        email_query = """
            SELECT id, username, email, created_at 
            FROM users 
            WHERE email = %s;
        """
        user_by_email = db.execute_query(email_query, ("user@example.com",))
        
        if user_by_email:
            for user in user_by_email:
                print(f"User found: {dict(user)}")
        
        # Example 3: Complex query with joins
        print("\n📊 Example 3: Users with their orders")
        join_query = """
            SELECT 
                u.id,
                u.username,
                u.email,
                COUNT(o.id) as order_count,
                SUM(o.total_amount) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id, u.username, u.email
            ORDER BY total_spent DESC
            LIMIT 5;
        """
        user_stats = db.execute_query(join_query)
        
        if user_stats:
            for stat in user_stats:
                print(dict(stat))
        
        # Example 4: Using pandas for data analysis
        print("\n📊 Example 4: Using pandas DataFrame")
        df_query = "SELECT * FROM users WHERE created_at > %s;"
        users_df = pd.read_sql_query(
            df_query, 
            connection, 
            params=('2023-01-01',)
        )
        print(f"Total users: {len(users_df)}")
        print(users_df.head())
        
    finally:
        db.close()

# Alternative: Using context manager
def query_with_context_manager():
    """Example using context manager for automatic connection handling"""
    connection_params = {
        'host': 'localhost',
        'database': 'mydatabase',
        'user': 'postgres',
        'password': 'your_password',
        'port': 5432
    }
    
    try:
        with psycopg2.connect(**connection_params) as conn:
            with conn.cursor(cursor_factory=DictCursor) as cursor:
                cursor.execute("""
                    SELECT id, username, email, 
                           TO_CHAR(created_at, 'YYYY-MM-DD') as join_date
                    FROM users
                    WHERE is_active = TRUE
                    ORDER BY created_at DESC;
                """)
                
                users = cursor.fetchall()
                
                print(f"Found {len(users)} active users:")
                for user in users:
                    print(f"ID: {user['id']}, Username: {user['username']}, "
                          f"Email: {user['email']}, Joined: {user['join_date']}")
                    
    except Exception as e:
        print(f"Error: {e}")

# Using SQLAlchemy ORM (Recommended for larger applications)
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for SQLAlchemy"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

def query_with_sqlalchemy():
    """Query using SQLAlchemy ORM"""
    # Create connection string
    DATABASE_URL = "postgresql://postgres:password@localhost:5432/mydatabase"
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Example queries
        # 1. Get all active users
        active_users = session.query(User).filter(User.is_active == True).all()
        print(f"Active users: {len(active_users)}")
        
        # 2. Get user by email
        user = session.query(User).filter(User.email == "user@example.com").first()
        if user:
            print(f"Found user: {user.username}")
        
        # 3. Get users created after a date
        from datetime import date
        recent_users = session.query(User).filter(
            User.created_at >= date(2024, 1, 1)
        ).order_by(User.created_at.desc()).limit(10).all()
        
        for u in recent_users:
            print(f"{u.username} - {u.created_at}")
            
        # 4. Complex query with multiple conditions
        users = session.query(User).filter(
            User.is_active == True,
            User.created_at >= date(2023, 1, 1),
            User.email.like('%@gmail.com')
        ).all()
        
    finally:
        session.close()
        engine.dispose()

# Main execution
if __name__ == "__main__":
    print("=" * 50)
    print("PostgreSQL User Data Query Examples")
    print("=" * 50)
    
    # Choose which example to run
    query_user_data()  # Basic psycopg2
    # query_with_context_manager()  # Context manager
    # query_with_sqlalchemy()  # SQLAlchemy ORM

# 3. Environment Variables (.env file)
# Create a .env file in your project root:

# env
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=mydatabase
# DB_USER=postgres
# DB_PASSWORD=your_secure_password
# DB_SSL_MODE=prefer
# 4. Async Example with asyncpg
import asyncpg
import asyncio
from typing import List, Dict

async def query_users_async():
    """Async query example"""
    conn = await asyncpg.connect(
        host='localhost',
        database='mydatabase',
        user='postgres',
        password='password',
        port=5432
    )
    
    try:
        # Fetch all users
        rows = await conn.fetch("SELECT * FROM users LIMIT 10;")
        
        # Convert to dictionaries
        users = []
        for row in rows:
            users.append(dict(row))
        
        return users
        
    finally:
        await conn.close()

# Run async function
# users = asyncio.run(query_users_async())
# 5. Security Best Practices
import psycopg2
from psycopg2 import pool

class SecurePostgreSQLConnection:
    def __init__(self, min_conn=1, max_conn=10):
        self.connection_pool = None
        self.min_conn = min_conn
        self.max_conn = max_conn
    
    def create_pool(self, **kwargs):
        """Create connection pool for better performance"""
        try:
            self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                self.min_conn,
                self.max_conn,
                **kwargs
            )
            print("✅ Connection pool created")
        except Exception as e:
            print(f"❌ Pool creation failed: {e}")
    
    def safe_query(self, query: str, params: tuple = None):
        """Execute query with parameterized inputs to prevent SQL injection"""
        conn = self.connection_pool.getconn()
        
        try:
            with conn.cursor() as cursor:
                # Using parameterized query (prevents SQL injection)
                cursor.execute(query, params or ())
                
                if query.strip().upper().startswith("SELECT"):
                    columns = [desc[0] for desc in cursor.description]
                    results = cursor.fetchall()
                    return [dict(zip(columns, row)) for row in results]
                else:
                    conn.commit()
                    return cursor.rowcount
                    
        except Exception as e:
            conn.rollback()
            print(f"Query error: {e}")
            return None
        finally:
            self.connection_pool.putconn(conn)
    
    def close_pool(self):
        """Close all connections in the pool"""
        if self.connection_pool:
            self.connection_pool.closeall()
            print("🔌 Connection pool closed")
# Key Points:
# Always use parameterized queries to prevent SQL injection

# Use environment variables for sensitive data (never hardcode credentials)

# Close connections properly to avoid resource leaks

# Consider using connection pools for production applications

# Handle exceptions appropriately for robust error handling

# Use ORM (SQLAlchemy) for complex applications with many queries

# Choose the approach based on your needs: psycopg2 for basic usage, asyncpg for async applications, or SQLAlchemy for full ORM support.