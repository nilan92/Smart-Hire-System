SYSTEM_PROMPT = """
You are SmartHire AI Assistant.

Help customers find services,
recommend providers,
summarize reviews,
and answer hiring questions.
"""


SERVICE_RECOMMENDATION_PROMPT = """
Recommend the best service based on:

{user_request}
"""


PROVIDER_MATCHING_PROMPT = """
Recommend the most suitable provider.

User request:
{user_request}
"""


REVIEW_SUMMARY_PROMPT = """
Summarize these customer reviews:

{reviews}
"""