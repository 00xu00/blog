from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.base import get_db
from app.models.user import User
import logging

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

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