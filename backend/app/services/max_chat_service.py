import re

import httpx
from fastapi import HTTPException

from app.core.settings import get_settings

CHAT_LINK = re.compile(r"(?:https?://)?(?:web\.)?max\.ru/(?:join/)?([A-Za-z0-9_-]+)", re.IGNORECASE)


class MaxChatService:
    async def check(self, invite_url: str) -> dict:
        token = get_settings().bot_token
        if not token:
            raise HTTPException(status_code=503, detail="bot_token_missing")
        link = CHAT_LINK.search(invite_url.strip())
        if link is None:
            raise HTTPException(status_code=422, detail="invalid_chat_link")
        headers = {"Authorization": token}
        async with httpx.AsyncClient(base_url="https://platform-api2.max.ru", timeout=8) as client:
            chat_response = await client.get(f"/chats/{link.group(1)}", headers=headers)
            if chat_response.status_code == 404:
                return self._result(False, False, False, "chat_not_found")
            if chat_response.status_code >= 400:
                return self._result(False, False, False, "chat_unavailable")
            chat_id = chat_response.json().get("chat_id")
            member_response = await client.get(f"/chats/{chat_id}/members/me", headers=headers)
        if member_response.status_code == 404:
            return self._result(True, False, False, "bot_not_in_chat", chat_id)
        if member_response.status_code >= 400:
            return self._result(True, False, False, "membership_unavailable", chat_id)
        member = member_response.json()
        permissions = set(member.get("permissions") or [])
        is_admin = bool(member.get("is_admin") or member.get("is_owner"))
        can_write = "write" in permissions or "post_edit_delete_message" in permissions
        ready = is_admin and can_write
        return self._result(True, True, ready, "ready" if ready else "missing_permissions", chat_id, sorted(permissions))

    def _result(
        self,
        chat_found: bool,
        bot_in_chat: bool,
        ready: bool,
        status: str,
        chat_id: int | None = None,
        permissions: list[str] | None = None,
    ) -> dict:
        return {
            "chat_found": chat_found,
            "bot_in_chat": bot_in_chat,
            "bot_ready": ready,
            "status": status,
            "chat_id": chat_id,
            "permissions": permissions or [],
        }
