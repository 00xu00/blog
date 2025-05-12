from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.base import get_db
from app.models.user import User
import logging
from typing import Optional

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    logger.info("开始验证用户token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.info(f"正在解码token: {token[:10]}...")
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            logger.error("token中未找到email")
            raise credentials_exception
    except JWTError as e:
        logger.error(f"JWT解码错误: {str(e)}")
        raise credentials_exception
    
    logger.info(f"正在查找用户: {email}")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        logger.error(f"未找到用户: {email}")
        raise credentials_exception
    
    logger.info(f"用户验证成功: {user.username}")
    return user

async def get_current_user_optional(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Optional[User]:
    """
    可选的用户认证，如果token无效或不存在，返回None而不是抛出异常
    """
    if not token:
        logger.info("未提供token")
        return None
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            logger.info("token中未找到email")
            return None
    except JWTError:
        logger.info("token无效")
        return None
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        logger.info(f"未找到用户: {email}")
        return None
    
    logger.info(f"用户验证成功: {user.username}")
    return user 