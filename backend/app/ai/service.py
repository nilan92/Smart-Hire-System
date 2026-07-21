import json
from datetime import datetime, timezone

from openai import OpenAI
from sqlalchemy.orm import Session

from app.ai.prompt import PROVIDER_SYSTEM_PROMPT, REVIEW_SUMMARY_PROMPT, SYSTEM_PROMPT
from app.ai.tools import TOOL_DEFINITIONS, execute_tool
from app.core.config import settings
from app.models.user import User

_MAX_TOOL_ROUNDS = 4


class AIService:
    """Backend-only OpenAI adapter with graceful local-demo fallbacks."""

    def __init__(self) -> None:
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def chat(
        self,
        message: str,
        history: list[dict[str, str]],
        categories: list[str],
        listings: list[str] | None = None,
        *,
        role: str = "customer",
        provider_context: str | None = None,
        my_bookings: list[str] | None = None,
        db: Session | None = None,
        current_user: User | None = None,
    ) -> str:
        if not self.client:
            return "I can help you find a service. Tell me what needs fixing and where you need it."
        try:
            now = datetime.now(timezone.utc)
            date_line = f"Right now it's {now.strftime('%A, %B %d, %Y, %H:%M')} UTC."

            if role == "provider":
                system = PROVIDER_SYSTEM_PROMPT
                context = f"{date_line}\n\n{provider_context or 'No account context available.'}"
            else:
                listings_block = "\n".join(f"- {item}" for item in listings) if listings else "(none currently active)"
                bookings_block = "\n".join(f"- {item}" for item in my_bookings) if my_bookings else "(no bookings yet)"
                system = SYSTEM_PROMPT
                context = (
                    f"{date_line}\n\n"
                    f"Available Smart Hire categories: {', '.join(categories) or 'not loaded'}.\n\n"
                    f"Available listings (service_id, provider_id, title - price - provider - city):\n{listings_block}\n\n"
                    f"Your bookings (booking_id, service, provider, date, status):\n{bookings_block}"
                )

            messages: list[dict] = [
                {"role": "system", "content": system + "\n\n" + context},
                *history[-10:],
                {"role": "user", "content": message},
            ]

            use_tools = role == "customer" and db is not None and current_user is not None

            for _ in range(_MAX_TOOL_ROUNDS):
                response = self.client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=messages,
                    tools=TOOL_DEFINITIONS if use_tools else None,
                )
                reply_message = response.choices[0].message

                if not reply_message.tool_calls:
                    return reply_message.content or "Could you share a little more detail?"

                messages.append(reply_message.model_dump(exclude_none=True))
                for call in reply_message.tool_calls:
                    try:
                        arguments = json.loads(call.function.arguments or "{}")
                    except json.JSONDecodeError:
                        arguments = {}
                    result = execute_tool(call.function.name, arguments, db, current_user)  # type: ignore[arg-type]
                    messages.append(
                        {"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)}
                    )

            return "I ran into some back-and-forth there — mind rephrasing what you'd like to do?"
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
