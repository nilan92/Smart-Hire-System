from datetime import datetime
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=2000)
    conversation_id: int | None = None
    use_mcp: bool = False

class RecommendedService(BaseModel):
    id: int
    title: str
    provider_name: str
    city: str
    price: float
    rating: float

class ChatResponse(BaseModel):
    conversation_id: int
    reply: str
    recommended_services: list[RecommendedService] | None = None

class RecommendationRequest(BaseModel):
    description: str = Field(min_length=3, max_length=1000)

class RecommendationResponse(BaseModel):
    category_id: int
    category_name: str
    reason: str
    services: list[RecommendedService]

class Provider(BaseModel):
    name: str
    service: str
    city: str
    rating: float
    experience: int

class ProviderMatchRequest(BaseModel):
    user_request: str = Field(min_length=3, max_length=1000)
    providers: list[Provider] = Field(default_factory=list)

class ProviderMatchResponse(BaseModel):
    provider: str
    reason: str

class ReviewSummaryRequest(BaseModel):
    service_id: int | None = None
    reviews: list[str] = Field(default_factory=list, max_length=100)

class ReviewSummaryResponse(BaseModel):
    service_id: int | None = None
    summary: str

class AIMessageResponse(BaseModel):
    id: int
    role: str
    message: str
    created_at: datetime

class ConversationResponse(BaseModel):
    id: int
    title: str
    updated_at: datetime

class ConversationDetailResponse(ConversationResponse):
    messages: list[AIMessageResponse]

class ConversationAnalytics(BaseModel):
    conversation_count: int
    message_count: int
    latest_conversation_at: datetime | None = None
