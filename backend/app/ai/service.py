from openai import OpenAI
from app.core.config import settings
from app.ai.prompt import SYSTEM_PROMPT


class AIService:

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def chat(self, message: str):
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content":SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            )

            return response.choices[0].message.content

        except Exception as e:
            return str(e)

    async def recommend_service(self):
        pass

    async def match_provider(self):
        pass

    async def summarize_reviews(self):
        pass