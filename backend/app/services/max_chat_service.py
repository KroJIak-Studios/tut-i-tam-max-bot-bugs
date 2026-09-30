import re

from fastapi import HTTPException

INVITE_LINK = re.compile(
    r"^(?:https?://)?(?:web\.)?max\.ru/join/([A-Za-z0-9_-]+)/?$",
    re.IGNORECASE,
)


class MaxChatService:
    def invite(self, invite_url: str) -> str:
        link = INVITE_LINK.fullmatch(invite_url.strip())
        if link is None:
            raise HTTPException(status_code=422, detail="invalid_chat_link")
        return f"https://max.ru/join/{link.group(1)}"
