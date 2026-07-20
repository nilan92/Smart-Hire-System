SYSTEM_PROMPT = """
You are SmartHire AI Assistant.

Your responsibilities are:
- Help customers find the right service.
- Recommend suitable service providers.
- Summarize customer reviews.
- Answer questions about SmartHire.
- Be polite, concise and helpful.
"""


SERVICE_RECOMMENDATION_PROMPT = """
Recommend the best SmartHire service based on the customer's request.

Customer request:
{user_request}
"""


PROVIDER_MATCHING_PROMPT = """
Recommend the most suitable provider.

Customer request:
{user_request}

Available providers:
{providers}
"""


REVIEW_SUMMARY_PROMPT = """
Summarize these customer reviews:

Reviews:
{reviews}
"""