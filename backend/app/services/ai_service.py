import os
import aiohttp
from typing import List, Dict, Any
from loguru import logger

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
        # 这里可以实现文章推荐逻辑
        # 目前返回模拟数据
        return [
            {
                "id": "1",
                "title": "React Hooks 最佳实践",
                "description": "深入探讨React Hooks的使用技巧和最佳实践，包括useState、useEffect、useContext等核心Hook的使用方法。",
                "tags": ["React", "Hooks", "前端"],
                "views": 1234,
                "likes": 89
            },
            {
                "id": "2",
                "title": "TypeScript 类型系统详解",
                "description": "全面解析TypeScript的类型系统和高级特性，帮助你写出更健壮的代码。",
                "tags": ["TypeScript", "类型系统"],
                "views": 2345,
                "likes": 156
            }
        ] 