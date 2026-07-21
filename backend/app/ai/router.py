from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.ai.schemas import AIMessageResponse, ChatRequest, ChatResponse, ConversationAnalytics, ConversationDetailResponse, ConversationResponse, ProviderMatchRequest, ProviderMatchResponse, RecommendationRequest, RecommendationResponse, RecommendedService, ReviewSummaryRequest, ReviewSummaryResponse
from app.ai.service import AIService
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_active_user, require_roles
from app.models.ai_conversation import AIConversation
from app.models.ai_message import AIMessage
from app.models.review import Review
from app.models.review_summary import ReviewSummary
from app.models.service import Service, ServiceStatus
from app.models.service_category import ServiceCategory
from app.models.user import User, UserRole

router = APIRouter()
service = AIService()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, user: User = Depends(require_active_user), db: Session = Depends(get_db)):
    conversation = db.get(AIConversation, request.conversation_id) if request.conversation_id else None
    if conversation and conversation.user_id != user.id: raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation is None:
        conversation = AIConversation(user_id=user.id, title=request.message[:80]); db.add(conversation); db.flush()
    history = [
        {"role": message.role, "content": message.message}
        for message in db.scalars(select(AIMessage).where(AIMessage.conversation_id == conversation.id).order_by(AIMessage.created_at.desc()).limit(10)).all()[::-1]
        if message.role in {"user", "assistant"}
    ]
    categories = list(db.scalars(select(ServiceCategory.name).order_by(ServiceCategory.name)).all())
    active_services = db.scalars(
        select(Service)
        .options(joinedload(Service.provider))
        .where(Service.status == ServiceStatus.ACTIVE)
        .order_by(Service.created_at.desc())
        .limit(40)
    ).unique().all()
    listings = [
        f"{s.title} - LKR {s.price:g} - {s.provider.full_name} - {s.city}"
        for s in active_services
    ]
    db.add(AIMessage(conversation_id=conversation.id, role="user", message=request.message))
    reply = service.chat(request.message, history, categories, listings)
    db.add(AIMessage(conversation_id=conversation.id, role="assistant", message=reply))
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    return ChatResponse(conversation_id=conversation.id, reply=reply)

@router.get("/conversations", response_model=list[ConversationResponse])
def conversations(user: User = Depends(require_active_user), db: Session = Depends(get_db)):
    return [ConversationResponse(id=x.id, title=x.title, updated_at=x.updated_at) for x in db.scalars(select(AIConversation).where(AIConversation.user_id == user.id).order_by(AIConversation.updated_at.desc())).all()]

@router.get("/conversations/analysis", response_model=ConversationAnalytics)
def conversation_analysis(user: User = Depends(require_active_user), db: Session = Depends(get_db)):
    conversation_count = db.scalar(select(func.count(AIConversation.id)).where(AIConversation.user_id == user.id)) or 0
    message_count = db.scalar(select(func.count(AIMessage.id)).join(AIConversation).where(AIConversation.user_id == user.id)) or 0
    latest = db.scalar(select(func.max(AIConversation.updated_at)).where(AIConversation.user_id == user.id))
    return ConversationAnalytics(conversation_count=conversation_count, message_count=message_count, latest_conversation_at=latest)

@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def conversation(conversation_id: int, user: User = Depends(require_active_user), db: Session = Depends(get_db)):
    item = db.scalar(select(AIConversation).options(joinedload(AIConversation.messages)).where(AIConversation.id == conversation_id, AIConversation.user_id == user.id))
    if not item: raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationDetailResponse(id=item.id, title=item.title, updated_at=item.updated_at, messages=[AIMessageResponse(id=m.id, role=m.role, message=m.message, created_at=m.created_at) for m in item.messages])

@router.post("/recommend", response_model=RecommendationResponse)
@router.post("/service-recommendation", response_model=RecommendationResponse, include_in_schema=False)
def recommend(request: RecommendationRequest, _: User = Depends(require_active_user), db: Session = Depends(get_db)):
    categories = db.scalars(select(ServiceCategory).order_by(ServiceCategory.name)).all()
    if not categories: raise HTTPException(status_code=503, detail="Service categories are not available yet")
    name, reason = service.choose_category(request.description, [x.name for x in categories])
    category = next(x for x in categories if x.name == name)
    items = db.scalars(select(Service).options(joinedload(Service.provider).joinedload(User.provider_profile)).where(Service.category_id == category.id, Service.status == ServiceStatus.ACTIVE).order_by(Service.created_at.desc()).limit(6)).unique().all()
    return RecommendationResponse(category_id=category.id, category_name=category.name, reason=reason, services=[RecommendedService(id=x.id, title=x.title, provider_name=x.provider.full_name, city=x.city, price=float(x.price), rating=float(x.provider.provider_profile.avg_rating) if x.provider.provider_profile else 0) for x in items])

@router.post("/provider-match", response_model=ProviderMatchResponse)
def provider_match(request: ProviderMatchRequest, _: User = Depends(require_active_user)):
    if not request.providers: return ProviderMatchResponse(provider="No provider selected", reason="Use service recommendations to see active providers that match your request.")
    provider = max(request.providers, key=lambda x: (x.rating, x.experience))
    return ProviderMatchResponse(provider=provider.name, reason=f"{provider.name} has the strongest rating and experience among the supplied providers.")

@router.post("/reviews/summarize", response_model=ReviewSummaryResponse)
@router.post("/review-summary", response_model=ReviewSummaryResponse, include_in_schema=False)
def summarize_reviews(request: ReviewSummaryRequest, user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    reviews = request.reviews
    if request.service_id is not None:
        item = db.scalar(select(Service).where(Service.id == request.service_id, Service.provider_id == user.id))
        if not item: raise HTTPException(status_code=404, detail="Service not found")
        reviews = [x for x in db.scalars(select(Review.comment).where(Review.service_id == item.id, Review.comment.is_not(None))).all() if x]
    summary = service.summarize_reviews(reviews)
    if request.service_id is not None:
        record = db.scalar(select(ReviewSummary).where(ReviewSummary.service_id == request.service_id))
        if record: record.summary = summary
        else: db.add(ReviewSummary(service_id=request.service_id, summary=summary))
        db.commit()
    return ReviewSummaryResponse(service_id=request.service_id, summary=summary)
