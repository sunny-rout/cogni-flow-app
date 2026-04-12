import logging
import sys
import json
from datetime import datetime, timezone
from cogni_flow_app.config import config


class JsonFormatter(logging.Formatter):
    SEVERITY_MAP = {
        logging.DEBUG:    "DEBUG",
        logging.INFO:     "INFO",
        logging.WARNING:  "WARNING",
        logging.ERROR:    "ERROR",
        logging.CRITICAL: "CRITICAL",
    }

    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "timestamp":  datetime.now(timezone.utc).isoformat(),
            "severity":   self.SEVERITY_MAP.get(record.levelno, "INFO"),
            "logger":     record.name,
            "message":    record.getMessage(),
            "module":     record.module,
            "funcName":   record.funcName,
            "lineNo":     record.lineno,
        }
        for key, value in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and not key.startswith("_"):
                payload[key] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


class DevFormatter(logging.Formatter):
    COLORS = {
        "DEBUG":    "\033[36m",
        "INFO":     "\033[32m",
        "WARNING":  "\033[33m",
        "ERROR":    "\033[31m",
        "CRITICAL": "\033[35m",
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, "")
        ts = datetime.now().strftime("%H:%M:%S")
        prefix = f"{color}[{record.levelname}]{self.RESET}"
        location = f"\033[90m{record.name}:{record.lineno}\033[0m"
        return f"{ts} {prefix} {location} — {record.getMessage()}"


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler(sys.stdout)

    use_json = config.use_vertex_ai == "1"
    handler.setFormatter(JsonFormatter() if use_json else DevFormatter())
    logger.addHandler(handler)
    logger.propagate = False

    return logger


app_logger = get_logger("cogniflow")
