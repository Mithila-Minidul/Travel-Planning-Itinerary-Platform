import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", "8000"))

    # Matches the key in ai-service/.env
    BACKEND_API_BASE_URL: str = os.getenv(
        "BACKEND_API_URL", "http://localhost:5182/api"
    )

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # ================= AI / LLM =================
    # Read from .env — do not hardcode keys in source.
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    CHAT_MODEL: str = os.getenv("CHAT_MODEL", "gemini-2.5-flash-lite")


settings = Settings()