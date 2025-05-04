from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from jose import jwt, JWTError

from backend.database import get_db
from backend.models import Blog, User
from backend.schemas import BlogCreate, BlogResponse
from backend.routers.auth import oauth2_scheme, SECRET_KEY, ALGORITHM

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/", response_model=BlogResponse)
def create_blog(blog: BlogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_blog = Blog(
        title=blog.title,
        content=blog.content,
        author_id=current_user.id
    )
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.get("/", response_model=List[BlogResponse])
def read_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blogs = db.query(Blog).join(User).offset(skip).limit(limit).all()
    return blogs

@router.get("/{blog_id}", response_model=BlogResponse)
def read_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(Blog).join(User).filter(Blog.id == blog_id).first()
    if blog is None:
        raise HTTPException(status_code=404, detail="博客不存在")
    return blog

@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(blog_id: int, blog: BlogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if db_blog is None:
        raise HTTPException(status_code=404, detail="博客不存在")
    if db_blog.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="没有权限修改此博客")
    
    db_blog.title = blog.title
    db_blog.content = blog.content
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if db_blog is None:
        raise HTTPException(status_code=404, detail="博客不存在")
    if db_blog.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="没有权限删除此博客")
    
    db.delete(db_blog)
    db.commit()
    return {"message": "博客已删除"} 