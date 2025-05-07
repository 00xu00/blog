from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
import re

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")

    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('用户名只能包含字母、数字和下划线')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=50, description="密码")

    @validator('password')
    def password_strength(cls, v):
        errors = []
        if not re.search(r'[A-Z]', v):
            errors.append("大写字母")
        if not re.search(r'[a-z]', v):
            errors.append("小写字母")
        if not re.search(r'\d', v):
            errors.append("数字")
        if errors:
            raise ValueError(f"密码必须包含{', '.join(errors)}")
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=50)
    avatar: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)

class UserInDB(UserBase):
    id: int
    avatar: Optional[str] = None
    bio: Optional[str] = None
    following_count: int = 0
    followers_count: int = 0
    articles_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None 