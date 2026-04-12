VALID_PRIORITIES = frozenset({"low", "medium", "high"})
VALID_STATUSES   = frozenset({"pending", "in_progress", "done"})

PRIORITY_DEFAULT = "medium"
STATUS_DEFAULT   = "pending"

DATE_FORMAT      = "%Y-%m-%d"
DATETIME_FORMAT  = "%Y-%m-%dT%H:%M:%S"

TIME_DEFAULTS: dict[str, str] = {
    "morning":   "09:00:00",
    "afternoon": "14:00:00",
    "evening":   "18:00:00",
    "night":     "21:00:00",
    "midnight":  "00:00:00",
    "noon":      "12:00:00",
    "midday":    "12:00:00",
}
