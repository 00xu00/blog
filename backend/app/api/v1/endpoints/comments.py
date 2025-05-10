from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.schemas.comment import Comment, CommentCreate, CommentUpdate
from app.services import comment as comment_service
from app.models.user import User
from app.schemas.user import UserInDB

router = APIRouter()

@router.post("/", response_model=Comment)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新评论"""
    db_comment = comment_service.create_comment(db, comment, current_user.id)
    # 手动设置作者信息
    db_comment.author = current_user
    return db_comment

@router.get("/blog/{blog_id}", response_model=List[Comment])
def get_blog_comments(
    blog_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取博客的所有评论"""
    comments = comment_service.get_blog_comments(db, blog_id, skip, limit, current_user.id)
    # 为每个评论设置作者信息
    for comment in comments:
        comment.author = comment.author
    return comments

@router.get("/{comment_id}/replies", response_model=List[Comment])
def get_comment_replies(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取评论的回复"""
    replies = comment_service.get_comment_replies(db, comment_id, current_user.id)
    # 为每个回复设置作者信息
    for reply in replies:
        reply.author = reply.author
    return replies

@router.put("/{comment_id}", response_model=Comment)
def update_comment(
    comment_id: int,
    comment: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新评论"""
    db_comment = comment_service.update_comment(db, comment_id, comment, current_user.id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="评论不存在或无权修改")
    # 设置作者信息
    db_comment.author = current_user
    return db_comment

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除评论"""
    if not comment_service.delete_comment(db, comment_id, current_user.id):
        raise HTTPException(status_code=404, detail="评论不存在或无权删除")
    return {"message": "评论已删除"}

@router.post("/{comment_id}/like")
def like_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """点赞评论"""
    if not comment_service.like_comment(db, comment_id, current_user.id):
        raise HTTPException(status_code=400, detail="已经点赞过该评论")
    return {"message": "点赞成功"}

@router.delete("/{comment_id}/like")
def unlike_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """取消点赞评论"""
    if not comment_service.unlike_comment(db, comment_id, current_user.id):
        raise HTTPException(status_code=400, detail="还没有点赞该评论")
    return {"message": "取消点赞成功"} 