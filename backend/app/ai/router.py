from fastapi import APIRouter

from app.ai.schemas import (ChatRequest,
                            ChatResponse,
                            RecommendationRequest,
                            RecommendationResponse,
                            ProviderMatchRequest,
                            ProviderMatchResponse,
                            ReviewSummaryRequest,
                            ReviewSummaryResponse,
)

from app.ai.service import AIService


router = APIRouter()
service = AIService()



@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    reply = await service.chat(request.message)

    return ChatResponse(reply=reply)

@router.post(
    "/service-recommendation",
    response_model=RecommendationResponse
)
async def recommend(request: RecommendationRequest):

    recommendation = await service.recommend_service(
        request.description
    )

    return RecommendationResponse(
        recommendation=recommendation
    )

@router.post(
    "/provider-match",
    response_model=ProviderMatchResponse,
)
async def provider(request: ProviderMatchRequest):

    result = await service.match_provider(
        request.user_request,
        [provider.model_dump() for provider in request.providers],
    )

    return ProviderMatchResponse(
        provider=result.provider,
        reason=result.reason,
    )

@router.post(
    "/review-summary",
    response_model=ReviewSummaryResponse
)
async def summary(request: ReviewSummaryRequest):

    summary = await service.summarize_reviews(
        request.reviews
    )

    return ReviewSummaryResponse(
        summary=summary
    )