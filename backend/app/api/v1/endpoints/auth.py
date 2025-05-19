from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.base import get_db
from app.schemas.user import Token, UserCreate, UserInDB
from app.services.user import create_user, authenticate_user, get_user_by_email
from app.services.email import send_verification_email, send_reset_password_email
from app.services.verification import (
    generate_verification_code,
    save_verification_code,
    get_verification_code,
    delete_verification_code,
    cleanup_expired_codes
)
import logging
import json
from pydantic import ValidationError
from typing import Dict
from jose import JWTError, jwt

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
            logger.info(f"当前SECRET_KEY: {settings.SECRET_KEY}")
            
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
            logger.info(f"创建token - 过期时间: {access_token_expires}")
            access_token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires
            )
            logger.info(f"生成的token: {access_token}")
            
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

@router.post("/send-verification-code")
async def send_verification_code(request: Request):
    """发送邮箱验证码"""
    try:
        # 清理过期的验证码
        cleanup_expired_codes()
        
        data = await request.json()
        email = data.get("email")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱不能为空"
            )
            
        # 生成验证码
        code = generate_verification_code()
        
        # 保存验证码
        save_verification_code(email, code)
        
        # 发送验证码邮件
        if send_verification_email(email, code):
            return {"message": "验证码已发送"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="验证码发送失败"
            )
            
    except Exception as e:
        logger.error(f"发送验证码失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"发送验证码失败: {str(e)}"
        )

@router.post("/verify-code")
async def verify_code(request: Request):
    """验证邮箱验证码"""
    try:
        data = await request.json()
        email = data.get("email")
        code = data.get("code")
        
        if not email or not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱和验证码不能为空"
            )
            
        # 获取验证码
        stored_code = get_verification_code(email)
        
        if not stored_code or stored_code != code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码无效或已过期"
            )
            
        # 验证成功后不删除验证码，等待重置密码成功后再删除
        return {"message": "验证码验证成功"}
        
    except Exception as e:
        logger.error(f"验证码验证失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"验证码验证失败: {str(e)}"
        )

@router.post("/forgot-password")
async def forgot_password(request: Request, db: Session = Depends(get_db)):
    """发送重置密码邮件"""
    try:
        data = await request.json()
        email = data.get("email")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱不能为空"
            )
            
        # 检查用户是否存在
        user = get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="该邮箱未注册"
            )
            
        # 生成重置密码token
        reset_token = create_access_token(
            data={"sub": email},
            expires_delta=timedelta(hours=1)
        )
        
        # 发送重置密码邮件
        if send_reset_password_email(email, reset_token):
            return {"message": "重置密码邮件已发送"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="重置密码邮件发送失败"
            )
            
    except Exception as e:
        logger.error(f"发送重置密码邮件失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"发送重置密码邮件失败: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(request: Request, db: Session = Depends(get_db)):
    """重置密码"""
    try:
        data = await request.json()
        email = data.get("email")
        token = data.get("token")
        new_password = data.get("new_password")
        
        if not email or not token or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱、验证码和新密码不能为空"
            )
            
        # 验证验证码
        stored_code = get_verification_code(email)
        if not stored_code or stored_code != token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码无效或已过期"
            )
            
        # 更新用户密码
        user = get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
            
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        
        # 重置密码成功后删除验证码
        delete_verification_code(email)
        
        return {"message": "密码重置成功"}
        
    except Exception as e:
        logger.error(f"重置密码失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重置密码失败: {str(e)}"
        ) 