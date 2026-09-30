from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class EventCategory(Base):
    __tablename__ = "event_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str | None] = mapped_column(String(32), unique=True)
    names: Mapped[list["EventCategoryName"]] = relationship(
        cascade="all, delete-orphan",
        order_by="EventCategoryName.locale_code",
    )


class EventCategoryName(Base):
    __tablename__ = "event_category_names"

    category_id: Mapped[int] = mapped_column(ForeignKey("event_categories.id", ondelete="CASCADE"), primary_key=True)
    locale_code: Mapped[str] = mapped_column(ForeignKey("locales.code"), primary_key=True)
    text: Mapped[str] = mapped_column(String(255))
