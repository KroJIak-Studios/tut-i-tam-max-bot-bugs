import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.core.settings import Settings


class SecretBox:
    def __init__(self, settings: Settings) -> None:
        digest = hashlib.sha256(f"ai-provider:{settings.admin_password}".encode()).digest()
        self._fernet = Fernet(base64.urlsafe_b64encode(digest))

    def encrypt(self, value: str) -> str:
        return self._fernet.encrypt(value.encode()).decode()

    def decrypt(self, value: str) -> str:
        try:
            return self._fernet.decrypt(value.encode()).decode()
        except InvalidToken as error:
            raise ValueError("provider_key_unreadable") from error
