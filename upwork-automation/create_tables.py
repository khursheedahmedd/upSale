"""
Script to create all database tables directly using SQLAlchemy
"""
import os
import sys
from pathlib import Path

# Add the parent directory to Python path
parent_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(parent_dir))

from sqlalchemy import create_engine, inspect
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.models.jobs import Base, Job, Skill, Category, SubCategory, JobType, ClientInfo, Location, Timezone

def create_all_tables():
    try:
        print(f"Database URL: {settings.sync_database_url}")
        print("Creating database engine...")
        engine = create_engine(settings.sync_database_url)
        
        # Check if connection works
        with engine.connect() as conn:
            print("Database connection successful!")

        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"Existing tables: {existing_tables}")
        
        print(f"Creating all tables in database: {settings.POSTGRES_DB}")
        Base.metadata.create_all(engine)
        inspector = inspect(engine)
        tables_after = inspector.get_table_names()
        print(f"Tables after creation: {tables_after}")
        print("Tables created successfully!")
        
        return True
    except SQLAlchemyError as e:
        print(f"SQLAlchemy error: {e}")
        return False
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

if __name__ == "__main__":
    success = create_all_tables()
    if success:
        print("Database setup completed successfully!")
    else:
        print("Database setup failed!") 