from sqlalchemy.orm import relationship
from app.models.user import User, user_following
from app.models.blog import Blog
from app.models.comment import Comment
from app.models.interaction import BlogLike, BlogFavorite, CommentLike
from app.models.history import History
from app.models.search_history import SearchHistory
from app.models.message import Message

# 定义 User 的关系
User.following = relationship(
    "User",
    secondary=user_following,
    primaryjoin="User.id==user_following.c.follower_id",
    secondaryjoin="User.id==user_following.c.followed_id",
    backref="followers"
)
User.blogs = relationship("Blog", back_populates="author")
User.comments = relationship("Comment", back_populates="author", lazy="dynamic")
User.blog_likes = relationship("BlogLike", back_populates="user", lazy="dynamic")
User.blog_favorites = relationship("BlogFavorite", back_populates="user", lazy="dynamic")
User.comment_likes = relationship("CommentLike", back_populates="user", lazy="dynamic")
User.histories = relationship("History", back_populates="user", lazy="dynamic")
User.search_histories = relationship("SearchHistory", back_populates="user", lazy="dynamic")
User.sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
User.received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")

# 确保所有模型都被导入
__all__ = [
    "User",
    "Blog",
    "Comment",
    "BlogLike",
    "BlogFavorite",
    "CommentLike",
    "History",
    "SearchHistory",
    "Message"
] 