from typing import List
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str



class ChatResponse(BaseModel):
    reply: str


class RecommendationRequest(BaseModel):
    description: str


class RecommendationResponse(BaseModel):
    recommendation: str


class ReviewSummaryRequest(BaseModel):
    reviews: List[str]

class ReviewSummaryResponse(BaseModel):
    summary: str

class Provider(BaseModel):
    name: str
    service: str
    city: str
    rating: float
    experience: int

class ProviderMatchAIResponse(BaseModel):
    provider: str
    reason: str


class ProviderMatchRequest(BaseModel):
    user_request: str
    providers: List[Provider]


class ProviderMatchResponse(BaseModel):
    provider: str
    reason: str