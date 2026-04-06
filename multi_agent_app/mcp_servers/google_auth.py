# multi_agent_app/mcp_servers/google_auth.py
import os
import json
from pathlib import Path
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent
CREDS_PATH = str(BASE_DIR / "gcp-oauth.keys.json")
IS_CLOUD = os.getenv("K_SERVICE") is not None

from common.secrets import get_secret

def get_credentials(scopes: list, token_filename: str) -> Credentials:
    """Load or refresh credentials for any Google service."""
    token_path = str(BASE_DIR / token_filename)
    creds = None

    if IS_CLOUD:
        # Map token filename to secret name
        secret_map = {
            "gtasks_token.json":    "GTASKS_TOKEN",
            "gcalendar_token.json": "GCALENDAR_TOKEN",
        }
        secret_name = secret_map.get(token_filename)
        token_data = get_secret(secret_name)
        return Credentials.from_authorized_user_info(json.loads(token_data), scopes)
    else:
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, scopes)

        if not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, scopes)
            creds = flow.run_local_server(port=0)
            with open(token_path, "w") as f:
                f.write(creds.to_json())
            print(f"✅ Token saved to: {token_path}")

    return creds