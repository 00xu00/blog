from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from pydantic import BaseModel
import logging
import json

from backend.database import get_db
from backend.models import User
from backend.schemas import Token, TokenData, UserResponse

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter()

# 配置
SECRET_KEY = "your-secret-key"  # 在生产环境中应该使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    logger.info("=== 开始创建访问令牌 ===")
    logger.info(f"令牌数据: {json.dumps(data, ensure_ascii=False)}")
    
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    logger.info(f"令牌过期时间: {expire}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.info("=== 访问令牌创建完成 ===")
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    logger.info("=== 开始验证用户令牌 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"收到的token: {token[:10]}...")  # 只记录token的前10个字符
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.error("令牌中未找到邮箱信息")
            raise credentials_exception
        logger.info(f"成功解析令牌，用户邮箱: {email}")
    except JWTError as e:
        logger.error(f"令牌验证失败: {str(e)}")
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        logger.error(f"未找到用户: {email}")
        raise credentials_exception
    
    logger.info(f"成功验证用户: ID={user.id}, 用户名={user.username}")
    logger.info("=== 用户令牌验证完成 ===")
    return user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info("=== 开始用户登录 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"登录邮箱: {form_data.username}")
    
    # 使用邮箱查找用户
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        logger.warning(f"用户不存在: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"密码验证失败: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # 返回用户信息
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }
    
    logger.info(f"登录成功: ID={user.id}, 用户名={user.username}")
    logger.info("=== 用户登录完成 ===")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    logger.info("=== 开始用户注册 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"注册信息: 用户名={user_data.name}, 邮箱={user_data.email}")
    
    # 检查邮箱是否已经存在
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(f"邮箱已被注册: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )
    
    # 创建新用户
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        created_at=datetime.utcnow()
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"注册成功: ID={new_user.id}, 用户名={new_user.username}")
        logger.info("=== 用户注册完成 ===")
        return {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "created_at": new_user.created_at
        }
    except Exception as e:
        logger.error("=== 注册失败 ===")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误信息: {str(e)}")
        logger.error("详细错误信息:", exc_info=True)
        logger.error("=== 错误详情结束 ===")
        
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="注册失败，请稍后重试"
        ) 