import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", "8000"))
    BACKEND_API_BASE_URL: str = os.getenv(
        "BACKEND_API_BASE_URL", "http://localhost:5182/api"
    )
    AI_SERVICE_API_KEY: str = os.getenv("AI_SERVICE_API_KEY", "")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")


settings = Settings()
