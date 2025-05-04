from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    blogs: List['BlogResponse'] = []

    class Config:
        from_attributes = True

class BlogBase(BaseModel):
    title: str
    content: str

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: int
    created_at: datetime
    updated_at: datetime
    author_id: int
    author: UserResponse

    class Config:
        from_attributes = True

# 更新引用
UserResponse.update_forward_refs() 