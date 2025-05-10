from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, blogs, comments, message, history

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(users.router, prefix="/users", tags=["用户"])
api_router.include_router(blogs.router, prefix="/blogs", tags=["博客"])
api_router.include_router(comments.router, prefix="/comments", tags=["评论"])
api_router.include_router(message.router, prefix="/messages", tags=["messages"])
api_router.include_router(history.router, prefix="/histories", tags=["histories"]) 