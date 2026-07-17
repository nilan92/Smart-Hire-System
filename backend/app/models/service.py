from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    service_embedding = relationship(
        "ServiceEmbedding",
        back_populates="service",
        uselist=False,
        cascade="all, delete-orphan",
    )
    review_summary = relationship(
        "ReviewSummary",
        back_populates="service",
        uselist=False,
        cascade="all, delete-orphan",
    )