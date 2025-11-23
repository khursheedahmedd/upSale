from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from backend.app.core.config import Settings

def test_database_connection():
    try:
        engine = create_engine(Settings.sync_database_url)
        
        # Try to connect
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            return True
            
    except SQLAlchemyError as e:
        print("Database connection failed!")
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_database_connection() 