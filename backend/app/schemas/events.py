from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Category = Literal['event','place','volunteer','sport','park']
class EventCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    title: str; description: str; category: Category; city_id: int; address: str
    latitude: float; longitude: float; starts_at: datetime; ends_at: datetime|None = None
    area: list[list[float]]|None = None
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5); text: str|None = None; anonymous: bool = False
class MePatch(BaseModel):
    city_id: int|None = None; smart_interest_rotation: bool|None = None
    notify_event_reminders: bool|None = None; notify_schedule_changes: bool|None = None
