from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.base import Base, engine
from app.api.v1 import api_router
from app.models import User, Blog  # 导入所有模型
import logging
import os

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建数据库表
logger.info("开始创建数据库表...")
Base.metadata.drop_all(bind=engine)  # 删除所有表
Base.metadata.create_all(bind=engine)  # 重新创建所有表
logger.info("数据库表创建完成")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置静态文件服务
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 注册路由
app.include_router(api_router, prefix=settings.API_V1_STR)

# 添加重定向路由
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def redirect_auth(path: str):
    return RedirectResponse(url=f"{settings.API_V1_STR}/auth/{path}")

@app.api_route("/api/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def redirect_users(path: str):
    return RedirectResponse(url=f"{settings.API_V1_STR}/users/{path}")

@app.get("/")
async def root():
    return {
        "message": "欢迎使用曦景博客API",
        "version": settings.VERSION
    } 