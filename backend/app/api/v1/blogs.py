from typing import List
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.database.models import Blog, User, History, Like, Favorite
from backend.database.database import get_db
from backend.schemas.blog import BlogResponse
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

class PaginatedResponse(BaseModel):
    data: List[BlogResponse]
    total: int

@router.get("/recommended", response_model=List[BlogResponse])
def get_recommended_blogs(
    current_user_id: int = None,
    db: Session = Depends(get_db)
):
    """
    获取推荐文章列表，基于多因素推荐算法
    """
    try:
        # 获取最近7天的热门文章（基于浏览量）
        recent_hot_blogs = db.query(Blog).filter(
            Blog.is_published == 1,
            Blog.created_at >= datetime.now() - timedelta(days=7)
        ).order_by(desc(Blog.views_count)).limit(10).all()

        # 如果用户已登录，获取个性化推荐
        if current_user_id:
            # 获取用户的历史记录
            user_history = db.query(History).filter(
                History.user_id == current_user_id
            ).order_by(desc(History.created_at)).limit(10).all()
            
            # 获取用户点赞的文章
            user_likes = db.query(Like).filter(
                Like.user_id == current_user_id
            ).all()
            
            # 获取用户收藏的文章
            user_favorites = db.query(Favorite).filter(
                Favorite.user_id == current_user_id
            ).all()

            # 提取用户感兴趣的标签
            interested_tags = set()
            for history in user_history:
                if history.blog and history.blog.tags:
                    interested_tags.update(history.blog.tags)
            for like in user_likes:
                if like.blog and like.blog.tags:
                    interested_tags.update(like.blog.tags)
            for favorite in user_favorites:
                if favorite.blog and favorite.blog.tags:
                    interested_tags.update(favorite.blog.tags)

            # 基于用户兴趣标签推荐文章
            if interested_tags:
                tag_recommended_blogs = db.query(Blog).filter(
                    Blog.is_published == 1,
                    func.array_to_string(Blog.tags, ',').contains(','.join(interested_tags))
                ).order_by(desc(Blog.created_at)).limit(5).all()
            else:
                tag_recommended_blogs = []

            # 合并推荐结果
            recommended_blogs = list(set(tag_recommended_blogs + recent_hot_blogs))
            
            # 按综合得分排序（浏览量 * 0.4 + 点赞数 * 0.3 + 收藏数 * 0.3）
            recommended_blogs.sort(
                key=lambda x: (
                    x.views_count * 0.4 + 
                    x.likes_count * 0.3 + 
                    x.favorites_count * 0.3
                ),
                reverse=True
            )
            
            return recommended_blogs[:10]  # 返回前10篇推荐文章
        
        # 如果用户未登录，返回热门文章
        return recent_hot_blogs

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest", response_model=PaginatedResponse)
def get_latest_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    获取最新博客列表，支持分页
    """
    # 获取总数
    total = db.query(Blog).filter(Blog.is_published == 1).count()
    # 获取分页数据
    blogs = db.query(Blog).filter(Blog.is_published == 1).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()
    return {"data": blogs, "total": total} 