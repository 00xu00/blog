from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserInDB

class CommentBase(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    blog_id: int

class CommentUpdate(CommentBase):
    pass

class CommentInDB(CommentBase):
    id: int
    blog_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0

    class Config:
        from_attributes = True

class Comment(CommentInDB):
    author: UserInDB
    replies: List['Comment'] = []
    is_liked: bool = False

    class Config:
        from_attributes = True 