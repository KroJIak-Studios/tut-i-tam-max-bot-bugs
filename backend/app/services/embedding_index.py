from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings
from app.models.event import Event
from app.models.profile import Interest, InterestName
from app.services.embedding_client import EmbeddingClient


class EmbeddingIndex:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._client = EmbeddingClient(session, settings)

    async def index_event(self, event: Event) -> None:
        if not event.visible:
            event.embedding = None
            event.embedding_model = None
            return
        vector, model = await self._client.embed(f"{event.title}\n{event.description}")
        event.embedding = vector
        event.embedding_model = model

    async def index_interests(self) -> None:
        interests = list(await self._session.scalars(select(Interest)))
        for interest in interests:
            names = list(await self._session.scalars(
                select(InterestName.text).where(InterestName.interest_id == interest.id).order_by(InterestName.locale_code)
            ))
            vector, model = await self._client.embed("\n".join(names))
            interest.embedding = vector
            interest.embedding_model = model

    async def missing_events(self) -> list[Event]:
        provider_model = await self._current_model()
        return list(await self._session.scalars(
            select(Event).where(
                Event.visible.is_(True),
                (Event.embedding.is_(None)) | (Event.embedding_model.is_distinct_from(provider_model)),
            )
        ))

    async def _current_model(self) -> str:
        provider, _ = await self._client._providers.enabled("embedding")
        return provider.model
