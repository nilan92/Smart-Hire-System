from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReviewSummary(Base):
    __tablename__ = "review_summaries"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    service_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    service = relationship(
        "Service",
        back_populates="review_summary",
    )