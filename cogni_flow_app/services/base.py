from typing import TypeVar, Generic, Optional
from cogni_flow_app.repositories.base import BaseRepository
from cogni_flow_app.logging import log_operation

T = TypeVar("T")


class BaseService(Generic[T]):
    def __init__(self, repository: BaseRepository[T]):
        self._repo = repository

    @log_operation("get_all")
    def get_all(self) -> list[T]:
        return self._repo.get_all()

    @log_operation("get_by_id")
    def get_by_id(self, record_id: int) -> Optional[T]:
        return self._repo.get_by_id(record_id)

    @log_operation("delete")
    def delete(self, record_id: int) -> bool:
        return self._repo.delete(record_id)

    @log_operation("search")
    def search(self, keyword: str) -> list[T]:
        return self._repo.search(keyword)
