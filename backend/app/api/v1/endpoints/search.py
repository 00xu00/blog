from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core import deps
from app.models.search_history import SearchHistory
from app.schemas.search_history import SearchHistoryCreate, SearchHistoryInDB
from app.models.blog import Blog
from sqlalchemy import or_, and_, func
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=List[SearchHistoryInDB])
def create_search_history(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_optional),
    search: SearchHistoryCreate
):
    """
    创建搜索历史记录
    """
    if not current_user:
        raise HTTPException(
            status_code=403,
            detail="需要登录才能保存搜索历史"
        )
    
    logger.info(f"创建搜索历史记录: user_id={current_user.id}, keyword={search.keyword}")
    
    try:
        # 查找是否存在相同关键词的历史记录
        existing_search = db.query(SearchHistory).filter(
            and_(
                SearchHistory.user_id == current_user.id,
                SearchHistory.keyword == search.keyword
            )
        ).first()
        
        if existing_search:
            # 如果存在，更新创建时间
            existing_search.created_at = datetime.utcnow()
            db_search = existing_search
        else:
            # 如果不存在，创建新记录
            db_search = SearchHistory(
                user_id=current_user.id,
                keyword=search.keyword
            )
            db.add(db_search)
        
        # 删除旧的搜索历史，只保留最新的100条
        old_searches = db.query(SearchHistory).filter(
            SearchHistory.user_id == current_user.id
        ).order_by(SearchHistory.created_at.desc()).offset(100).all()
        
        for old_search in old_searches:
            db.delete(old_search)
        
        db.commit()
        db.refresh(db_search)
        logger.info(f"搜索历史记录创建成功: id={db_search.id}")
        return [db_search]
    except Exception as e:
        logger.error(f"保存搜索历史记录失败: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="保存搜索历史失败")

@router.get("/history", response_model=List[SearchHistoryInDB])
def get_search_history(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_optional),
    limit: int = Query(10, ge=1, le=100)
):
    """
    获取用户的搜索历史
    """
    if not current_user:
        logger.info("未登录用户访问搜索历史")
        return []
    
    logger.info(f"获取用户搜索历史: user_id={current_user.id}, limit={limit}")
    
    try:
        searches = db.query(SearchHistory).filter(
            SearchHistory.user_id == current_user.id
        ).order_by(SearchHistory.created_at.desc()).limit(limit).all()
        
        logger.info(f"找到 {len(searches)} 条搜索历史记录")
        return searches
    except Exception as e:
        logger.error(f"获取搜索历史失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取搜索历史失败")

@router.get("/blogs", response_model=List[dict])
def search_blogs(
    *,
    db: Session = Depends(deps.get_db),
    keyword: str = Query(..., min_length=1),
    current_user = Depends(deps.get_current_user_optional)
):
    """
    搜索博客文章
    """
    logger.info(f"搜索博客: keyword={keyword}, user_id={current_user.id if current_user else None}")
    
    # 构建搜索查询
    query = db.query(Blog).filter(
        Blog.is_published == 1,
        or_(
            Blog.title.ilike(f"%{keyword}%"),
            Blog.subtitle.ilike(f"%{keyword}%"),
            Blog.content.ilike(f"%{keyword}%")
        )
    ).order_by(Blog.created_at.desc())
    
    # 如果用户已登录，记录搜索历史
    if current_user:
        try:
            # 查找是否存在相同关键词的历史记录
            existing_search = db.query(SearchHistory).filter(
                and_(
                    SearchHistory.user_id == current_user.id,
                    SearchHistory.keyword == keyword
                )
            ).first()
            
            if existing_search:
                # 如果存在，更新创建时间
                existing_search.created_at = datetime.utcnow()
            else:
                # 如果不存在，创建新记录
                db_search = SearchHistory(
                    user_id=current_user.id,
                    keyword=keyword
                )
                db.add(db_search)
            
            # 删除旧的搜索历史，只保留最新的100条
            old_searches = db.query(SearchHistory).filter(
                SearchHistory.user_id == current_user.id
            ).order_by(SearchHistory.created_at.desc()).offset(100).all()
            
            for old_search in old_searches:
                db.delete(old_search)
            
            db.commit()
            logger.info(f"搜索历史记录保存成功: user_id={current_user.id}, keyword={keyword}")
        except Exception as e:
            logger.error(f"保存搜索历史失败: {str(e)}")
            db.rollback()
    
    # 执行搜索
    try:
        blogs = query.all()
        logger.info(f"找到 {len(blogs)} 条博客")
        
        # 构建返回结果
        result = []
        for blog in blogs:
            blog_dict = {
                "id": blog.id,
                "title": blog.title,
                "subtitle": blog.subtitle,
                "content": blog.content[:200] + "..." if len(blog.content) > 200 else blog.content,
                "author": {
                    "id": blog.author.id,
                    "username": blog.author.username,
                    "avatar": blog.author.avatar
                },
                "created_at": blog.created_at,
                "likes_count": blog.likes_count,
                "favorites_count": blog.favorites_count,
                "views_count": blog.views_count
            }
            result.append(blog_dict)
        
        return result
    except Exception as e:
        logger.error(f"搜索博客失败: {str(e)}")
        raise HTTPException(status_code=500, detail="搜索博客失败") 