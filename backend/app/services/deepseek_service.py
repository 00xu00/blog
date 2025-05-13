import aiohttp
import asyncio
from typing import Dict, List

class DeepSeekService:
    def __init__(self):
        self.api_key = "sk-5917a900fb8b4246b4a3e449bc6c1275"
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def analyze_content(self, content: str) -> Dict:
        """分析文章内容并返回总结和标签"""
        prompt = f"""请分析以下文章内容，并完成以下任务：
1. 生成一个简短的总结（不超过200字）
2. 生成3-5个相关的标签（每个标签前加上'ai-'前缀）

文章内容：
{content}

请以JSON格式返回，格式如下：
{{
    "summary": "文章总结",
    "tags": ["ai-标签1", "ai-标签2", "ai-标签3"]
}}"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    headers=self.headers,
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7
                    }
                ) as response:
                    response.raise_for_status()
                    result = await response.json()
                    import json as pyjson
                    analysis = pyjson.loads(result['choices'][0]['message']['content'])
                    return analysis
        except Exception as e:
            print(f"DeepSeek API调用失败: {str(e)}")
            return {
                "summary": "AI分析失败，请稍后重试",
                "tags": ["ai-error"]
            } 