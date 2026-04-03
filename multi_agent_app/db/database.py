import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (
    f"postgresql+psycopg2://{os.environ['DB_USER']}:{os.environ['DB_PASS']}"
    f"@{os.environ['DB_HOST']}:{os.environ['DB_PORT']}/{os.environ['DB_NAME']}"
)

engine = create_engine(DATABASE_URL)

def execute_query(query: str, params: dict = {}):
    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        conn.commit()
        try:
            return [dict(row._mapping) for row in result]
        except:
            return []