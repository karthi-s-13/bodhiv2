import os
from urllib.parse import urlparse
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/bodhi_db")

def create_db_if_not_exists():
    """
    Connects to the default 'postgres' database and creates the target database 
    if it does not already exist.
    """
    try:
        url = urlparse(DATABASE_URL)
        from urllib.parse import unquote
        username = unquote(url.username) if url.username else None
        password = unquote(url.password) if url.password else None
        host = url.hostname or "localhost"
        port = url.port or 5432
        dbname = url.path.lstrip("/")

        # Connect to system 'postgres' db first to run CREATE DATABASE
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if target db exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()
        if not exists:
            # We execute CREATE DATABASE
            # Using parameterization is not supported for CREATE DATABASE, 
            # but dbname is sourced from the parsed local URL config, so it is safe.
            cursor.execute(f'CREATE DATABASE "{dbname}"')
            print(f"Database '{dbname}' created successfully.")
        else:
            print(f"Database '{dbname}' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"PostgreSQL Database creation check skipped/failed: {e}")
        print("Continuing and attempting standard connection...")

def apply_schema_updates():
    """
    Applies any schema updates (like adding new columns to existing tables)
    after tables are verified/created by SQLAlchemy.
    """
    try:
        url = urlparse(DATABASE_URL)
        from urllib.parse import unquote
        username = unquote(url.username) if url.username else None
        password = unquote(url.password) if url.password else None
        host = url.hostname or "localhost"
        port = url.port or 5432
        dbname = url.path.lstrip("/")

        # Connect directly to target database
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            database=dbname
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Enable vector extension
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        # Add textbook_structure column if it doesn't exist
        cursor.execute("ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS textbook_structure TEXT;")
        # Add textbook_data column if it doesn't exist
        cursor.execute("ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS textbook_data JSON;")
        print("Database schema updates verified/applied.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"PostgreSQL Database schema update skipped/failed: {e}")

# Ensure DB exists before starting engine
create_db_if_not_exists()


# Initialize SQLAlchemy
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    FastAPI Dependency that provides a database session and ensures clean closure.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
