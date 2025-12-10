# 💻 Python Code Example
# This code snippet defines a function that handles the connection, execution of a SELECT query, and proper closure of the connection.

# Prerequisites
# You need to have the psycopg2 library installed. You can install it using pip:

# Bash

# pip install psycopg2-binary

import psycopg2
from psycopg2 import Error

def query_user_data(database_name, user, password, host, port):
    """
    Connects to a PostgreSQL database and executes a query to fetch user data.
    """
    connection = None  # Initialize connection to None
    cursor = None      # Initialize cursor to None

    # 1. Define the SQL Query
    # Always use parameterized queries (placeholders like %s) 
    # for security against SQL injection, even for simple SELECTs.
    sql_query = "SELECT id, username, email FROM users WHERE is_active = %s;"
    
    # The value to substitute for %s
    query_parameter = (True,) 

    try:
        # 2. Establish Connection
        connection = psycopg2.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database=database_name
        )
        
        # 3. Create a Cursor
        # The cursor is used to execute the commands.
        cursor = connection.cursor()
        
        print("✅ Database connection successful.")

        # 4. Execute the Query
        cursor.execute(sql_query, query_parameter)
        
        # 5. Fetch Results
        # Use fetchall() to retrieve all rows of a query result.
        user_records = cursor.fetchall()
        
        # Get column names (useful for display)
        column_names = [desc[0] for desc in cursor.description]

        # 6. Process and Display Data
        print("\n--- User Data ---")
        print(f"Columns: {column_names}")
        if user_records:
            for row in user_records:
                print(row)
        else:
            print("No active users found.")

    except (Exception, Error) as error:
        print(f"❌ Error while connecting to PostgreSQL or executing query: {error}")

    finally:
        # 7. Close Connection
        # Ensure the cursor and connection are closed, even if an error occurs.
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            print("\nDatabase connection closed.")

# --- Configuration ---
# You would replace these with your actual database credentials
DB_CONFIG = {
    "database_name": "your_database_name",
    "user": "your_db_user",
    "password": "your_db_password",
    "host": "localhost",
    "port": "5432"  # Default PostgreSQL port
}

# --- Execution ---
if __name__ == "__main__":
    query_user_data(
        DB_CONFIG["database_name"],
        DB_CONFIG["user"],
        DB_CONFIG["password"],
        DB_CONFIG["host"],
        DB_CONFIG["port"]
    )


# 🛠️ Key Concepts Explained
# 1. psycopg2.connect()
# This function establishes the connection to the database. It takes connection parameters like user, password, host, port, and database name.

# 2. Cursor (connection.cursor())
# A cursor acts as a control structure that allows you to traverse and manipulate the records of a database. You must create a cursor from the connection before you can execute any SQL commands.

# 3. Parameterized Queries
# Notice the use of %s as a placeholder in the sql_query. This is a crucial security practice known as parameterized querying (or prepared statements). It ensures that user input is treated as data, not as part of the SQL command, preventing SQL injection attacks.

# 4. Transaction Control
# For SELECT queries (which do not modify data), you generally don't need to call connection.commit(). If you were running INSERT, UPDATE, or DELETE statements, you would need to call connection.commit() to save the changes permanently.

# Would you like to see an example of how to insert new user data into the database using Python?