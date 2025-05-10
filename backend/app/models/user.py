from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey, Text
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
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    following_count = Column(Integer, default=0)
    followers_count = Column(Integer, default=0)
    articles_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    articles = relationship("Blog", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    following = relationship(
        "User",
        secondary="follows",
        primaryjoin="User.id==follows.c.follower_id",
        secondaryjoin="User.id==follows.c.followed_id",
        backref="followers"
    )
    histories = relationship("History", back_populates="user")
    search_histories = relationship("SearchHistory", back_populates="user", lazy="dynamic")
    
    # 消息关系
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver") 