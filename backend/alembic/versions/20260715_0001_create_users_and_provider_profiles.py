"""create users and provider profiles

Revision ID: 20260715_0001
Revises:
Create Date: 2026-07-15
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import context, op
from sqlalchemy.dialects import postgresql


revision: str = "20260715_0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


user_role = postgresql.ENUM("customer", "provider", "admin", name="user_role", create_type=False)
account_status = postgresql.ENUM(
    "pending",
    "active",
    "suspended",
    "deactivated",
    name="account_status",
    create_type=False,
)
verification_status = postgresql.ENUM(
    "unverified",
    "pending",
    "verified",
    "rejected",
    name="verification_status",
    create_type=False,
)


def _has_table(table_name: str) -> bool:
    if context.is_offline_mode():
        return False
    return sa.inspect(op.get_bind()).has_table(table_name)


def upgrade() -> None:
    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    account_status.create(bind, checkfirst=True)
    verification_status.create(bind, checkfirst=True)

    if not _has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("full_name", sa.String(length=150), nullable=False),
            sa.Column("phone", sa.String(length=20), nullable=True),
            sa.Column("role", user_role, nullable=False),
            sa.Column("status", account_status, nullable=False),
            sa.Column("email_verified", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False, if_not_exists=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False, if_not_exists=True)

    if not _has_table("provider_profiles"):
        op.create_table(
            "provider_profiles",
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("bio", sa.Text(), nullable=True),
            sa.Column("years_experience", sa.Integer(), nullable=False),
            sa.Column("verification_status", verification_status, nullable=False),
            sa.Column("avg_rating", sa.Numeric(precision=3, scale=2), nullable=False),
            sa.Column("total_reviews", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "avg_rating >= 0 AND avg_rating <= 5",
                name="ck_provider_profiles_avg_rating_range",
            ),
            sa.CheckConstraint(
                "total_reviews >= 0",
                name="ck_provider_profiles_total_reviews_non_negative",
            ),
            sa.CheckConstraint(
                "years_experience >= 0",
                name="ck_provider_profiles_years_experience_non_negative",
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("user_id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    op.drop_table("provider_profiles", if_exists=True)
    op.drop_index(op.f("ix_users_id"), table_name="users", if_exists=True)
    op.drop_index(op.f("ix_users_email"), table_name="users", if_exists=True)
    op.drop_table("users", if_exists=True)
    verification_status.drop(bind, checkfirst=True)
    account_status.drop(bind, checkfirst=True)
    user_role.drop(bind, checkfirst=True)
