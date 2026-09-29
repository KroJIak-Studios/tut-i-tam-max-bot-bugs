from pydantic import BaseModel, Field


class PendingMessageRequest(BaseModel):
    max_chat_id: int
    message_id: str = Field(min_length=1, max_length=255)


class PendingMessageSnapshotRequest(BaseModel):
    max_chat_id: int
    exclude_message_id: str | None = Field(default=None, max_length=255)


class PendingMessageSnapshotResponse(BaseModel):
    message_ids: list[str]


class PendingChatSnapshot(BaseModel):
    max_chat_id: int
    message_ids: list[str]


class PendingMessageRecoveryResponse(BaseModel):
    chats: list[PendingChatSnapshot]


class PendingMessageBatchRequest(BaseModel):
    max_chat_id: int
    message_ids: list[str] = Field(min_length=1)

