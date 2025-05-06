from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
import json
from datetime import datetime

from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserResponse
from backend.routers.auth import get_password_hash, oauth2_scheme, get_current_user

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        logger.info("=== 开始获取当前用户信息 ===")
        logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 验证token并获取用户
        try:
            user = get_current_user(token, db)
            logger.info(f"成功获取用户信息: ID={user.id}, 用户名={user.username}, 邮箱={user.email}")
        except Exception as e:
            logger.error(f"获取用户信息失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据"
            )
        
        # 安全地获取统计数据
        try:
            followers_count = len(user.followers) if hasattr(user, 'followers') else 0
            following_count = len(user.following) if hasattr(user, 'following') else 0
            articles_count = len(user.blogs) if hasattr(user, 'blogs') else 0
            
            logger.info(f"用户统计数据:")
            logger.info(f"- 关注者数量: {followers_count}")
            logger.info(f"- 关注数量: {following_count}")
            logger.info(f"- 文章数量: {articles_count}")
        except Exception as e:
            logger.error(f"获取用户统计数据失败: {str(e)}")
            followers_count = 0
            following_count = 0
            articles_count = 0
        
        # 构建响应数据
        try:
            response_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar": user.avatar,
                "bio": user.bio if hasattr(user, 'bio') else None,
                "followers_count": followers_count,
                "following_count": following_count,
                "articles_count": articles_count,
                "created_at": user.created_at
            }
            
            logger.info("响应数据:")
            logger.info(json.dumps(response_data, default=str, ensure_ascii=False, indent=2))
            logger.info("=== 用户信息获取完成 ===")
            
            return response_data
        except Exception as e:
            logger.error(f"构建响应数据失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="构建用户信息失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error("=== 获取用户信息时发生错误 ===")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误信息: {str(e)}")
        logger.error("详细错误信息:", exc_info=True)
        logger.error("=== 错误详情结束 ===")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户信息失败: {str(e)}"
        )

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info("=== 开始创建新用户 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"用户信息: 用户名={user.username}, 邮箱={user.email}")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning(f"邮箱已被注册: {user.email}")
        raise HTTPException(status_code=400, detail="邮箱已被注册")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        avatar=None,
        following_count=0,
        followers_count=0,
        articles_count=0
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"成功创建新用户: ID={db_user.id}, 用户名={db_user.username}, 邮箱={db_user.email}")
        logger.info("=== 用户创建完成 ===")
        return db_user
    except Exception as e:
        logger.error("=== 创建用户时发生错误 ===")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误信息: {str(e)}")
        logger.error("详细错误信息:", exc_info=True)
        logger.error("=== 错误详情结束 ===")
        
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建用户失败"
        )

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logger.info("=== 开始获取用户列表 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"分页参数: skip={skip}, limit={limit}")
    
    users = db.query(User).offset(skip).limit(limit).all()
    logger.info(f"成功获取用户列表，共 {len(users)} 条记录")
    logger.info("=== 用户列表获取完成 ===")
    return users

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    logger.info("=== 开始获取指定用户信息 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"用户ID: {user_id}")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        logger.warning(f"用户不存在: ID={user_id}")
        raise HTTPException(status_code=404, detail="用户不存在")
    
    logger.info(f"成功获取用户信息: ID={db_user.id}, 用户名={db_user.username}")
    logger.info("=== 用户信息获取完成 ===")
    return db_user 