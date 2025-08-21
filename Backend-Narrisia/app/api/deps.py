# ✅ FILE: app/api/deps.py

from app.core.config import settings
from app.core.config import Settings

def get_settings() -> Settings:
    return settings
