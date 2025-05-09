from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User, user_following
from app.schemas.user import UserInDB, UserUpdate
from app.services.user import get_user_by_id, update_user
import os
import shutil
from datetime import datetime
from typing import Optional
import base64
from sqlalchemy import select

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

@router.post("/{user_id}/follow")
def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能关注自己"
        )
    
    # 检查要关注的用户是否存在
    user_to_follow = get_user_by_id(db, user_id)
    if not user_to_follow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查是否已经关注
    stmt = select(user_following).where(
        user_following.c.follower_id == current_user.id,
        user_following.c.followed_id == user_id
    )
    result = db.execute(stmt).first()
    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已经关注该用户"
        )
    
    # 添加关注关系
    stmt = user_following.insert().values(
        follower_id=current_user.id,
        followed_id=user_id
    )
    db.execute(stmt)
    
    # 更新关注数和粉丝数
    current_user.following_count += 1
    user_to_follow.followers_count += 1
    
    db.commit()
    return {"message": "关注成功"}

@router.delete("/{user_id}/follow")
def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能取消关注自己"
        )
    
    # 检查要取消关注的用户是否存在
    user_to_unfollow = get_user_by_id(db, user_id)
    if not user_to_unfollow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查是否已经关注
    stmt = select(user_following).where(
        user_following.c.follower_id == current_user.id,
        user_following.c.followed_id == user_id
    )
    result = db.execute(stmt).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未关注该用户"
        )
    
    # 删除关注关系
    stmt = user_following.delete().where(
        user_following.c.follower_id == current_user.id,
        user_following.c.followed_id == user_id
    )
    db.execute(stmt)
    
    # 更新关注数和粉丝数
    current_user.following_count -= 1
    user_to_unfollow.followers_count -= 1
    
    db.commit()
    return {"message": "取消关注成功"}

@router.get("/{user_id}/is_following")
def check_following_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        return {"is_following": False}
    
    stmt = select(user_following).where(
        user_following.c.follower_id == current_user.id,
        user_following.c.followed_id == user_id
    )
    result = db.execute(stmt).first()
    return {"is_following": bool(result)} 