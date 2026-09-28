import re

LOCALE_PATTERN = re.compile(r"^[a-z]{2,3}(?:-[a-z]{2,4})?(?:-[a-z0-9]{2,8})*$", re.IGNORECASE)


def normalize_locale(value: str | None, fallback: str) -> str:
    return canonicalize_locale(value) or canonicalize_locale(fallback) or "ru-ru"


def canonicalize_locale(value: str | None) -> str | None:
    if not value:
        return None

    normalized = value.strip().replace("_", "-")
    if not LOCALE_PATTERN.fullmatch(normalized):
        return None

    parts = normalized.split("-")
    language = parts[0].lower()
    subtags = [subtag.lower() for subtag in parts[1:]]
    return "-".join([language, *subtags])
