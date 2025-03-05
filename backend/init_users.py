#!/usr/bin/env python3
import psycopg2

# Update these connection settings to match your PostgreSQL configuration
DB_HOST = "localhost"
DB_NAME = "campusconnect"
DB_USER = "bennh"      # replace with your PostgreSQL user
DB_PASSWORD = "houghton"  # replace with your PostgreSQL password

def main():
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Create the users table if it doesn't exist
        create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL
        );
        """
        cur.execute(create_table_query)
        print("Users table created or already exists.")

        # Define placeholder users
        placeholder_users = [
            ("user1", "user1@example.com", "password1"),
            ("user2", "user2@example.com", "password2"),
            ("user3", "user3@example.com", "password3"),
            ("user4", "user4@example.com", "password4"),
            ("user5", "user5@example.com", "password5"),
            ("user6", "user6@example.com", "password6"),
            ("user7", "user7@example.com", "password7"),
            ("user8", "user8@example.com", "password8"),
            ("user9", "user9@example.com", "password9"),
            ("user10", "user10@example.com", "password10")
        ]

        # Insert the placeholder users (ignore duplicates)
        insert_query = """
        INSERT INTO users (username, email, password)
        VALUES (%s, %s, %s)
        ON CONFLICT (username) DO NOTHING;
        """
        cur.executemany(insert_query, placeholder_users)
        print("Inserted placeholder users.")

        # Clean up
        cur.close()
        conn.close()
        print("Database connection closed.")

    except Exception as e:
        print("An error occurred:", e)

if __name__ == "__main__":
    main()
