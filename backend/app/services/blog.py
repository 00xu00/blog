from sqlalchemy.orm import Session, joinedload
from app.models.blog import Blog
from app.schemas.blog import BlogCreate, BlogUpdate
from app.services.user import update_user_articles_count
from typing import List, Optional
import logging

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