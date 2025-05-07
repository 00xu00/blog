from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

# 用户关注关系表
user_following = Table(
    "user_following",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100))
    avatar = Column(String(200), nullable=True)
    bio = Column(String(500), nullable=True)
    following_count = Column(Integer, default=0)
    followers_count = Column(Integer, default=0)
    articles_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    following = relationship(
        "User",
        secondary=user_following,
        primaryjoin="User.id==user_following.c.follower_id",
        secondaryjoin="User.id==user_following.c.followed_id",
        backref="followers"
    ) 