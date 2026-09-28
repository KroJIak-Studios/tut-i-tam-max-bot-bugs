from datetime import datetime

from sqlalchemy import BigInteger, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class MaxUser(Base):
    __tablename__ = "max_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    max_user_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str | None] = mapped_column(String(255))
    username: Mapped[str | None] = mapped_column(String(255))
    locale: Mapped[str] = mapped_column(String(64), default="ru-ru")
    avatar_url: Mapped[str | None] = mapped_column(String(2048))
    full_avatar_url: Mapped[str | None] = mapped_column(String(2048))
    notification_preference: Mapped[str] = mapped_column(String(16), default="enabled")
    access_granted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    access_code_fingerprint: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
