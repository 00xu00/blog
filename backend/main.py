from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import blog, user, auth, db

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="曦景博客API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # 前端开发服务器地址
        "http://localhost:3001",  # 另一个前端开发服务器地址
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(user.router, prefix="/api/users", tags=["用户"])
app.include_router(blog.router, prefix="/api/blogs", tags=["博客"])
app.include_router(db.router, prefix="/api/db", tags=["数据库"])

@app.get("/")
async def root():
    return {"message": "欢迎使用曦景博客API"} 