import json
from pathlib import Path


class JsonFileStore:
    def __init__(self, data_dir: str):
        self._dir = Path(data_dir)
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, name: str) -> Path:
        return self._dir / f"{name}.json"

    def read(self, name: str) -> list[dict]:
        path = self._path(name)
        if not path.exists():
            return []
        try:
            with open(path, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    def write(self, name: str, records: list[dict]) -> None:
        path = self._path(name)
        tmp = path.with_suffix(".tmp")
        with open(tmp, "w") as f:
            json.dump(records, f, indent=2, default=str)
        tmp.replace(path)

    def next_id(self, records: list[dict]) -> int:
        if not records:
            return 1
        return max(r.get("id", 0) for r in records) + 1
