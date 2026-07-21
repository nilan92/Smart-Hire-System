from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ServiceEmbedding(Base):
    __tablename__ = "service_embeddings"

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

    embedding: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    service = relationship(
        "Service",
        back_populates="service_embedding",
    )