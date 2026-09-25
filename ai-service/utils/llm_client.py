"""
Shared Gemini client for all agents.

Every agent that needs an LLM imports `get_llm()` from here so model
configuration stays in one place.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from config.settings import settings


def get_llm():
    """
    Return a configured Gemini chat client.

    Note: Gemini 3.5 Flash Lite uses fixed sampling defaults — the
    temperature parameter is accepted but ignored by the model.
    """
    return ChatGoogleGenerativeAI(
        model=settings.CHAT_MODEL,
        google_api_key=settings.GOOGLE_API_KEY,
        timeout=30,
        max_retries=2,
    )