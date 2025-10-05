"""Add profile_image column to users table

Revision ID: bd80e5841a10
Revises: 301dd7b73a6e
Create Date: 2025-10-05 12:06:37.878677

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bd80e5841a10'
down_revision = '301dd7b73a6e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add profile_image column to users table
    op.add_column('users', sa.Column('profile_image', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove profile_image column from users table
    op.drop_column('users', 'profile_image')