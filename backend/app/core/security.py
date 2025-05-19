from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    logger.info("开始验证密码")
    result = pwd_context.verify(plain_password, hashed_password)
    logger.info(f"密码验证结果: {'成功' if result else '失败'}")
    return result

def get_password_hash(password: str) -> str:
    logger.info("开始生成密码哈希")
    hashed = pwd_context.hash(password)
    logger.info("密码哈希生成完成")
    return hashed

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    logger.info("开始创建访问令牌")
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    logger.info(f"令牌数据: {to_encode}")
    logger.info(f"使用密钥: {settings.SECRET_KEY}")
    logger.info(f"使用算法: {settings.ALGORITHM}")
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.info(f"生成的token: {encoded_jwt[:20]}...")
    return encoded_jwt 