"""add history table

Revision ID: 70c80f9f5d28
Revises: 8f8f8f8f8f8f
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '70c80f9f5d28'
down_revision = 'cbc4d264de73'
branch_labels = None
depends_on = None


def upgrade():
    # 创建历史记录表
    op.create_table(
        'histories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('blog_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['blog_id'], ['blogs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_histories_id'), 'histories', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_histories_id'), table_name='histories')
    op.drop_table('histories')
