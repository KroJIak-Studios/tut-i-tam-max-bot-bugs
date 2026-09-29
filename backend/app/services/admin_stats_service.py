from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, OfficialEvent, UserEvent
from app.models.user import MaxUser
from app.schemas.admin_auth import AdminEventStats, AdminStats, AdminUserStats


class AdminStatsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def stats(self) -> AdminStats:
        official = select(func.count()).select_from(OfficialEvent).scalar_subquery()
        user_created = select(func.count()).select_from(UserEvent).scalar_subquery()
        events_total = select(func.count()).select_from(Event).scalar_subquery()
        users_total = select(func.count()).select_from(MaxUser).scalar_subquery()
        row = (
            await self._session.execute(select(events_total, official, user_created, users_total))
        ).one()
        return AdminStats(
            events=AdminEventStats(total=row[0], official=row[1], user_created=row[2]),
            users=AdminUserStats(total=row[3]),
        )
