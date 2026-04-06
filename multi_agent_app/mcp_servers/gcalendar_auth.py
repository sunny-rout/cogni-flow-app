from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
import os
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDS_PATH = str(Path(__file__).resolve().parent.parent / "gcp-oauth.keys.json")
TOKEN_PATH = str(Path(__file__).resolve().parent.parent / "gcalendar_token.json")

flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, SCOPES)
creds = flow.run_local_server(port=0)

with open(TOKEN_PATH, "w") as f:
    f.write(creds.to_json())

print(f"✅ Token saved to: {TOKEN_PATH}")