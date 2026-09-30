"""
Application settings loaded from environment variables.

Uses pydantic-settings for type-safe, validated configuration.
All values can be overridden via environment variables or a .env file.

Usage:
    from app.config.settings import settings
    print(settings.openai_api_key)
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Typed application configuration.
    Field names map directly to environment variable names (case-insensitive).
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── LLM / Embeddings ─────────────────────────────────────────────────────
    groq_api_key: str = Field(..., description="Groq API key for LLM")
    openai_embedding_model: str = Field(
        default="text-embedding-ada-002",
        description="OpenAI model to use for code embeddings"
    )
    openai_chat_model: str = Field(
        default="llama3-8b-8192",
        description="OpenAI model to use for LLM Q&A and feature path finding"
    )
    openai_embedding_batch_size: int = Field(
        default=100,
        description="Number of texts to embed per OpenAI API call"
    )

    # ── Database ─────────────────────────────────────────────────────────────
    postgres_url: str = Field(
        default="postgresql://atlas:atlas_secret@localhost:5432/atlas",
        description="psycopg2-compatible PostgreSQL connection URL"
    )

    # ── gRPC Server ───────────────────────────────────────────────────────────
    grpc_port: int = Field(default=50051, description="Port the gRPC server listens on")
    grpc_max_workers: int = Field(
        default=10,
        description="Thread pool size for the gRPC server"
    )

    # ── Parsing ───────────────────────────────────────────────────────────────
    supported_languages: list[str] = Field(
        default=["python", "typescript"],
        description="Languages the AST parser supports"
    )
    skip_directories: list[str] = Field(
        default=["node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build"],
        description="Directory names to skip during repo traversal"
    )

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = Field(default="INFO", description="Logging level: DEBUG, INFO, WARNING, ERROR")


# Module-level singleton — import this throughout the app
settings = Settings()
