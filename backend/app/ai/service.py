from openai import OpenAI
from app.ai.schemas import ProviderMatchAIResponse
from app.core.config import settings
from app.ai.prompt import (SYSTEM_PROMPT,SERVICE_RECOMMENDATION_PROMPT,PROVIDER_MATCH_PROMPT,REVIEW_SUMMARY_PROMPT)
import json

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

    async def recommend_service(self, description: str):
        try:
            prompt = SERVICE_RECOMMENDATION_PROMPT.format(
                user_request=description
            )

            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return response.choices[0].message.content

        except Exception as e:
            return str(e)

    async def match_provider(self, request: str, providers: list):

        provider_text = json.dumps(
            providers,
            indent=2
        )

        prompt = PROVIDER_MATCH_PROMPT.format(
            request=request,
            providers=provider_text
        )

        response = self.client.responses.parse(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            text_format=ProviderMatchAIResponse,
        )

        return response.output_parsed

    async def summarize_reviews(self, reviews: list[str]):

        review_text = "\n".join(
            f"- {review}"
            for review in reviews
        )

        prompt = REVIEW_SUMMARY_PROMPT.format(
            reviews=review_text
        )

        response = self.client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content