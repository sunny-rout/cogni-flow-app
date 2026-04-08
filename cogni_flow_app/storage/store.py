import json
import os
import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

def _path(name: str) -> Path:
    return DATA_DIR / f"{name}.json"

def _read(name: str) -> list:
    p = _path(name)
    if not p.exists():
        return []
    try:
        with open(p) as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read {name}.json: {e}")
        return []

def _write(name: str, data: list):
    try:
        with open(_path(name), "w") as f:
            json.dump(data, f, indent=2, default=str)
        logger.info(f"Written {len(data)} records to {name}.json")
    except Exception as e:
        logger.error(f"Failed to write {name}.json: {e}")

def next_id(records: list) -> int:
    return max((r.get("id", 0) for r in records), default=0) + 1