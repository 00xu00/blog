import os
import aiohttp
from typing import List, Dict, Any
from loguru import logger
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.blog import Blog
from sqlalchemy import desc

DEEPSEEK_API_KEY = "sk-5917a900fb8b4246b4a3e449bc6c1275"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

class AIService:
    @staticmethod
    async def generate_writing_suggestions(topic: str) -> List[Dict[str, Any]]:
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                # 构建提示词
                prompt = f"""请为以下主题生成写作建议：
                主题：{topic}
                
                请提供：
                1. 文章大纲
                2. 相关代码示例（如果适用）
                3. 推荐的技术文档和参考资料
                
                请以结构化的方式返回。"""

                data = {
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                }

                async with session.post(DEEPSEEK_API_URL, headers=headers, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        content = result["choices"][0]["message"]["content"]
                        
                        # 解析AI返回的内容并格式化为结构化数据
                        suggestions = []
                        
                        # 解析大纲
                        if "大纲" in content:
                            outline_content = content.split("大纲")[1].split("代码示例")[0].strip()
                            suggestions.append({
                                "type": "outline",
                                "content": outline_content
                            })
                        
                        # 解析代码示例
                        if "代码示例" in content:
                            code_content = content.split("代码示例")[1].split("参考资料")[0].strip()
                            suggestions.append({
                                "type": "code",
                                "content": code_content
                            })
                        
                        # 解析参考资料
                        if "参考资料" in content:
                            doc_content = content.split("参考资料")[1].strip()
                            suggestions.append({
                                "type": "documentation",
                                "content": doc_content
                            })
                        
                        return suggestions
                    else:
                        logger.error(f"DeepSeek API error: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error generating writing suggestions: {str(e)}")
            return []

    @staticmethod
    async def get_recommended_articles() -> List[Dict[str, Any]]:
        try:
            db = next(get_db())
            # 获取最新的10篇已发布的文章，按创建时间排序
            articles = db.query(Blog).filter(Blog.is_published == 1).order_by(desc(Blog.created_at)).limit(10).all()
            
            # 转换为前端需要的格式
            recommended_articles = []
            for article in articles:
                # 获取文章标签
                tags = article.tags if article.tags else []
                
                # 获取文章副标题
                subtitle = article.subtitle if article.subtitle else ""
                
                recommended_articles.append({
                    "id": str(article.id),
                    "title": article.title,
                    "subtitle": subtitle,
                    "tags": tags,
                    "views": article.views_count,
                    "likes": article.likes_count,
                    "created_at": article.created_at.isoformat() if article.created_at else None,
                    "author": article.author.username if article.author else "未知作者"
                })
            
            return recommended_articles
        except Exception as e:
            logger.error(f"Error getting recommended articles: {str(e)}")
            return [] 