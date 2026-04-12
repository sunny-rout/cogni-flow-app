from typing import TypeVar, Generic, Optional
from cogni_flow_app.repositories.base import BaseRepository

T = TypeVar("T")


class BaseService(Generic[T]):
    def __init__(self, repository: BaseRepository[T]):
        self._repo = repository

    def get_all(self) -> list[T]:
        return self._repo.get_all()

    def get_by_id(self, record_id: int) -> Optional[T]:
        return self._repo.get_by_id(record_id)

    def delete(self, record_id: int) -> bool:
        return self._repo.delete(record_id)

    def search(self, keyword: str) -> list[T]:
        return self._repo.search(keyword)
