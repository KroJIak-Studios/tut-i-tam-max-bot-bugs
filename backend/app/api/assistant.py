from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.db import get_session
from app.schemas.assistant import AssistantTurnRequest, AssistantTurnResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["assistant"])


def service(session: AsyncSession = Depends(get_session)) -> AssistantService:
    return AssistantService(session, get_settings())


@router.post("/turns", response_model=AssistantTurnResponse)
async def turn(request: AssistantTurnRequest, assistant: AssistantService = Depends(service)) -> AssistantTurnResponse:
    location = request.location.model_dump() if request.location else None
    result = await assistant.turn(request, request.text, location, request.channel, request.new_conversation)
    return AssistantTurnResponse(**result)
