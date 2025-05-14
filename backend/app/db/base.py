from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging
from app.db.base_class import Base
from app.models import (
    User, Blog, Comment, BlogLike, BlogFavorite, CommentLike,
    History, SearchHistory, Message
)

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}  # 仅用于SQLite
    )
    logger.info("数据库引擎创建成功")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    logger.error(f"数据库引擎创建失败: {str(e)}")
    raise

logger.info("数据库会话工厂创建成功")

# 确保所有模型都被导入
__all__ = [
    "Base",
    "engine",
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

# 数据库依赖项
def get_db():
    db = SessionLocal()
    try:
        logger.info("创建新的数据库会话")
        yield db
    finally:
        logger.info("关闭数据库会话")
        db.close() 