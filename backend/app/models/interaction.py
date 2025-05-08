from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class BlogLike(Base):
    __tablename__ = "blog_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    blog_id = Column(Integer, ForeignKey("blogs.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="blog_likes")
    blog = relationship("Blog", back_populates="likes")

    # 确保用户只能点赞一次
    __table_args__ = (
        UniqueConstraint('user_id', 'blog_id', name='uix_user_blog_like'),
    )

class BlogFavorite(Base):
    __tablename__ = "blog_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    blog_id = Column(Integer, ForeignKey("blogs.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="blog_favorites")
    blog = relationship("Blog", back_populates="favorites")

    # 确保用户只能收藏一次
    __table_args__ = (
        UniqueConstraint('user_id', 'blog_id', name='uix_user_blog_favorite'),
    )

class CommentLike(Base):
    __tablename__ = "comment_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    comment_id = Column(Integer, ForeignKey("comments.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="comment_likes")
    comment = relationship("Comment", back_populates="likes")

    # 确保用户只能点赞一次
    __table_args__ = (
        UniqueConstraint('user_id', 'comment_id', name='uix_user_comment_like'),
    ) 