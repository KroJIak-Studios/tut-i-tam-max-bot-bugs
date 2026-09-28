from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas.pending_message import (
    PendingMessageBatchRequest,
    PendingMessageRecoveryResponse,
    PendingMessageRequest,
    PendingMessageSnapshotRequest,
    PendingMessageSnapshotResponse,
)
from app.services.pending_message_service import PendingMessageService

router = APIRouter(prefix="/bot/pending-messages", tags=["bot-pending-messages"])


def get_service(session: AsyncSession = Depends(get_session)) -> PendingMessageService:
    return PendingMessageService(session)


@router.put("", status_code=status.HTTP_204_NO_CONTENT)
async def track_pending_message(
    request: PendingMessageRequest,
    service: PendingMessageService = Depends(get_service),
) -> Response:
    await service.add(request.max_chat_id, request.message_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def untrack_pending_message(
    request: PendingMessageRequest,
    service: PendingMessageService = Depends(get_service),
) -> Response:
    await service.remove(request.max_chat_id, request.message_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/batch", status_code=status.HTTP_204_NO_CONTENT)
async def remove_pending_batch(
    request: PendingMessageBatchRequest,
    service: PendingMessageService = Depends(get_service),
) -> Response:
    await service.remove_batch(request.max_chat_id, request.message_ids)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/recovery-snapshot", response_model=PendingMessageRecoveryResponse)
async def get_recovery_snapshot(
    service: PendingMessageService = Depends(get_service),
) -> PendingMessageRecoveryResponse:
    return await service.recovery_snapshot()


@router.post("/snapshot", response_model=PendingMessageSnapshotResponse)
async def get_pending_snapshot(
    request: PendingMessageSnapshotRequest,
    service: PendingMessageService = Depends(get_service),
) -> PendingMessageSnapshotResponse:
    return await service.snapshot(request.max_chat_id, request.exclude_message_id)
