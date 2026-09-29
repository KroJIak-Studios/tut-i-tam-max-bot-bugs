import hashlib
import hmac
import json
from dataclasses import dataclass
from urllib.parse import parse_qsl


@dataclass(frozen=True)
class MaxInitUser:
    id: int
    first_name: str
    last_name: str | None
    username: str | None
    language_code: str | None
    photo_url: str | None


def validate_init_data(init_data: str, bot_token: str) -> MaxInitUser:
    pairs = parse_qsl(init_data, keep_blank_values=True, strict_parsing=True)
    keys = [key for key, _value in pairs]
    if keys.count("hash") != 1 or len(keys) != len(set(keys)):
        raise ValueError("init_data is malformed")
    received_hash = dict(pairs)["hash"]
    launch_params = "\n".join(
        f"{key}={value}" for key, value in sorted(pairs) if key != "hash"
    )
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, launch_params.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("init_data signature is invalid")
    raw_user = dict(pairs).get("user")
    if not raw_user:
        raise ValueError("init_data has no user")
    user = json.loads(raw_user)
    if not isinstance(user, dict) or not isinstance(user.get("id"), int):
        raise ValueError("init_data user is invalid")
    return MaxInitUser(
        id=user["id"],
        first_name=str(user.get("first_name") or ""),
        last_name=user.get("last_name"),
        username=user.get("username"),
        language_code=user.get("language_code"),
        photo_url=user.get("photo_url"),
    )
