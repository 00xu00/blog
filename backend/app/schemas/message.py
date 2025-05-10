from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserInDB

class MessageBase(BaseModel):
    content: str
    receiver_id: int

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    is_read: bool
    created_at: datetime
    sender: UserInDB

    class Config:
        from_attributes = True 