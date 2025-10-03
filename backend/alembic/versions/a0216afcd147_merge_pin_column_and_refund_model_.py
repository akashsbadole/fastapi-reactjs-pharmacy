"""Merge PIN column and Refund model updates

Revision ID: a0216afcd147
Revises: 85b391fb9d65, update_refund_model
Create Date: 2025-10-03 22:02:33.053576

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a0216afcd147'
down_revision = ('85b391fb9d65', 'update_refund_model')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass