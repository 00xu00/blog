from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.models.interaction import CommentLike
from app.schemas.comment import CommentCreate, CommentUpdate
from typing import List, Optional
from app.schemas.user import UserInDB
from app.models.user import User

async def create_comment(db: Session, comment: CommentCreate, author_id: int) -> Comment:
    """创建新评论"""
    db_comment = Comment(
        content=comment.content,
        blog_id=comment.blog_id,
        author_id=author_id,
        parent_id=comment.parent_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # 获取作者信息
    author = db.query(User).filter(User.id == author_id).first()
    db_comment.author = author
    
    return db_comment

def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
    return db.query(Comment).filter(Comment.id == comment_id).first()

def get_blog_comments(db: Session, blog_id: int, skip: int = 0, limit: int = 100, current_user_id: Optional[int] = None) -> List[Comment]:
    # 获取所有主评论
    comments = db.query(Comment)\
        .filter(Comment.blog_id == blog_id, Comment.parent_id == None)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # 获取所有回复（包括多级回复）
    all_replies = db.query(Comment)\
        .filter(Comment.blog_id == blog_id, Comment.parent_id != None)\
        .all()
    
    # 构建回复映射
    reply_map = {}
    for reply in all_replies:
        if reply.parent_id not in reply_map:
            reply_map[reply.parent_id] = []
        reply_map[reply.parent_id].append(reply)
    
    # 递归设置回复
    def set_replies(comment):
        comment.replies = reply_map.get(comment.id, [])
        for reply in comment.replies:
            set_replies(reply)
    
    # 设置每个主评论的回复
    for comment in comments:
        set_replies(comment)
    
    # 设置评论的点赞状态
    if current_user_id:
        for comment in comments:
            # 检查主评论的点赞状态
            like = db.query(CommentLike).filter(
                CommentLike.comment_id == comment.id,
                CommentLike.user_id == current_user_id
            ).first()
            comment.is_liked = like is not None
            
            # 递归设置所有回复的点赞状态
            def set_like_status(comment):
                for reply in comment.replies:
                    reply_like = db.query(CommentLike).filter(
                        CommentLike.comment_id == reply.id,
                        CommentLike.user_id == current_user_id
                    ).first()
                    reply.is_liked = reply_like is not None
                    set_like_status(reply)
            
            set_like_status(comment)
    
    return comments

def get_comment_replies(db: Session, comment_id: int, current_user_id: Optional[int] = None) -> List[Comment]:
    # 获取所有回复（包括多级回复）
    all_replies = db.query(Comment)\
        .filter(Comment.parent_id == comment_id)\
        .all()
    
    # 构建回复映射
    reply_map = {}
    for reply in all_replies:
        if reply.parent_id not in reply_map:
            reply_map[reply.parent_id] = []
        reply_map[reply.parent_id].append(reply)
    
    # 递归设置回复
    def set_replies(comment):
        comment.replies = reply_map.get(comment.id, [])
        for reply in comment.replies:
            set_replies(reply)
    
    # 设置每个回复的回复
    for reply in all_replies:
        set_replies(reply)
    
    # 设置点赞状态
    if current_user_id:
        for reply in all_replies:
            like = db.query(CommentLike).filter(
                CommentLike.comment_id == reply.id,
                CommentLike.user_id == current_user_id
            ).first()
            reply.is_liked = like is not None
            
            # 递归设置所有子回复的点赞状态
            def set_like_status(comment):
                for reply in comment.replies:
                    reply_like = db.query(CommentLike).filter(
                        CommentLike.comment_id == reply.id,
                        CommentLike.user_id == current_user_id
                    ).first()
                    reply.is_liked = reply_like is not None
                    set_like_status(reply)
            
            set_like_status(reply)
    
    return all_replies

def update_comment(db: Session, comment_id: int, comment: CommentUpdate, author_id: int) -> Optional[Comment]:
    db_comment = db.query(Comment).filter(Comment.id == comment_id, Comment.author_id == author_id).first()
    if db_comment:
        for key, value in comment.dict(exclude_unset=True).items():
            setattr(db_comment, key, value)
        db.commit()
        db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int, author_id: int) -> bool:
    db_comment = db.query(Comment).filter(Comment.id == comment_id, Comment.author_id == author_id).first()
    if db_comment:
        db.delete(db_comment)
        db.commit()
        return True
    return False

def like_comment(db: Session, comment_id: int, user_id: int) -> bool:
    # 检查是否已经点赞
    existing_like = db.query(CommentLike).filter(
        CommentLike.comment_id == comment_id,
        CommentLike.user_id == user_id
    ).first()
    
    if existing_like:
        return False
    
    # 创建新的点赞
    db_like = CommentLike(comment_id=comment_id, user_id=user_id)
    db.add(db_like)
    
    # 更新评论的点赞数
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment:
        comment.likes_count += 1
    
    db.commit()
    return True

def unlike_comment(db: Session, comment_id: int, user_id: int) -> bool:
    # 查找点赞记录
    db_like = db.query(CommentLike).filter(
        CommentLike.comment_id == comment_id,
        CommentLike.user_id == user_id
    ).first()
    
    if not db_like:
        return False
    
    # 删除点赞记录
    db.delete(db_like)
    
    # 更新评论的点赞数
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment and comment.likes_count > 0:
        comment.likes_count -= 1
    
    db.commit()
    return True 