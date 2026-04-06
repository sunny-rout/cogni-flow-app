import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
IS_CLOUD = os.getenv("K_SERVICE") is not None

if IS_CLOUD:
    from common.secrets import get_secret
    DB_URL = get_secret("DB_URL")
    DB_SSL_MODE = get_secret("DB_SSL_MODE")
    DB_CHANNEL_BINDING = get_secret("DB_CHANNEL_BINDING")
else:
    DB_URL = os.environ["DB_URL"]
    DB_SSL_MODE = os.environ["DB_SSL_MODE"]
    DB_CHANNEL_BINDING = os.environ["DB_CHANNEL_BINDING"]

engine = create_engine(
    DB_URL,  # full Neon connection string
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,       # ← checks connection before using it
    pool_recycle=1800,        # ← recycle connections every 30 mins
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "sslmode": DB_SSL_MODE,
        "channel_binding": DB_CHANNEL_BINDING
    }
)

def execute_query(query: str, params: dict = {}):
    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        conn.commit()
        try:
            return [dict(row._mapping) for row in result]
        except:
            return []