from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .user import UserInDB

class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    subtitle: Optional[str] = Field(None, max_length=200)
    content: str = Field(...)
    tags: List[str] = Field(default_factory=list)

class BlogCreate(BlogBase):
    is_published: int = Field(default=0)  # 0: 草稿, 1: 已发布

class BlogUpdate(BlogBase):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = None
    is_published: Optional[int] = None

class BlogInDB(BlogBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    is_published: int
    likes_count: int = 0
    favorites_count: int = 0
    views_count: int = 0
    is_liked: bool = False
    is_favorited: bool = False
    comments_count: int = 0
    author: UserInDB

    class Config:
        from_attributes = True 