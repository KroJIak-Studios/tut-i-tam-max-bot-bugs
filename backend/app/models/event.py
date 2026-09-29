from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

class City(Base):
    __tablename__ = "cities"
    id: Mapped[int] = mapped_column(primary_key=True)
    latitude: Mapped[float | None] = mapped_column()
    longitude: Mapped[float | None] = mapped_column()
    names: Mapped[list["CityName"]] = relationship(
        cascade="all, delete-orphan",
        order_by="CityName.locale_code",
    )


class CityName(Base):
    __tablename__ = "city_names"
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id", ondelete="CASCADE"), primary_key=True)
    locale_code: Mapped[str] = mapped_column(ForeignKey("locales.code"), primary_key=True)
    text: Mapped[str] = mapped_column(String(255))

class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("event_categories.id"))
    visible: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text)
    address: Mapped[str] = mapped_column(String(500))
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    chat_invite_url: Mapped[str | None] = mapped_column(String(2048))
    chat_max_id: Mapped[int | None] = mapped_column(BigInteger)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class OfficialEvent(Base):
    __tablename__ = "official_events"
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    price_rub: Mapped[int] = mapped_column(Integer)
    pushkin_card: Mapped[bool] = mapped_column(Boolean)

class UserEvent(Base):
    __tablename__ = "user_events"
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    author_user_id: Mapped[int] = mapped_column(ForeignKey("max_users.id"))

class MapArea(Base):
    __tablename__ = "map_areas"
    id: Mapped[int] = mapped_column(primary_key=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"))
    kind: Mapped[str] = mapped_column(String(32))
    name: Mapped[str] = mapped_column(String(255))
    path: Mapped[list[Any]] = mapped_column(JSON)
    visible: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

class EventPhoto(Base):
    __tablename__ = "event_photos"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(2048))
    position: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

class EventArea(Base):
    __tablename__ = "event_areas"
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    path: Mapped[list[Any]] = mapped_column(JSON)

class EventAttendance(Base):
    __tablename__ = "event_attendances"
    user_id: Mapped[int] = mapped_column(ForeignKey("max_users.id", ondelete="CASCADE"), primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class EventView(Base):
    __tablename__ = "event_views"
    user_id: Mapped[int] = mapped_column(ForeignKey("max_users.id", ondelete="CASCADE"), primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    viewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class EventReview(Base):
    __tablename__ = "event_reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("max_users.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(Integer)
    text: Mapped[str | None] = mapped_column(Text)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_event_reviews_event_user"),)
