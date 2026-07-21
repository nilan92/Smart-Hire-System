from openai import OpenAI

from app.ai.prompt import REVIEW_SUMMARY_PROMPT, SYSTEM_PROMPT
from app.core.config import settings


class AIService:
    """Backend-only OpenAI adapter with graceful local-demo fallbacks."""

    def __init__(self) -> None:
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def chat(self, message: str, history: list[dict[str, str]], categories: list[str]) -> str:
        if not self.client:
            return "I can help you find a service. Tell me what needs fixing and where you need it."
        try:
            context = (
                f"Available Smart Hire categories: {', '.join(categories) or 'not loaded'}. "
                "Do not invent providers, prices, availability, or bookings. To book, ask the customer "
                "to choose a recommendation and explicitly provide a future date and time. "
                "Keep answers focused on Smart Hire services."
            )
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "system", "content": SYSTEM_PROMPT + "\n" + context}, *history[-10:], {"role": "user", "content": message}],
            )
            return response.choices[0].message.content or "Could you share a little more detail?"
        except Exception:
            return "I could not reach the AI service right now. Please describe the issue, preferred location, and timing."

    def choose_category(self, request: str, categories: list[str]) -> tuple[str, str]:
        if self.client:
            try:
                prompt = f"Choose exactly one category from this list: {', '.join(categories)}. Customer request: {request}. Reply only with the category name."
                response = self.client.chat.completions.create(model="gpt-4.1-mini", messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}])
                choice = (response.choices[0].message.content or "").strip()
                matched = next((category for category in categories if category.lower() == choice.lower()), None)
                if matched:
                    return matched, "Matched your request to the most relevant available category."
            except Exception:
                pass
        words = set(request.lower().split())
        best = max(categories, key=lambda category: len(words.intersection(category.lower().split())))
        return best, "Matched your request to an available service category."

    def summarize_reviews(self, reviews: list[str]) -> str:
        if not reviews:
            return "There are no written reviews for this service yet."
        if self.client:
            try:
                prompt = REVIEW_SUMMARY_PROMPT.format(reviews="\n".join(f"- {review}" for review in reviews))
                response = self.client.chat.completions.create(model="gpt-4.1-mini", messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}])
                return response.choices[0].message.content or "Customers have shared feedback about this service."
            except Exception:
                pass
        return f"Based on {len(reviews)} review{'s' if len(reviews) != 1 else ''}, customers have shared feedback about the service experience."
