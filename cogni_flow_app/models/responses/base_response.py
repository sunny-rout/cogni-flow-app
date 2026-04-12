from pydantic import BaseModel
from typing import TypeVar, Generic, Optional, Any

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    message: Optional[str] = None

    @classmethod
    def ok(cls, data: Any = None, message: str = None) -> "ApiResponse":
        return cls(success=True, data=data, message=message)

    @classmethod
    def fail(cls, error: str) -> "ApiResponse":
        return cls(success=False, error=error)
