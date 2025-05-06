from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
import json
from datetime import datetime

from backend.database import get_db
from backend.models import Blog, User
from backend.schemas import BlogCreate, BlogResponse
from backend.routers.auth import oauth2_scheme, get_current_user

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=BlogResponse)
def create_blog(blog: BlogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("=== 开始创建博客 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"创建者: ID={current_user.id}, 用户名={current_user.username}")
    logger.info(f"博客标题: {blog.title}")
    
    db_blog = Blog(
        title=blog.title,
        content=blog.content,
        author_id=current_user.id
    )
    try:
        db.add(db_blog)
        db.commit()
        db.refresh(db_blog)
        logger.info(f"博客创建成功: ID={db_blog.id}, 标题={db_blog.title}")
        logger.info("=== 博客创建完成 ===")
        return db_blog
    except Exception as e:
        logger.error("=== 创建博客时发生错误 ===")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误信息: {str(e)}")
        logger.error("详细错误信息:", exc_info=True)
        logger.error("=== 错误详情结束 ===")
        
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建博客失败"
        )

@router.get("/", response_model=List[BlogResponse])
def read_blogs(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    logger.info("=== 开始获取博客列表 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"分页参数: skip={skip}, limit={limit}")
    
    blogs = db.query(Blog).offset(skip).limit(limit).all()
    logger.info(f"成功获取博客列表，共 {len(blogs)} 条记录")
    logger.info("=== 博客列表获取完成 ===")
    return blogs

@router.get("/{blog_id}", response_model=BlogResponse)
def read_blog(blog_id: int, db: Session = Depends(get_db)):
    logger.info("=== 开始获取指定博客 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"博客ID: {blog_id}")
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog is None:
        logger.warning(f"博客不存在: ID={blog_id}")
        raise HTTPException(status_code=404, detail="博客不存在")
    
    logger.info(f"成功获取博客: ID={blog.id}, 标题={blog.title}")
    logger.info("=== 博客获取完成 ===")
    return blog

@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(blog_id: int, blog: BlogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("=== 开始更新博客 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"博客ID: {blog_id}")
    logger.info(f"更新者: ID={current_user.id}, 用户名={current_user.username}")
    logger.info(f"更新内容: 标题={blog.title}")
    
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if db_blog is None:
        logger.warning(f"博客不存在: ID={blog_id}")
        raise HTTPException(status_code=404, detail="博客不存在")
    
    if db_blog.author_id != current_user.id:
        logger.warning(f"权限不足: 用户ID={current_user.id} 尝试修改博客ID={blog_id}")
        raise HTTPException(status_code=403, detail="没有权限修改此博客")
    
    try:
        db_blog.title = blog.title
        db_blog.content = blog.content
        db.commit()
        db.refresh(db_blog)
        logger.info(f"博客更新成功: ID={db_blog.id}, 标题={db_blog.title}")
        logger.info("=== 博客更新完成 ===")
        return db_blog
    except Exception as e:
        logger.error("=== 更新博客时发生错误 ===")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误信息: {str(e)}")
        logger.error("详细错误信息:", exc_info=True)
        logger.error("=== 错误详情结束 ===")
        
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新博客失败"
        )

@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("=== 开始删除博客 ===")
    logger.info(f"请求时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"博客ID: {blog_id}")
    logger.info(f"删除者: ID={current_user.id}, 用户名={current_user.username}")
    
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if db_blog is None:
        logger.warning(f"博客不存在: ID={blog_id}")
        raise HTTPException(status_code=404, detail="博客不存在")
    
    if db_blog.author_id != current_user.id:
        logger.warning(f"权限不足: 用户ID={current_user.id} 尝试删除博客ID={blog_id}")
        raise HTTPException(status_code=403, detail="没有权限删除此博客")
    
    try:
        db.delete(db_blog)
        db.commit()
        logger.info(f"博客删除成功: ID={blog_id}")
        logger.info("=== 博客删除完成 ===")
        return {"message": "博客已删除"}
    except Exception as e:
        logger.error("=== 删除博客时发生错误 ===")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误信息: {str(e)}")
        logger.error("详细错误信息:", exc_info=True)
        logger.error("=== 错误详情结束 ===")
        
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除博客失败"
        ) 