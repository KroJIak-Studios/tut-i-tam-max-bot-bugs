from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Locale(Base):
    __tablename__ = "locales"

    code: Mapped[str] = mapped_column(String(32), primary_key=True)
    native_name: Mapped[str] = mapped_column(String(255))


class Interest(Base):
    __tablename__ = "interests"

    id: Mapped[int] = mapped_column(primary_key=True)
    color: Mapped[str] = mapped_column(String(7))
    embedding: Mapped[list[float] | None] = mapped_column(Vector(3072))
    embedding_model: Mapped[str | None] = mapped_column(String(255))
    names: Mapped[list["InterestName"]] = relationship(
        cascade="all, delete-orphan",
        order_by="InterestName.locale_code",
    )


class InterestName(Base):
    __tablename__ = "interest_names"

    interest_id: Mapped[int] = mapped_column(ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True)
    locale_code: Mapped[str] = mapped_column(ForeignKey("locales.code"), primary_key=True)
    text: Mapped[str] = mapped_column(String(255))


class UserInterest(Base):
    __tablename__ = "user_interests"

    user_id: Mapped[int] = mapped_column(ForeignKey("max_users.id", ondelete="CASCADE"), primary_key=True)
    interest_id: Mapped[int] = mapped_column(ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True)
    weight: Mapped[float] = mapped_column(Float, default=1, server_default="1")
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
