from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str



class ChatResponse(BaseModel):
    reply: str


class RecommendationRequest(BaseModel):
    description: str


class RecommendationResponse(BaseModel):
    recommendation: str


class ReviewSummaryResponse(BaseModel):
    summary: str