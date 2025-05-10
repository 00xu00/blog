from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.models.blog import Blog
from app.models.interaction import BlogLike, BlogFavorite
from app.schemas.blog import BlogInDB
from app.services import history as history_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=List[BlogInDB])
async def get_user_histories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的浏览历史"""
    logger.info(f"收到获取用户浏览历史请求: user_id={current_user.id}")
    
    blogs = history_service.get_user_histories(db, current_user.id, skip, limit)
    
    # 设置当前用户的点赞和收藏状态
    for blog in blogs:
        # 检查是否点赞
        like = db.query(BlogLike).filter(
            BlogLike.blog_id == blog.id,
            BlogLike.user_id == current_user.id
        ).first()
        blog.is_liked = like is not None
        
        # 检查是否收藏
        favorite = db.query(BlogFavorite).filter(
            BlogFavorite.blog_id == blog.id,
            BlogFavorite.user_id == current_user.id
        ).first()
        blog.is_favorited = favorite is not None
    
    logger.info(f"成功获取用户浏览历史: count={len(blogs)}")
    return blogs 