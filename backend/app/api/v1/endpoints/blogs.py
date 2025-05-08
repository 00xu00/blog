from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.models.blog import Blog
from app.models.interaction import BlogLike
from app.schemas.blog import BlogCreate, BlogUpdate, BlogInDB
from app.services import blog as blog_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=BlogInDB)
async def create_blog(
    request: Request,
    blog_in: BlogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新博客"""
    logger.info(f"收到创建博客请求: user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    try:
        blog = blog_service.create_blog(db, blog_in, current_user.id)
        logger.info(f"博客创建成功: id={blog.id}")
        return blog
    except Exception as e:
        logger.error(f"创建博客失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建博客失败: {str(e)}"
        )

@router.put("/{blog_id}", response_model=BlogInDB)
async def update_blog(
    request: Request,
    blog_id: int,
    blog_in: BlogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新博客"""
    logger.info(f"收到更新博客请求: blog_id={blog_id}, user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    db_blog = blog_service.update_blog(db, blog_id, blog_in, current_user.id)
    if not db_blog:
        logger.error(f"博客不存在或无权限修改: blog_id={blog_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在或无权限修改"
        )
    logger.info(f"博客更新成功: id={db_blog.id}")
    return db_blog

@router.get("/{blog_id}", response_model=BlogInDB)
async def get_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取博客详情"""
    logger.info(f"收到获取博客请求: blog_id={blog_id}")
    logger.info(f"请求头: {dict(request.headers)}")
    db_blog = blog_service.get_blog(db, blog_id)
    if not db_blog:
        logger.error(f"博客不存在: blog_id={blog_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )
    
    # 检查当前用户是否点赞
    is_liked = db.query(BlogLike).filter(
        BlogLike.blog_id == blog_id,
        BlogLike.user_id == current_user.id
    ).first() is not None
    
    db_blog.is_liked = is_liked
    
    logger.info(f"成功获取博客: id={db_blog.id}")
    return db_blog

@router.get("/user/me", response_model=List[BlogInDB])
async def get_user_blogs(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的博客列表"""
    logger.info(f"收到获取用户博客列表请求: user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    blogs = blog_service.get_user_blogs(db, current_user.id, skip, limit)
    logger.info(f"成功获取用户博客列表: count={len(blogs)}")
    return blogs

@router.delete("/{blog_id}")
async def delete_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除博客"""
    logger.info(f"收到删除博客请求: blog_id={blog_id}, user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    if not blog_service.delete_blog(db, blog_id, current_user.id):
        logger.error(f"博客不存在或无权限删除: blog_id={blog_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在或无权限删除"
        )
    logger.info(f"博客删除成功: id={blog_id}")
    return {"message": "删除成功"}

@router.post("/{blog_id}/like", response_model=BlogInDB)
async def like_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """点赞博客"""
    logger.info(f"收到点赞请求: blog_id={blog_id}, user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    
    # 检查博客是否存在
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )
    
    # 检查是否已经点赞
    existing_like = db.query(BlogLike).filter(
        BlogLike.blog_id == blog_id,
        BlogLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已经点赞过了"
        )
    
    # 创建点赞记录
    like = BlogLike(user_id=current_user.id, blog_id=blog_id)
    db.add(like)
    
    # 更新博客点赞数
    blog.likes_count += 1
    
    db.commit()
    db.refresh(blog)
    
    # 设置当前用户是否点赞
    blog.is_liked = True
    
    logger.info(f"点赞成功: blog_id={blog_id}, user_id={current_user.id}")
    return blog

@router.post("/{blog_id}/unlike", response_model=BlogInDB)
async def unlike_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """取消点赞博客"""
    logger.info(f"收到取消点赞请求: blog_id={blog_id}, user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    
    # 检查博客是否存在
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )
    
    # 检查是否已经点赞
    existing_like = db.query(BlogLike).filter(
        BlogLike.blog_id == blog_id,
        BlogLike.user_id == current_user.id
    ).first()
    
    if not existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="还没有点赞"
        )
    
    # 删除点赞记录
    db.delete(existing_like)
    
    # 更新博客点赞数
    blog.likes_count -= 1
    
    db.commit()
    db.refresh(blog)
    
    # 设置当前用户是否点赞
    blog.is_liked = False
    
    logger.info(f"取消点赞成功: blog_id={blog_id}, user_id={current_user.id}")
    return blog 