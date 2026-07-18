"""create service marketplace tables

Revision ID: 20260718_0002
Revises: 20260715_0001
"""
from collections.abc import Sequence
from datetime import datetime, timezone
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260718_0002"
down_revision: str | Sequence[str] | None = "20260715_0001"
branch_labels = None
depends_on = None

service_status = postgresql.ENUM("active", "paused", "draft", name="service_status", create_type=False)

def upgrade() -> None:
    service_status.create(op.get_bind(), checkfirst=True)
    op.create_table("service_categories", sa.Column("id", sa.Integer(), nullable=False), sa.Column("name", sa.String(100), nullable=False), sa.Column("description", sa.Text()), sa.Column("icon", sa.String(20), nullable=False, server_default="🛠️"), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("name"))
    op.create_index("ix_service_categories_id", "service_categories", ["id"])
    op.create_index("ix_service_categories_name", "service_categories", ["name"])
    op.create_table("services", sa.Column("id", sa.Integer(), nullable=False), sa.Column("provider_id", sa.Integer(), nullable=False), sa.Column("category_id", sa.Integer(), nullable=False), sa.Column("title", sa.String(160), nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("price", sa.Numeric(12,2), nullable=False), sa.Column("city", sa.String(100), nullable=False), sa.Column("duration", sa.String(60), nullable=False), sa.Column("status", service_status, nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["provider_id"],["users.id"],ondelete="CASCADE"), sa.ForeignKeyConstraint(["category_id"],["service_categories.id"]), sa.PrimaryKeyConstraint("id"))
    for column in ("id", "provider_id", "category_id", "title"): op.create_index(f"ix_services_{column}", "services", [column])
    op.create_table("service_images", sa.Column("id", sa.Integer(), nullable=False), sa.Column("service_id", sa.Integer(), nullable=False), sa.Column("image_url", sa.Text(), nullable=False), sa.ForeignKeyConstraint(["service_id"],["services.id"],ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_service_images_service_id", "service_images", ["service_id"])
    op.create_table("favorites", sa.Column("id", sa.Integer(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=False), sa.Column("service_id", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["user_id"],["users.id"],ondelete="CASCADE"), sa.ForeignKeyConstraint(["service_id"],["services.id"],ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("user_id","service_id",name="uq_favorites_user_service"))
    op.create_index("ix_favorites_user_id", "favorites", ["user_id"]); op.create_index("ix_favorites_service_id", "favorites", ["service_id"])
    op.create_table("service_areas", sa.Column("id", sa.Integer(), nullable=False), sa.Column("provider_id", sa.Integer(), nullable=False), sa.Column("service_id", sa.Integer()), sa.Column("district", sa.String(100), nullable=False), sa.Column("city", sa.String(100), nullable=False), sa.Column("radius_km", sa.Integer(), nullable=False), sa.ForeignKeyConstraint(["provider_id"],["users.id"],ondelete="CASCADE"), sa.ForeignKeyConstraint(["service_id"],["services.id"],ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_service_areas_provider_id", "service_areas", ["provider_id"]); op.create_index("ix_service_areas_service_id", "service_areas", ["service_id"])
    categories = sa.table("service_categories", sa.column("name", sa.String), sa.column("description", sa.Text), sa.column("icon", sa.String), sa.column("created_at", sa.DateTime(timezone=True)))
    now = datetime.now(timezone.utc)
    op.bulk_insert(categories, [{"name":"Plumbing","description":"Pipes, fixtures and drainage","icon":"💧","created_at":now},{"name":"Electrical","description":"Electrical installation and repairs","icon":"⚡","created_at":now},{"name":"Cleaning","description":"Home and office cleaning","icon":"✨","created_at":now},{"name":"Tutoring","description":"In-person and online lessons","icon":"📚","created_at":now},{"name":"Repairs","description":"General maintenance and repairs","icon":"🛠️","created_at":now},{"name":"Tech Support","description":"Computer and network support","icon":"💻","created_at":now}])

def downgrade() -> None:
    op.drop_table("service_areas"); op.drop_table("favorites"); op.drop_table("service_images"); op.drop_table("services"); op.drop_table("service_categories")
    service_status.drop(op.get_bind(), checkfirst=True)
