from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
import os
load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Upwork Automation API"
    

    POSTGRES_USER: Optional[str] = os.getenv("POSTGRES_USER", None)
    POSTGRES_PASSWORD: Optional[str] = os.getenv("POSTGRES_PASSWORD", None)
    POSTGRES_HOST: Optional[str] = os.getenv("POSTGRES_HOST", None)
    POSTGRES_PORT: Optional[str] = os.getenv("POSTGRES_PORT", None)
    POSTGRES_DB: Optional[str] = os.getenv("POSTGRES_DB", None)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    RSS_FEED_URL: Optional[str] = ""

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" 
settings = Settings()
