"""add blog favorites

Revision ID: add_blog_favorites
Revises: 
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_blog_favorites'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 创建blog_favorites表
    op.create_table(
        'blog_favorites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('blog_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['blog_id'], ['blogs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'blog_id', name='uix_user_blog_favorite')
    )
    op.create_index(op.f('ix_blog_favorites_id'), 'blog_favorites', ['id'], unique=False)

    # 在blogs表中添加favorites_count字段
    op.add_column('blogs', sa.Column('favorites_count', sa.Integer(), nullable=True, server_default='0'))

def downgrade():
    # 删除favorites_count字段
    op.drop_column('blogs', 'favorites_count')
    
    # 删除blog_favorites表
    op.drop_index(op.f('ix_blog_favorites_id'), table_name='blog_favorites')
    op.drop_table('blog_favorites') 