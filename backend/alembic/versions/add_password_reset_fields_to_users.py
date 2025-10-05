"""Add password reset fields to users

Revision ID: 4d5e6f7g8h9i
Revises: 3c4d5e6f7g8h
Create Date: 2025-10-04 19:32:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4d5e6f7g8h9i'
down_revision = '3c4d5e6f7g8h'
branch_labels = None
depends_on = None


def upgrade():
    # Add password reset fields to users table
    op.add_column('users', sa.Column('reset_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    # Remove password reset fields from users table
    op.drop_column('users', 'reset_token_expires_at')
    op.drop_column('users', 'reset_token')