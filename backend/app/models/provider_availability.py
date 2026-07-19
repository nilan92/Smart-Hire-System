from datetime import datetime, time, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ProviderAvailability(Base):
    __tablename__ = "provider_availability"
    __table_args__ = (
        CheckConstraint(
            "day_of_week >= 0 AND day_of_week <= 6",
            name="ck_provider_availability_day_of_week_range",
        ),
        CheckConstraint(
            "end_time > start_time",
            name="ck_provider_availability_end_after_start",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    provider_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # 0 = Sunday ... 6 = Saturday
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
