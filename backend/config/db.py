import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connection pool configuration
dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "db_mahasiswa"),
    "pool_name": "mypool",
    "pool_size": 5,
    "pool_reset_session": True
}

# Create connection pool
try:
    connection_pool = pooling.MySQLConnectionPool(**dbconfig)
except:
    connection_pool = None
    print("Warning: Connection pooling not available")
#
# def get_db():
#     if connection_pool:
#         return connection_pool.get_connection()
#     else:
#         # Fallback to single connection
#         return mysql.connector.connect(
#             host=dbconfig["host"],
#             user=dbconfig["user"],
#             password=dbconfig["password"],
#             database=dbconfig["database"]
#         )

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="db_mahasiswa"
    )
