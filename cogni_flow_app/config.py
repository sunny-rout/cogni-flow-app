from dataclasses import dataclass
from dotenv import load_dotenv
import os

load_dotenv()


@dataclass(frozen=True)
class AppConfig:
    model: str
    project_id: str
    use_vertex_ai: str
    google_credentials: str
    port: int
    data_dir: str
    app_name: str
    default_user_id: str
    allowed_origins: tuple[str, ...]


def _load() -> AppConfig:
    return AppConfig(
        model=os.getenv("MODEL", "gemini-2.5-flash"),
        project_id=os.getenv("GOOGLE_CLOUD_PROJECT", ""),
        use_vertex_ai=os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "1"),
        google_credentials=os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""),
        port=int(os.getenv("PORT", "8080")),
        data_dir=os.path.join(os.path.dirname(__file__), "data"),
        app_name="multi_agent_app",
        default_user_id="user",
        allowed_origins=(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ),
    )


config = _load()
