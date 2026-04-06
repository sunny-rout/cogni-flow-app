# multi_agent_app/mcp_servers/google_auth_cli.py
import sys
from google_auth import get_credentials

SERVICES = {
    "tasks": {
        "scopes": ["https://www.googleapis.com/auth/tasks"],
        "token_filename": "gtasks_token.json",
    },
    "calendar": {
        "scopes": ["https://www.googleapis.com/auth/calendar"],
        "token_filename": "gcalendar_token.json",
    },
}

if __name__ == "__main__":
    service = sys.argv[1] if len(sys.argv) > 1 else None

    if service not in SERVICES:
        print(f"Usage: python google_auth_cli.py <service>")
        print(f"Available services: {list(SERVICES.keys())}")
        sys.exit(1)

    config = SERVICES[service]
    get_credentials(config["scopes"], config["token_filename"])
    print(f"✅ Auth complete for: {service}")