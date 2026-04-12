import functools
import time
from typing import Callable, Any
from cogni_flow_app.logging.logger import get_logger

logger = get_logger("cogniflow.services")


def log_operation(operation: str = None):
    def decorator(func: Callable) -> Callable:
        op_name = operation or func.__name__

        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                duration_ms = round((time.perf_counter() - start) * 1000, 2)
                logger.info(
                    f"{op_name} succeeded",
                    extra={
                        "operation":   op_name,
                        "duration_ms": duration_ms,
                        "result_type": type(result).__name__,
                    }
                )
                return result
            except ValueError as e:
                duration_ms = round((time.perf_counter() - start) * 1000, 2)
                logger.warning(
                    f"{op_name} validation failed: {e}",
                    extra={
                        "operation":   op_name,
                        "duration_ms": duration_ms,
                        "error":       str(e),
                    }
                )
                raise
            except Exception as e:
                duration_ms = round((time.perf_counter() - start) * 1000, 2)
                logger.error(
                    f"{op_name} failed: {e}",
                    extra={
                        "operation":   op_name,
                        "duration_ms": duration_ms,
                        "error":       str(e),
                    },
                    exc_info=True
                )
                raise

        return wrapper
    return decorator
