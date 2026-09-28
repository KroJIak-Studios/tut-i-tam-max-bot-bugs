from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event, EventAttendance
class EventRepository:
 def __init__(self,s:AsyncSession): self.s=s
 async def get(self,eid): return await self.s.scalar(select(Event).where(Event.id==eid))
 async def attendance(self,uid,eid): return await self.s.scalar(select(EventAttendance).where(EventAttendance.user_id==uid,EventAttendance.event_id==eid))
