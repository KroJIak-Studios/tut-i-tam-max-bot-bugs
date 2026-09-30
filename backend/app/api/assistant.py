from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.events import current_user
from app.core.settings import get_settings
from app.db import get_session
from app.models.user import MaxUser
from app.schemas.assistant import (
    AssistantClientTurn,
    AssistantHistoryMessage,
    AssistantHistoryResponse,
    AssistantTurnRequest,
    AssistantTurnResponse,
)
from app.schemas.bot_access import MaxIdentityRequest
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["assistant"])


def service(session: AsyncSession = Depends(get_session)) -> AssistantService:
    return AssistantService(session, get_settings())


def client_identity(user: MaxUser) -> MaxIdentityRequest:
    return MaxIdentityRequest(
        max_user_id=user.max_user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        avatar_url=user.avatar_url,
        full_avatar_url=user.full_avatar_url,
        locale=user.locale,
        max_chat_id=user.max_user_id,
    )


@router.get("/app/history", response_model=AssistantHistoryResponse)
async def app_history(
    current: tuple[AsyncSession, MaxUser] = Depends(current_user),
    assistant: AssistantService = Depends(service),
) -> AssistantHistoryResponse:
    _session, user = current
    return AssistantHistoryResponse(messages=[AssistantHistoryMessage(**item) for item in await assistant.history(user.id, "mini_app")])


@router.delete("/app/history", status_code=204)
async def clear_app_history(
    current: tuple[AsyncSession, MaxUser] = Depends(current_user),
    assistant: AssistantService = Depends(service),
) -> None:
    _session, user = current
    await assistant.clear(user.id, "mini_app")


@router.post("/app/turns", response_model=AssistantTurnResponse)
async def app_turn(
    body: AssistantClientTurn,
    current: tuple[AsyncSession, MaxUser] = Depends(current_user),
    assistant: AssistantService = Depends(service),
) -> AssistantTurnResponse:
    _session, user = current
    location = body.location.model_dump() if body.location else None
    result = await assistant.turn(client_identity(user), body.text, location, "mini_app", body.new_conversation, body.choice_context)
    return AssistantTurnResponse(**result)


@router.post("/turns", response_model=AssistantTurnResponse)
async def turn(request: AssistantTurnRequest, assistant: AssistantService = Depends(service)) -> AssistantTurnResponse:
    location = request.location.model_dump() if request.location else None
    result = await assistant.turn(
        request,
        request.text,
        location,
        request.channel,
        request.new_conversation,
        request.choice_context,
    )
    return AssistantTurnResponse(**result)
