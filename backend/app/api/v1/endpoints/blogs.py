from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.models.blog import Blog
from app.models.interaction import BlogLike, BlogFavorite
from app.schemas.blog import BlogCreate, BlogUpdate, BlogInDB
from app.services import blog as blog_service
from app.services.deepseek_service import DeepSeekService
from app.services import comment as comment_service
import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from app.services import history as history_service

logger = logging.getLogger(__name__)
router = APIRouter()

# 用于存储最近访问记录的字典
recent_views = {}

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
        # 创建博客
        blog = blog_service.create_blog(db, blog_in, current_user.id)
        logger.info(f"博客创建成功: id={blog.id}")

        # 如果是发布状态，进行AI分析
        if blog_in.is_published:
            try:
                # 初始化DeepSeek服务
                deepseek_service = DeepSeekService()
                
                # 分析文章内容
                analysis = await deepseek_service.analyze_content(blog.content)
                
                # 添加AI生成的标签
                if analysis.get("tags"):
                    blog.tags = blog.tags or []
                    blog.tags.extend(analysis["tags"])
                    db.commit()
                    db.refresh(blog)
                
                # 创建AI评论
                if analysis.get("summary"):
                    comment_data = {
                        "content": f"AI助手总结：\n\n{analysis['summary']}",
                        "blog_id": blog.id
                    }
                    await comment_service.create_comment(db, comment_data, current_user.id)
                
                logger.info(f"AI分析完成: blog_id={blog.id}")
            except Exception as e:
                logger.error(f"AI分析失败: {str(e)}")
                # AI分析失败不影响博客发布
        
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

@router.get("/recommended", response_model=List[BlogInDB])
async def get_recommended_blogs(
    request: Request,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取个性化推荐的博客列表"""
    logger.info(f"收到获取推荐博客请求: user_id={current_user.id}")
    
    blogs = blog_service.get_recommended_blogs(db, current_user.id, limit)
    
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
    
    logger.info(f"成功返回推荐博客: count={len(blogs)}")
    return blogs

@router.get("/latest", response_model=List[BlogInDB])
async def get_latest_blogs(
    request: Request,
    limit: int = 3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取最新的博客列表"""
    logger.info(f"收到获取最新博客请求: user_id={current_user.id}")
    
    blogs = blog_service.get_latest_blogs(db, limit)
    
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
    
    logger.info(f"成功返回最新博客: count={len(blogs)}")
    return blogs

@router.get("/{blog_id}", response_model=BlogInDB)
async def get_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取博客详情"""
    logger.info(f"收到获取博客详情请求: blog_id={blog_id}, user_id={current_user.id}")
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )
    
    # 获取客户端IP
    client_ip = request.client.host
    
    # 生成访问记录的唯一键
    view_key = f"{blog_id}_{client_ip}"
    
    # 检查是否在1秒内已经访问过
    current_time = datetime.utcnow()
    if view_key in recent_views:
        last_view_time = recent_views[view_key]
        if current_time - last_view_time < timedelta(seconds=1):
            logger.info(f"忽略重复访问: blog_id={blog_id}, user_id={current_user.id}")
        else:
            # 更新访问时间并增加浏览量
            recent_views[view_key] = current_time
            blog.views_count += 1
            db.commit()
            db.refresh(blog)
            logger.info(f"增加浏览量: blog_id={blog_id}, views_count={blog.views_count}")
    else:
        # 首次访问，记录时间并增加浏览量
        recent_views[view_key] = current_time
        blog.views_count += 1
        db.commit()
        db.refresh(blog)
        logger.info(f"增加浏览量: blog_id={blog_id}, views_count={blog.views_count}")
    
    # 添加浏览历史
    history_service.add_history(db, current_user.id, blog_id)
    
    # 检查当前用户是否点赞
    like = db.query(BlogLike).filter(
        BlogLike.blog_id == blog_id,
        BlogLike.user_id == current_user.id
    ).first()
    blog.is_liked = like is not None
    
    # 检查当前用户是否收藏
    favorite = db.query(BlogFavorite).filter(
        BlogFavorite.blog_id == blog_id,
        BlogFavorite.user_id == current_user.id
    ).first()
    blog.is_favorited = favorite is not None

    # 检查当前用户是否关注了作者
    is_following = False
    if blog.author_id != current_user.id:
        follow_row = db.execute(
            text("""
                SELECT 1 FROM user_following WHERE follower_id = :follower_id AND followed_id = :followed_id
            """),
            {"follower_id": current_user.id, "followed_id": blog.author_id}
        ).first()
        is_following = follow_row is not None

    # 将is_following加到author对象
    if hasattr(blog, 'author') and blog.author:
        blog.author.is_following = is_following

    logger.info(f"获取博客详情成功: blog_id={blog_id}, user_id={current_user.id}")
    return blog

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

@router.get("/user/{user_id}", response_model=List[BlogInDB])
async def get_other_user_blogs(
    request: Request,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取指定用户的博客列表"""
    logger.info(f"收到获取其他用户博客列表请求: user_id={user_id}, current_user_id={current_user.id}")
    
    # 获取指定用户的博客
    blogs = blog_service.get_user_blogs(db, user_id, skip, limit)
    
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
    
    logger.info(f"成功获取其他用户博客列表: count={len(blogs)}")
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

@router.post("/{blog_id}/favorite", response_model=BlogInDB)
async def favorite_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """收藏博客"""
    logger.info(f"收到收藏请求: blog_id={blog_id}, user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    
    # 检查博客是否存在
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )
    
    # 检查是否已经收藏
    existing_favorite = db.query(BlogFavorite).filter(
        BlogFavorite.blog_id == blog_id,
        BlogFavorite.user_id == current_user.id
    ).first()
    
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已经收藏过了"
        )
    
    # 创建收藏记录
    favorite = BlogFavorite(user_id=current_user.id, blog_id=blog_id)
    db.add(favorite)
    
    # 更新博客收藏数
    blog.favorites_count += 1
    
    db.commit()
    db.refresh(blog)
    
    # 设置当前用户是否收藏
    blog.is_favorited = True
    
    logger.info(f"收藏成功: blog_id={blog_id}, user_id={current_user.id}")
    return blog

@router.post("/{blog_id}/unfavorite", response_model=BlogInDB)
async def unfavorite_blog(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """取消收藏博客"""
    logger.info(f"收到取消收藏请求: blog_id={blog_id}, user_id={current_user.id}")
    logger.info(f"请求头: {dict(request.headers)}")
    
    # 检查博客是否存在
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="博客不存在"
        )
    
    # 检查是否已经收藏
    existing_favorite = db.query(BlogFavorite).filter(
        BlogFavorite.blog_id == blog_id,
        BlogFavorite.user_id == current_user.id
    ).first()
    
    if not existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="还没有收藏"
        )
    
    # 删除收藏记录
    db.delete(existing_favorite)
    
    # 更新博客收藏数
    blog.favorites_count -= 1
    
    db.commit()
    db.refresh(blog)
    
    # 设置当前用户是否收藏
    blog.is_favorited = False
    
    logger.info(f"取消收藏成功: blog_id={blog_id}, user_id={current_user.id}")
    return blog

@router.get("/user/me/likes", response_model=List[BlogInDB])
async def get_user_liked_blogs(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户点赞的博客列表"""
    logger.info(f"收到获取用户点赞博客列表请求: user_id={current_user.id}")
    
    # 获取用户点赞的博客ID列表
    liked_blog_ids = db.query(BlogLike.blog_id).filter(
        BlogLike.user_id == current_user.id
    ).all()
    liked_blog_ids = [id[0] for id in liked_blog_ids]
    
    # 获取博客详情
    blogs = db.query(Blog).filter(
        Blog.id.in_(liked_blog_ids)
    ).offset(skip).limit(limit).all()
    
    # 设置点赞和收藏状态
    for blog in blogs:
        blog.is_liked = True
        favorite = db.query(BlogFavorite).filter(
            BlogFavorite.blog_id == blog.id,
            BlogFavorite.user_id == current_user.id
        ).first()
        blog.is_favorited = favorite is not None
    
    logger.info(f"成功获取用户点赞博客列表: count={len(blogs)}")
    return blogs

@router.get("/user/me/favorites", response_model=List[BlogInDB])
async def get_user_favorite_blogs(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户收藏的博客列表"""
    logger.info(f"收到获取用户收藏博客列表请求: user_id={current_user.id}")
    
    # 获取用户收藏的博客ID列表
    favorite_blog_ids = db.query(BlogFavorite.blog_id).filter(
        BlogFavorite.user_id == current_user.id
    ).all()
    favorite_blog_ids = [id[0] for id in favorite_blog_ids]
    
    # 获取博客详情
    blogs = db.query(Blog).filter(
        Blog.id.in_(favorite_blog_ids)
    ).offset(skip).limit(limit).all()
    
    # 设置点赞和收藏状态
    for blog in blogs:
        like = db.query(BlogLike).filter(
            BlogLike.blog_id == blog.id,
            BlogLike.user_id == current_user.id
        ).first()
        blog.is_liked = like is not None
        blog.is_favorited = True
    
    logger.info(f"成功获取用户收藏博客列表: count={len(blogs)}")
    return blogs

@router.get("/user/me/draft", response_model=BlogInDB)
async def get_user_draft_blog(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户最新的草稿博客"""
    logger.info(f"收到获取用户草稿博客请求: user_id={current_user.id}")
    
    draft_blog = blog_service.get_user_draft_blog(db, current_user.id)
    if not draft_blog:
        # 返回一个有效的空博客对象
        return BlogInDB(
            id=0,
            title="新博客",  # 设置一个默认标题
            subtitle="",
            content="",
            tags=[],
            author_id=current_user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_published=0,
            likes_count=0,
            favorites_count=0,
            views_count=0,
            is_liked=False,
            is_favorited=False,
            comments_count=0,
            author=current_user
        )
    
    logger.info(f"成功获取用户草稿博客: id={draft_blog.id}")
    return draft_blog 