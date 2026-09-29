from app.core.settings import Settings

LOCAL_DEV_AUTH_PREFIX = "local-development:"


def request_host(forwarded_host: str | None, host: str | None) -> str:
    raw_host = (forwarded_host or host or "").split(",")[0].strip().lower()
    if raw_host.startswith("["):
        end = raw_host.find("]")
        return raw_host[1:end] if end != -1 else raw_host
    return raw_host.split(":", 1)[0].rstrip(".")


def local_dev_auth_allowed(settings: Settings, hostname: str) -> bool:
    return settings.local_dev_auth_enabled and hostname in settings.local_dev_auth_host_allowlist
