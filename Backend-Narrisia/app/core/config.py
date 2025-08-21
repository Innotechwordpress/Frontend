# ✅ FILE: app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
  
    # Other existing settings
    SERPER_API_KEY: str
    OPENAI_API_KEY: str
    MODEL: str = "gpt-4o-mini"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite+aiosqlite:///./email_orchestrator.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
