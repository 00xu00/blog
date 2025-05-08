from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    subtitle = Column(String(200), nullable=True)
    content = Column(Text)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author_id = Column(Integer, ForeignKey("users.id"))
    is_published = Column(Integer, default=0)  # 0: 草稿, 1: 已发布
    likes_count = Column(Integer, default=0)  # 点赞数
    favorites_count = Column(Integer, default=0)  # 收藏数
    views_count = Column(Integer, default=0)  # 浏览量
    
    # 关系
    author = relationship("User", back_populates="blogs")
    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")
    likes = relationship("BlogLike", back_populates="blog", cascade="all, delete-orphan")
    favorites = relationship("BlogFavorite", back_populates="blog", cascade="all, delete-orphan")
    
    # 非数据库字段
    is_liked = Column(Boolean, default=False)
    is_favorited = Column(Boolean, default=False) 