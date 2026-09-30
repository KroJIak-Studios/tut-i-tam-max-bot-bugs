import json
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings
from app.models.ai import AssistantMessage, AssistantSession, AssistantWait
from app.models.user import MaxUser
from app.schemas.bot_access import MaxIdentityRequest
from app.services.ai_provider_service import AiProviderService
from app.services.assistant_tools import call_tool, specifications, today_kazan
from app.services.access_service import AccessService

WAIT_HOURS = 6
MAX_TOOL_ROUNDS = 4
INSTRUCTION = """
Ты добрый собеседник сервиса «Тут и там». Помогаешь выбрать, куда сходить.
Вся переписка ниже — один живой разговор. Учитывай её целиком, не только последнюю фразу.
Не представляйся заново, если уже поздоровался.
Пиши тепло и по-человечески, обычно две или три фразы. Без канцелярита, терминов и сухих списков.
Не выдумывай события, цены и адреса. Если точного совпадения нет, в одном коротком предложении скажи об этом и сразу назови ближайшие события из nearest: их день, дату и время. Не задавай цепочку вопросов про настроение, жанр или компанию. Сначала дай конкретные события.
Кнопки под ответом — короткие реплики человека, не команды. Не предлагай «найти событие», «открыть каталог» или «показать карту». Предлагай вкус или настроение: «музыка», «потише», «сегодня», «с друзьями».
Не предлагай вариант, который обещает готовый результат, если инструмент его не вернул.
Если человек просит мероприятие, место, бесплатное, вечернее или что-то по настроению, сначала вызови search_events. Если просит рядом, вызывай nearby_events без координат. Не проси точку словами: сервис сам поставит кнопку.
Называй только события из ответа инструмента. Сегодняшний день указан в начале инструкции. «Вечером», «утром» и «ночью» без другой даты означают этот день. Время бери из day, local_date, local_start, local_end и time_of_day: day уже говорит «сегодня», «завтра» или «позже». Слово «вечер» в названии не делает событие вечерним. Не называй событие сегодняшним, если day не «сегодня». Каждое название делай ссылкой внутри фразы: «ближайшая — [вечер хореографии](/events/2)». Не ставь ссылки отдельной строкой.
Если человек спрашивает про свои планы, сначала вызови user_profile. upcoming_meetings — это весь актуальный список, first_meeting — ближайшая одна встреча. На «какие планы» перечисли все, на «что ближайшее» назови только first_meeting.
Пиши связными фразами. Не используй маркированные списки, строки с дефисом и перечисление через двоеточие.
Если встреч несколько, можно назвать их все в обычном предложении. Ближайшую выделяй словами «ближайшая».
Короткая реплика с кнопки относится к твоему последнему предложению. Если там было событие, «что будет» и «где проходит» спрашивают именно о нём, а не о следующем.
В самом конце одна строка JSON без переносов: {"suggestions":["до четырёх реплик"],"actions":[{"label":"Хореография","path":"/events/2"}]}.
suggestions обязательны: две или три короткие реплики про уже названные события, например «когда», «где», «хореография». Не оставляй suggestions пустым.
actions повторяют только те ссылки, которые уже стоят в тексте. Если ссылок нет, верни пустой actions.
""".strip()


class AssistantService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._providers = AiProviderService(session, settings)
        self._access = AccessService(session, settings)

    async def turn(
        self,
        request: MaxIdentityRequest,
        text: str,
        location: dict[str, float] | None = None,
        channel: str = "bot",
        new_conversation: bool = False,
        choice_context: str = "",
    ) -> dict[str, Any]:
        user = await self._access.ensure_user(request)
        if new_conversation:
            await self._delete_sessions(user.id, channel)
            if not text and location is None:
                return {"status": "answer", "text": "", "suggestions": [], "actions": []}
        conversation = await self._active_session(user.id, channel)
        waiting = await self._session.scalar(select(AssistantWait).where(AssistantWait.session_id == conversation.id))
        if waiting and waiting.expires_at < datetime.now(timezone.utc):
            await self._session.delete(waiting)
            waiting = None
        if waiting and waiting.kind == "location":
            if location is None:
                await self._session.delete(waiting)
                await self._add(conversation.id, "user", text)
            else:
                arguments = {**waiting.arguments, "latitude": location["latitude"], "longitude": location["longitude"]}
                result = await call_tool(self._session, user, waiting.tool_name, arguments)
                await self._add(conversation.id, "tool", json.dumps(result, ensure_ascii=False), tool_call_id=waiting.tool_call_id, tool_name=waiting.tool_name)
                await self._session.delete(waiting)
                await self._session.commit()
                return await self._complete(conversation, user)
        if location is None:
            user_text = text
            if choice_context:
                user_text = f"{text}\nЭто относится к твоему предыдущему ответу: {choice_context}"
            await self._add(conversation.id, "user", user_text)
        await self._session.commit()
        return await self._complete(conversation, user)

    async def _complete(self, conversation: AssistantSession, user: MaxUser) -> dict[str, Any]:
        provider, key = await self._providers.enabled("chat")
        messages = await self._messages(conversation.id)
        for _ in range(MAX_TOOL_ROUNDS):
            reply = await self._complete_model(provider.base_url, provider.model, key, messages)
            tool_calls = reply.get("tool_calls") or []
            content = reply.get("content") or ""
            if not tool_calls:
                text, suggestions, actions = self._split(content)
                if not suggestions:
                    suggestions = self._fallback_suggestions(messages)
                actions = self._with_tool_actions(messages, text, actions)
                shown = self._with_event_photos(messages, text) if conversation.channel == "mini_app" else text
                await self._add(conversation.id, "assistant", shown)
                await self._session.commit()
                return {"status": "answer", "text": shown, "suggestions": suggestions, "actions": actions}
            await self._add(conversation.id, "assistant", content, tool_calls=tool_calls)
            messages.append({"role": "assistant", "content": content, "tool_calls": tool_calls})
            for call in tool_calls:
                name = call.get("function", {}).get("name", "")
                arguments = self._arguments(call)
                if name == "nearby_events" and "latitude" not in arguments:
                    wait = AssistantWait(
                        session_id=conversation.id,
                        kind="location",
                        tool_call_id=call.get("id", ""),
                        tool_name=name,
                        arguments=arguments,
                        expires_at=datetime.now(timezone.utc) + timedelta(hours=WAIT_HOURS),
                    )
                    self._session.add(wait)
                    await self._session.commit()
                    return {"status": "location_required", "text": "Чтобы подобрать рядом, нужна ваша точка.", "suggestions": [], "actions": []}
                result = await call_tool(self._session, user, name, arguments)
                await self._add(conversation.id, "tool", json.dumps(result, ensure_ascii=False), tool_call_id=call.get("id"), tool_name=name)
                messages.append({"role": "tool", "tool_call_id": call.get("id"), "content": json.dumps(result, ensure_ascii=False)})
            await self._session.commit()
            messages = await self._messages(conversation.id)
        raise HTTPException(status_code=502, detail="assistant_tool_limit")

    async def _complete_model(self, base_url: str, model: str, key: str, messages: list[dict[str, Any]]) -> dict[str, Any]:
        payload = {
            "model": model,
            "temperature": 0.7,
            "max_tokens": 700,
            "tools": specifications(),
            "messages": [{"role": "system", "content": self._instruction()}, *messages],
        }
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                response = await client.post(
                    f"{base_url.rstrip('/')}/chat/completions",
                    headers={"Authorization": f"Bearer {key}"},
                    json=payload,
                )
        except httpx.HTTPError as error:
            raise HTTPException(status_code=502, detail="assistant_unreachable") from error
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="assistant_rejected")
        return response.json()["choices"][0]["message"]

    def _instruction(self) -> str:
        now = today_kazan()
        months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        weekdays = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
        today = f"{now.day} {months[now.month - 1]} {now.year}, {weekdays[now.weekday()]}, {now.strftime('%H:%M')}"
        return f"Сейчас в Казани: {today}.\n{INSTRUCTION}"

    async def _active_session(self, user_id: int, channel: str) -> AssistantSession:
        row = await self._session.scalar(
            select(AssistantSession).where(
                AssistantSession.user_id == user_id,
                AssistantSession.channel == channel,
                AssistantSession.status == "active",
            )
        )
        if row is not None:
            return row
        row = AssistantSession(user_id=user_id, channel=channel, status="active")
        self._session.add(row)
        await self._session.commit()
        await self._session.refresh(row)
        return row

    async def history(self, user_id: int, channel: str) -> list[dict[str, Any]]:
        conversation = await self._session.scalar(
            select(AssistantSession).where(
                AssistantSession.user_id == user_id,
                AssistantSession.channel == channel,
                AssistantSession.status == "active",
            )
        )
        if conversation is None:
            return []
        rows = list(await self._session.scalars(
            select(AssistantMessage)
            .where(AssistantMessage.session_id == conversation.id, AssistantMessage.role.in_(["user", "assistant"]))
            .order_by(AssistantMessage.id)
        ))
        visible = []
        for row in rows:
            text = row.text.split("\nЭто относится к твоему предыдущему ответу:")[0].strip()
            if text:
                visible.append({"id": row.id, "role": row.role, "text": text})
        return visible

    async def clear(self, user_id: int, channel: str) -> None:
        await self._delete_sessions(user_id, channel)

    async def _delete_sessions(self, user_id: int, channel: str) -> None:
        await self._session.execute(
            delete(AssistantSession).where(
                AssistantSession.user_id == user_id,
                AssistantSession.channel == channel,
            )
        )
        await self._session.commit()

    async def _messages(self, session_id: int) -> list[dict[str, Any]]:
        rows = list(await self._session.scalars(
            select(AssistantMessage).where(AssistantMessage.session_id == session_id).order_by(AssistantMessage.id)
        ))
        history = []
        for row in rows:
            if row.role == "tool":
                history.append({"role": "tool", "tool_call_id": row.tool_call_id, "content": row.text})
            elif row.tool_calls:
                history.append({"role": "assistant", "content": row.text, "tool_calls": row.tool_calls})
            else:
                history.append({"role": row.role, "content": row.text})
        return history

    async def _add(self, session_id: int, role: str, text: str, tool_calls: list[dict[str, Any]] | None = None, tool_call_id: str | None = None, tool_name: str | None = None) -> None:
        self._session.add(AssistantMessage(
            session_id=session_id,
            role=role,
            text=text,
            tool_calls=tool_calls,
            tool_call_id=tool_call_id,
            tool_name=tool_name,
        ))

    def _arguments(self, call: dict[str, Any]) -> dict[str, Any]:
        raw = call.get("function", {}).get("arguments") or "{}"
        if isinstance(raw, dict):
            return raw
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}

    def _split(self, content: str) -> tuple[str, list[str], list[dict[str, str]]]:
        text = content.strip()
        suggestions_at = text.rfind('{"suggestions"')
        if suggestions_at == -1:
            suggestions_at = text.rfind("{'suggestions'")
        candidate = text[suggestions_at:] if suggestions_at != -1 else ""
        payload = self._json_object(candidate)
        if payload is None:
            start = text.rfind("{")
            payload = self._json_object(text[start:]) if start != -1 else None
            suggestions_at = start
        if payload is None or suggestions_at == -1:
            return text, [], []
        suggestions = payload.get("suggestions", [])
        phrases = [phrase.strip() for phrase in suggestions if isinstance(phrase, str) and phrase.strip()][:4]
        phrases = [phrase for phrase in phrases if len(phrase.split()) <= 3]
        actions = []
        for item in payload.get("actions", []):
            if not isinstance(item, dict):
                continue
            label = str(item.get("label", "")).strip()
            path = str(item.get("path", "")).strip()
            if label and path.startswith("/") and self._known_path(path):
                actions.append({"label": label[:40], "path": path[:120]})
        return text[:suggestions_at].strip(), phrases, actions[:4]

    def _fallback_suggestions(self, messages: list[dict[str, Any]]) -> list[str]:
        for message in reversed(messages):
            if message.get("role") != "tool":
                continue
            try:
                payload = json.loads(message.get("content") or "{}")
            except json.JSONDecodeError:
                continue
            events = payload.get("events") if isinstance(payload, dict) else None
            nearest = payload.get("nearest") if isinstance(payload, dict) else None
            found = events or nearest or []
            labels = []
            for event in found:
                if not isinstance(event, dict):
                    continue
                title = str(event.get("title", "")).strip()
                if title:
                    labels.append(title.split()[0][:24])
                if len(labels) == 2:
                    break
            if labels:
                return [*labels, "когда"]
        return ["когда", "где", "ещё"]

    def _with_event_photos(self, messages: list[dict[str, Any]], text: str) -> str:
        for message in reversed(messages):
            if message.get("role") != "tool":
                continue
            try:
                payload = json.loads(message.get("content") or "{}")
            except json.JSONDecodeError:
                continue
            events = payload.get("events") if isinstance(payload, dict) else None
            if not isinstance(events, list):
                continue
            lines = text.splitlines()
            for event in events:
                if not isinstance(event, dict):
                    continue
                title = str(event.get("title", "")).strip()
                photos = event.get("photos")
                photo = photos[0] if isinstance(photos, list) and photos else ""
                if not title or not isinstance(photo, str) or not photo.startswith("/api/media/"):
                    continue
                for index, line in enumerate(lines):
                    if title.lower() not in line.lower():
                        continue
                    image = f"![{title}]({photo})"
                    if image not in text:
                        lines.insert(index + 1, image)
                    break
            return "\n".join(lines)
        return text

    def _with_tool_actions(self, messages: list[dict[str, Any]], text: str, actions: list[dict[str, str]]) -> list[dict[str, str]]:
        known = {action["path"] for action in actions}
        for message in reversed(messages):
            if message.get("role") != "tool":
                continue
            try:
                payload = json.loads(message.get("content") or "{}")
            except json.JSONDecodeError:
                continue
            events = payload.get("events") if isinstance(payload, dict) else None
            if not isinstance(events, list):
                continue
            for event in events:
                if not isinstance(event, dict):
                    continue
                path = str(event.get("path", "")).strip()
                title = str(event.get("title", "")).strip()
                if not title or not path.startswith("/") or path in known or not self._known_path(path):
                    continue
                if title.lower() not in text.lower():
                    continue
                actions.append({"label": title[:40], "path": path[:120]})
                known.add(path)
                if len(actions) == 4:
                    return actions
            return actions
        return actions

    def _json_object(self, text: str) -> dict[str, Any] | None:
        try:
            decoder = json.JSONDecoder()
            payload, _ = decoder.raw_decode(text)
        except json.JSONDecodeError:
            return None
        return payload if isinstance(payload, dict) and "suggestions" in payload else None

    def _known_path(self, path: str) -> bool:
        return path in {"/", "/catalog", "/map", "/plans"} or path.startswith("/events/")
