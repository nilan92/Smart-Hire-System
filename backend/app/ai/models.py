from enum import Enum


class AIIntent(str, Enum):
    SERVICE_RECOMMENDATION = "service_recommendation"
    PROVIDER_MATCHING = "provider_matching"
    REVIEW_SUMMARY = "review_summary"
    CHAT = "chat"