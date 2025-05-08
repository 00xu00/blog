from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.db.base import get_db
from app.schemas.user import Token, UserCreate, UserInDB
from app.services.user import create_user, authenticate_user, get_user_by_email
import logging
import json
from pydantic import ValidationError

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=UserInDB)
async def register(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # 获取请求体
        body = await request.body()
        if not body:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="请求体不能为空"
            )
        
        # 尝试解析JSON
        try:
            data = await request.json()
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的JSON格式"
            )
        
        # 字段名映射
        field_mapping = {
            "name": "username",
            "userName": "username",
            "user_name": "username",
            "email": "email",
            "password": "password",
            "pwd": "password"
        }
        
        # 转换字段名
        mapped_data = {}
        for key, value in data.items():
            if key in field_mapping:
                mapped_data[field_mapping[key]] = value
            else:
                mapped_data[key] = value
        
        # 创建用户对象
        try:
            user_in = UserCreate(**mapped_data)
        except ValidationError as e:
            # 提取第一个错误消息
            error_msg = str(e.errors()[0]['msg'])
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_msg
            )
        
        # 检查邮箱是否已存在
        if get_user_by_email(db, email=user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被注册"
            )
        
        # 创建用户
        user = create_user(db, user_in)
        return user
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"注册失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"注册失败: {str(e)}"
        )

@router.post("/token", response_model=Token)
async def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # 尝试解析JSON数据
        try:
            data = await request.json()
            email = data.get("email")
            password = data.get("password")
            
            logger.info(f"登录请求 - 邮箱: {email}")
            
            if not email or not password:
                logger.warning("登录失败 - 邮箱或密码为空")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="邮箱和密码不能为空"
                )
            
            # 使用邮箱查找用户
            user = get_user_by_email(db, email)
            if not user:
                logger.warning(f"登录失败 - 用户不存在: {email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="邮箱或密码错误",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            logger.info(f"找到用户: {user.username}")
            logger.info(f"验证密码 - 用户: {user.username}, 邮箱: {user.email}")
            
            # 验证密码
            is_valid = verify_password(password, user.hashed_password)
            logger.info(f"密码验证结果: {'成功' if is_valid else '失败'}")
            
            if not is_valid:
                logger.warning(f"登录失败 - 密码错误: {email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="邮箱或密码错误",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            logger.info(f"密码验证成功: {user.username}")
            
            # 创建访问令牌
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
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
            
            logger.info(f"登录成功: {user.username}")
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_data
            }
            
        except json.JSONDecodeError:
            logger.error("登录失败 - 无效的JSON格式")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的JSON格式"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"登录失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"登录失败: {str(e)}"
        ) 