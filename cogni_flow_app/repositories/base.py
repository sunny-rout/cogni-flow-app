from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional

T = TypeVar("T")


class BaseRepository(ABC, Generic[T]):
    @abstractmethod
    def get_all(self) -> list[T]: ...

    @abstractmethod
    def get_by_id(self, record_id: int) -> Optional[T]: ...

    @abstractmethod
    def create(self, data: dict) -> T: ...

    @abstractmethod
    def update(self, record_id: int, data: dict) -> Optional[T]: ...

    @abstractmethod
    def delete(self, record_id: int) -> bool: ...

    @abstractmethod
    def search(self, keyword: str) -> list[T]: ...
