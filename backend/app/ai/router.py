from fastapi import APIRouter
from app.ai.schemas import ChatRequest, ChatResponse
from app.ai.service import AIService

router = APIRouter()
service = AIService()



@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    reply = await service.chat(request.message)

    return ChatResponse(reply=reply)

@router.post("/service-recommendation")
async def recommend():
    return {"message": "Coming soon"}

@router.post("/provider-match")
async def provider():
    return {"message": "Coming soon"}

@router.post("/review-summary")
async def summary():
    return {"message": "Coming soon"}