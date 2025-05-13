from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.ai_service import AIService

router = APIRouter()

class TopicRequest(BaseModel):
    topic: str

@router.post("/generate-suggestions")
async def generate_suggestions(request: TopicRequest) -> List[Dict[str, Any]]:
    try:
        suggestions = await AIService.generate_writing_suggestions(request.topic)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommended-articles")
async def get_recommended_articles() -> List[Dict[str, Any]]:
    try:
        articles = await AIService.get_recommended_articles()
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 