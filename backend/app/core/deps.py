from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.base import get_db
from app.models.user import User
import logging
from typing import Optional
from datetime import datetime

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
    
    if not token:
        logger.error("未提供token")
        raise credentials_exception
        
    try:
        logger.info(f"正在解码token: {token}")
        logger.info(f"当前SECRET_KEY: {settings.SECRET_KEY}")
        logger.info(f"使用算法: {settings.ALGORITHM}")
        
        # 尝试解码token
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            logger.info(f"Token解码成功，payload: {payload}")
        except JWTError as e:
            logger.error(f"JWT解码错误: {str(e)}")
            # 尝试不验证签名
            try:
                payload = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_signature": False}
                )
                logger.info(f"不验证签名的解码结果: {payload}")
                logger.error("Token签名验证失败，可能是使用了不同的密钥生成的token")
            except Exception as e2:
                logger.error(f"不验证签名的解码也失败: {str(e2)}")
            raise credentials_exception
            
        email: str = payload.get("sub")
        if email is None:
            logger.error("token中未找到email")
            raise credentials_exception
            
        # 检查token是否过期
        exp = payload.get("exp")
        if exp is None:
            logger.error("token中未找到过期时间")
            raise credentials_exception
            
        current_time = datetime.utcnow().timestamp()
        if current_time > exp:
            logger.error(f"token已过期: exp={exp}, current={current_time}")
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