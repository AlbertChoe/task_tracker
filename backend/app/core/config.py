import os
from types import SimpleNamespace
from dotenv import load_dotenv
from sqlalchemy.engine.url import make_url

load_dotenv(".env")

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is empty. Ensure .env is present and contains DATABASE_URL.")

try:
    make_url(DATABASE_URL)
except Exception as e:
    raise RuntimeError(f"Invalid DATABASE_URL: {repr(DATABASE_URL)}") from e

settings = SimpleNamespace(
    DATABASE_URL=DATABASE_URL,
    JWT_SECRET=os.getenv("JWT_SECRET", "dev-secret-change-me"),
    CORS_ORIGINS=os.getenv("CORS_ORIGINS", "http://localhost:3000"),
    NEXT_PUBLIC_API_BASE_URL=os.getenv(
        "NEXT_PUBLIC_API_BASE_URL", "http://localhost:8008"),
    PROTECTED_PATHS=os.getenv("PROTECTED_PATHS", "/tasks,/dashboard"),

    ACCESS_TOKEN_EXPIRE_MINUTES=int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "300")),
    JWT_ALG=os.getenv("JWT_ALG", "HS256"),
)
