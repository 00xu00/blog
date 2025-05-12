from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenPayload(BaseModel):
    sub: Optional[str] = None  # 存储用户邮箱
    exp: Optional[int] = None  # 过期时间 