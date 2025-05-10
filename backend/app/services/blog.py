from sqlalchemy.orm import Session, joinedload
from app.models.blog import Blog
from app.models.history import History
from app.models.interaction import BlogLike, BlogFavorite
from app.schemas.blog import BlogCreate, BlogUpdate
from app.services.user import update_user_articles_count
from typing import List, Optional
import logging
from sqlalchemy.sql import func

logger = logging.getLogger(__name__)

def create_blog(db: Session, blog_in: BlogCreate, author_id: int) -> Blog:
    logger.info(f"创建新博客: title={blog_in.title}, author_id={author_id}")
    try:
        db_blog = Blog(
            title=blog_in.title,
            subtitle=blog_in.subtitle,
            content=blog_in.content,
            tags=blog_in.tags,
            author_id=author_id
        )
        db.add(db_blog)
        db.commit()
        db.refresh(db_blog)
        
        # 更新用户的文章数量
        update_user_articles_count(db, author_id)
        
        logger.info(f"博客创建成功: id={db_blog.id}")
        return db_blog
    except Exception as e:
        db.rollback()
        logger.error(f"创建博客失败: {str(e)}")
        raise

def update_blog(db: Session, blog_id: int, blog_in: BlogUpdate, author_id: int) -> Optional[Blog]:
    logger.info(f"更新博客: id={blog_id}, author_id={author_id}")
    try:
        db_blog = db.query(Blog).filter(Blog.id == blog_id, Blog.author_id == author_id).first()
        if not db_blog:
            return None
        
        update_data = blog_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_blog, field, value)
        
        db.commit()
        db.refresh(db_blog)
        logger.info(f"博客更新成功: id={db_blog.id}")
        return db_blog
    except Exception as e:
        db.rollback()
        logger.error(f"更新博客失败: {str(e)}")
        raise

def get_blog(db: Session, blog_id: int) -> Optional[Blog]:
    return db.query(Blog).options(joinedload(Blog.author)).filter(Blog.id == blog_id).first()

def get_user_blogs(db: Session, author_id: int, skip: int = 0, limit: int = 100) -> List[Blog]:
    return db.query(Blog).filter(Blog.author_id == author_id).offset(skip).limit(limit).all()

def delete_blog(db: Session, blog_id: int, author_id: int) -> bool:
    try:
        db_blog = db.query(Blog).filter(Blog.id == blog_id, Blog.author_id == author_id).first()
        if not db_blog:
            return False
        
        db.delete(db_blog)
        db.commit()
        
        # 更新用户的文章数量
        update_user_articles_count(db, author_id)
        
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"删除博客失败: {str(e)}")
        raise

def get_recommended_blogs(db: Session, user_id: int, limit: int = 10) -> List[Blog]:
    """获取个性化推荐的博客列表"""
    logger.info(f"获取个性化推荐博客: user_id={user_id}")
    
    # 1. 获取用户的浏览历史
    history_blogs = db.query(Blog).join(History).filter(
        History.user_id == user_id
    ).order_by(History.created_at.desc()).limit(10).all()
    logger.info(f"获取到浏览历史博客: {len(history_blogs)}篇")
    
    # 2. 获取用户点赞的博客
    liked_blogs = db.query(Blog).join(BlogLike).filter(
        BlogLike.user_id == user_id
    ).limit(10).all()
    logger.info(f"获取到点赞博客: {len(liked_blogs)}篇")
    
    # 3. 获取用户收藏的博客
    favorite_blogs = db.query(Blog).join(BlogFavorite).filter(
        BlogFavorite.user_id == user_id
    ).limit(10).all()
    logger.info(f"获取到收藏博客: {len(favorite_blogs)}篇")
    
    # 4. 收集所有相关博客的标签
    all_tags = set()
    for blog in history_blogs + liked_blogs + favorite_blogs:
        if blog.tags:
            all_tags.update(blog.tags)
    logger.info(f"收集到标签: {all_tags}")
    
    # 5. 基于用户行为推荐博客
    excluded_ids = [b.id for b in history_blogs + liked_blogs + favorite_blogs]
    logger.info(f"排除的博客ID: {excluded_ids}")
    
    # 如果没有排除的博客，直接返回最新的博客
    if not excluded_ids:
        recommended_blogs = db.query(Blog).filter(
            Blog.is_published == 1
        ).order_by(
            Blog.created_at.desc()
        ).limit(limit).all()
    else:
        recommended_blogs = db.query(Blog).filter(
            Blog.id.notin_(excluded_ids),
            Blog.is_published == 1
        ).order_by(
            Blog.likes_count.desc(),
            Blog.favorites_count.desc(),
            Blog.views_count.desc()
        ).limit(limit).all()
    
    logger.info(f"成功获取推荐博客: count={len(recommended_blogs)}")
    return recommended_blogs

def get_latest_blogs(db: Session, limit: int = 3) -> List[Blog]:
    """获取最新的博客列表"""
    logger.info(f"获取最新博客列表: limit={limit}")
    
    # 获取所有已发布的博客
    total_blogs = db.query(Blog).filter(Blog.is_published == 1).count()
    logger.info(f"数据库中已发布的博客总数: {total_blogs}")
    
    latest_blogs = db.query(Blog).filter(
        Blog.is_published == 1
    ).order_by(
        Blog.created_at.desc()
    ).limit(limit).all()
    
    logger.info(f"成功获取最新博客: count={len(latest_blogs)}")
    for blog in latest_blogs:
        logger.info(f"博客ID: {blog.id}, 标题: {blog.title}, 创建时间: {blog.created_at}")
    
    return latest_blogs 