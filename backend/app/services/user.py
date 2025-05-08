from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    logger.info(f"通过用户名查询用户: {username}")
    user = db.query(User).filter(User.username == username).first()
    logger.info(f"查询结果: {'找到用户' if user else '未找到用户'}")
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    logger.info(f"通过邮箱查询用户: {email}")
    user = db.query(User).filter(User.email == email).first()
    logger.info(f"查询结果: {'找到用户' if user else '未找到用户'}")
    if user:
        logger.info(f"用户信息: id={user.id}, username={user.username}, email={user.email}")
    return user

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    logger.info(f"通过ID查询用户: {user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    logger.info(f"查询结果: {'找到用户' if user else '未找到用户'}")
    return user

def create_user(db: Session, user_in: UserCreate) -> User:
    logger.info(f"创建新用户: username={user_in.username}, email={user_in.email}")
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"用户创建成功: id={db_user.id}")
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    # 首先尝试使用邮箱查找用户
    user = get_user_by_email(db, username)
    if not user:
        # 如果邮箱查找失败，尝试使用用户名
        user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user 