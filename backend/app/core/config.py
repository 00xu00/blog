from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path
import secrets

# 定义默认密钥
DEFAULT_SECRET_KEY = "xijing-blog-secret-key-2024"

class Settings(BaseSettings):
    # 项目基础配置
    PROJECT_NAME: str = "曦景博客"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", DEFAULT_SECRET_KEY)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./blog.db"
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"  # 允许所有源（仅用于开发环境）
    ]
    
    # 文件上传配置
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    # 项目根目录
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    # 邮件配置
    SMTP_HOST: str = "smtp.qq.com"
    SMTP_PORT: int = 465
    SMTP_USERNAME: str = "2023654801@qq.com"
    SMTP_PASSWORD: str = "pkdzyptbrjrebaae"  # QQ邮箱授权码
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 