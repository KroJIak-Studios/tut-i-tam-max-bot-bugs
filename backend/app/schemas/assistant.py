from pydantic import BaseModel, Field

from app.schemas.bot_access import MaxIdentityRequest


class AssistantLocation(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class AssistantTurnRequest(MaxIdentityRequest):
    channel: str = Field(default="bot", pattern="^(bot|mini_app)$")
    text: str = Field(default="", max_length=2000)
    location: AssistantLocation | None = None
    new_conversation: bool = False
    choice_context: str = Field(default="", max_length=2000)


class AssistantAction(BaseModel):
    label: str
    path: str


class AssistantTurnResponse(BaseModel):
    status: str
    text: str
    suggestions: list[str]
    actions: list[AssistantAction]


class AssistantClientTurn(BaseModel):
    text: str = Field(default="", max_length=2000)
    location: AssistantLocation | None = None
    new_conversation: bool = False
    choice_context: str = Field(default="", max_length=2000)


class AssistantHistoryMessage(BaseModel):
    id: int
    role: str
    text: str


class AssistantHistoryResponse(BaseModel):
    messages: list[AssistantHistoryMessage]
