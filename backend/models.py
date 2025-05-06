from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

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
    
    blogs = relationship("Blog", back_populates="author")
    
    following = relationship(
        "User",
        secondary="user_following",
        primaryjoin="User.id==user_following.c.follower_id",
        secondaryjoin="User.id==user_following.c.followed_id",
        backref="followers"
    )

user_following = Table(
    "user_following",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author_id = Column(Integer, ForeignKey("users.id"))
    
    author = relationship("User", back_populates="blogs") 