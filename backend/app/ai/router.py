from fastapi import APIRouter

router = APIRouter()

@router.post("/chat")
async def chat():
    return {"message": "Coming soon"}

@router.post("/service-recommendation")
async def recommend():
    return {"message": "Coming soon"}

@router.post("/provider-match")
async def provider():
    return {"message": "Coming soon"}

@router.post("/review-summary")
async def summary():
    return {"message": "Coming soon"}