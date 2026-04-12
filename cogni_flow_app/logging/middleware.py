import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from cogni_flow_app.logging.logger import get_logger

logger = get_logger("cogniflow.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    SKIP_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        logger.info(
            f"-> {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method":     request.method,
                "path":       request.url.path,
                "query":      str(request.query_params) or None,
                "client_ip":  request.client.host if request.client else None,
            }
        )

        try:
            response: Response = await call_next(request)
        except Exception as e:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.critical(
                f"X {request.method} {request.url.path} — unhandled exception",
                extra={
                    "request_id":  request_id,
                    "duration_ms": duration_ms,
                    "error":       str(e),
                },
                exc_info=True,
            )
            raise

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        level = (
            logger.warning if 400 <= response.status_code < 500
            else logger.error if response.status_code >= 500
            else logger.info
        )
        level(
            f"<- {response.status_code} {request.method} {request.url.path}",
            extra={
                "request_id":  request_id,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            }
        )
        response.headers["X-Request-ID"] = request_id
        return response
