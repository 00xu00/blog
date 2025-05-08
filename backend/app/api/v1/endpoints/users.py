from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import UserInDB, UserUpdate
from app.services.user import get_user_by_id, update_user
import os
import shutil
from datetime import datetime
from typing import Optional
import base64

router = APIRouter()

@router.get("/me", response_model=UserInDB)
def read_user_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=UserInDB)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = update_user(db, current_user.id, user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user

@router.get("/{user_id}", response_model=UserInDB)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user

@router.post("/me/avatar", response_model=UserInDB)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 检查文件类型
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能上传图片文件"
        )
    
    try:
        # 读取文件内容
        contents = await file.read()
        
        # 将图片内容转换为BASE64
        base64_data = base64.b64encode(contents).decode('utf-8')
        
        # 构建完整的BASE64字符串（包含MIME类型）
        mime_type = file.content_type
        avatar_data = f"data:{mime_type};base64,{base64_data}"
        
        # 更新用户头像
        current_user.avatar = avatar_data
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"头像上传失败: {str(e)}"
        )
    finally:
        await file.close() 