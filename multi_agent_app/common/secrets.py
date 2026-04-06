# multi_agent_app/common/secrets.py
"""Shared utilities for GCP Secret Manager access."""
import os

from google.cloud import secretmanager


def get_secret(secret_name: str) -> str:
    """Fetch a secret value from GCP Secret Manager.

    Requires GOOGLE_CLOUD_PROJECT environment variable to be set.
    """
    client = secretmanager.SecretManagerServiceClient()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")
