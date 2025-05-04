from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from backend.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/test")
async def test_db_connection(db: Session = Depends(get_db)):
    try:
        # 执行一个简单的SQL查询来测试连接
        result = db.execute(text("SELECT 1"))
        logger.info("数据库连接测试成功")
        return {"status": "success", "message": "数据库连接正常"}
    except Exception as e:
        logger.error(f"数据库连接测试失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"数据库连接错误: {str(e)}") 