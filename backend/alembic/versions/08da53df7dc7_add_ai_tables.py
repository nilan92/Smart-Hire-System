"""add ai tables

Revision ID: 08da53df7dc7
Revises: af363fe51ee2
Create Date: 2026-07-17 15:06:56.394432

"""
import sqlalchemy as sa
from alembic import op
from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "08da53df7dc7"
down_revision: str | Sequence[str] | None = "af363fe51ee2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create AI persistence tables on the current application schema."""
    op.create_table('ai_conversations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_conversations_id'), 'ai_conversations', ['id'], unique=False)
    op.create_table('review_summaries',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('service_id', sa.Integer(), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('service_id')
    )
    op.create_index(op.f('ix_review_summaries_id'), 'review_summaries', ['id'], unique=False)
    op.create_table('service_embeddings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('service_id', sa.Integer(), nullable=False),
    sa.Column('embedding', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('service_id')
    )
    op.create_index(op.f('ix_service_embeddings_id'), 'service_embeddings', ['id'], unique=False)
    op.create_table('ai_messages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('conversation_id', sa.Integer(), nullable=False),
    sa.Column('role', sa.String(length=20), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['conversation_id'], ['ai_conversations.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_messages_id'), 'ai_messages', ['id'], unique=False)


def downgrade() -> None:
    """Drop only the tables introduced by this revision."""
    op.drop_index(op.f('ix_ai_messages_id'), table_name='ai_messages')
    op.drop_table('ai_messages')
    op.drop_index(op.f('ix_service_embeddings_id'), table_name='service_embeddings')
    op.drop_table('service_embeddings')
    op.drop_index(op.f('ix_review_summaries_id'), table_name='review_summaries')
    op.drop_table('review_summaries')
    op.drop_index(op.f('ix_ai_conversations_id'), table_name='ai_conversations')
    op.drop_table('ai_conversations')
