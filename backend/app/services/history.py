from sqlalchemy.orm import Session
from app.models.history import History
from app.models.blog import Blog
from typing import List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def add_history(db: Session, user_id: int, blog_id: int) -> History:
    """添加浏览历史"""
    logger.info(f"添加浏览历史: user_id={user_id}, blog_id={blog_id}")
    
    # 检查是否已存在相同的历史记录
    existing_history = db.query(History).filter(
        History.user_id == user_id,
        History.blog_id == blog_id
    ).first()
    
    if existing_history:
        # 如果存在，更新创建时间
        existing_history.created_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_history)
        logger.info(f"更新已存在的浏览历史: id={existing_history.id}")
        return existing_history
    
    # 创建新的历史记录
    history = History(
        user_id=user_id,
        blog_id=blog_id
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    logger.info(f"创建新的浏览历史: id={history.id}")
    return history

def get_user_histories(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Blog]:
    """获取用户的浏览历史"""
    logger.info(f"获取用户浏览历史: user_id={user_id}")
    
    # 获取历史记录关联的博客
    blogs = db.query(Blog).join(History).filter(
        History.user_id == user_id
    ).order_by(
        History.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    logger.info(f"成功获取用户浏览历史: count={len(blogs)}")
    return blogs 