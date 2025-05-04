from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blog.db")
logger.info(f"数据库连接URL: {SQLALCHEMY_DATABASE_URL}")

try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    logger.info("数据库引擎创建成功")
except Exception as e:
    logger.error(f"数据库引擎创建失败: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
logger.info("数据库会话工厂创建成功")

Base = declarative_base()

# 依赖项
def get_db():
    db = SessionLocal()
    try:
        logger.info("数据库会话创建成功")
        yield db
    finally:
        db.close()
        logger.info("数据库会话已关闭") 