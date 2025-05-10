from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, blogs, comments, message, history

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(blogs.router, prefix="/blogs", tags=["blogs"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(message.router, prefix="/messages", tags=["messages"])
api_router.include_router(history.router, prefix="/histories", tags=["histories"]) 