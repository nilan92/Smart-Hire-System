from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    reply: str


class RecommendationRequest(BaseModel):
    description: str


class RecommendationResponse(BaseModel):
    recommendation: str


class ReviewSummaryResponse(BaseModel):
    summary: str