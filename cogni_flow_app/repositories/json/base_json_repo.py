from datetime import datetime
from typing import TypeVar, Generic, Optional, Type
from pydantic import BaseModel
from cogni_flow_app.repositories.base import BaseRepository
from cogni_flow_app.repositories.json.store import JsonFileStore
from cogni_flow_app.logging import get_logger

T = TypeVar("T", bound=BaseModel)

logger = get_logger("cogniflow.repo")


class BaseJsonRepository(BaseRepository[T], Generic[T]):
    collection_name: str
    model_class: Type[T]
    search_fields: list[str]

    def __init__(self, store: JsonFileStore):
        self._store = store

    def _now(self) -> str:
        return datetime.now().isoformat()

    def get_all(self) -> list[T]:
        records = self._store.read(self.collection_name)
        logger.debug(f"get_all {self.collection_name}: {len(records)} records")
        return [self.model_class(**r) for r in records]

    def get_by_id(self, record_id: int) -> Optional[T]:
        record = next(
            (r for r in self._store.read(self.collection_name)
             if r.get("id") == record_id),
            None,
        )
        logger.debug(
            f"get_by_id {self.collection_name}",
            extra={"record_id": record_id, "found": record is not None},
        )
        return self.model_class(**record) if record else None

    def create(self, data: dict) -> T:
        records = self._store.read(self.collection_name)
        now = self._now()
        record = {
            "id": self._store.next_id(records),
            "created_at": now,
            "updated_at": now,
            **data,
        }
        records.append(record)
        self._store.write(self.collection_name, records)
        logger.debug(
            f"create {self.collection_name}",
            extra={"record_id": record["id"]},
        )
        return self.model_class(**record)

    def update(self, record_id: int, data: dict) -> Optional[T]:
        records = self._store.read(self.collection_name)
        for i, r in enumerate(records):
            if r.get("id") == record_id:
                patched = {**r, **{k: v for k, v in data.items() if v is not None}}
                patched["updated_at"] = self._now()
                records[i] = patched
                self._store.write(self.collection_name, records)
                logger.debug(
                    f"update {self.collection_name}",
                    extra={"record_id": record_id},
                )
                return self.model_class(**patched)
        logger.debug(
            f"update {self.collection_name}: not found",
            extra={"record_id": record_id},
        )
        return None

    def delete(self, record_id: int) -> bool:
        records = self._store.read(self.collection_name)
        filtered = [r for r in records if r.get("id") != record_id]
        if len(filtered) == len(records):
            logger.debug(
                f"delete {self.collection_name}: not found",
                extra={"record_id": record_id},
            )
            return False
        self._store.write(self.collection_name, filtered)
        logger.debug(
            f"delete {self.collection_name}",
            extra={"record_id": record_id},
        )
        return True

    def search(self, keyword: str) -> list[T]:
        kw = keyword.lower()
        results = [
            self.model_class(**r)
            for r in self._store.read(self.collection_name)
            if any(kw in str(r.get(f, "")).lower() for f in self.search_fields)
        ]
        logger.debug(
            f"search {self.collection_name}",
            extra={"keyword": keyword, "matches": len(results)},
        )
        return results
