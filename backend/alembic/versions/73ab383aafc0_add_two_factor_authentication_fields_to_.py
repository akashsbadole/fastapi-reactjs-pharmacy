"""Add two factor authentication fields to users table

Revision ID: 73ab383aafc0
Revises: bd80e5841a10
Create Date: 2025-10-05 12:09:22.458825

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73ab383aafc0'
down_revision = 'bd80e5841a10'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add two-factor authentication fields to users table
    op.add_column('users', sa.Column('two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('two_factor_secret', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove two-factor authentication fields from users table
    op.drop_column('users', 'two_factor_secret')
    op.drop_column('users', 'two_factor_enabled')