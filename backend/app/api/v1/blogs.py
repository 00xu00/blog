from typing import List
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from backend.database.models import Blog
from backend.database.database import get_db
from pydantic import BaseModel
from backend.schemas.blog import BlogResponse

class PaginatedResponse(BaseModel):
    data: List[BlogResponse]
    total: int

router = APIRouter()

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