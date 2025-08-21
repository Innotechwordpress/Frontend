from openai import AsyncOpenAI
import json
import re


async def classify_intent(email_body: str, openai_api_key: str, model: str = "gpt-4o-mini") -> dict:
    client = AsyncOpenAI(api_key=openai_api_key)

    prompt = f"""
You are an AI assistant. Read the email below and classify it in two ways:

1. **Intent** — What is the main purpose of the email?
2. **Business Value** — Does this email mention anything related to money, sales, budget, quote, or financial value?

Return a JSON with this format:
{{
  "intent": "<short category like 'business inquiry', 'spam', 'job application', etc.>",
  "intent_confidence": 0.0 to 1.0,
  "business_value": {{
    "relevant": true or false,
    "category": "<if relevant: sales | budget | quotation | finance | invoice | other>",
    "confidence": 0.0 to 1.0
  }},
  "notes": "<optional notes or rationale>"
}}

Email:
\"\"\"
{email_body}
\"\"\"
"""

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        result = response.choices[0].message.content.strip()

        print("🧠 Raw OpenAI response:\n", result)

        # Strip code block markers like ```json or ```
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", result.strip(), flags=re.IGNORECASE)

        # Parse JSON
        parsed = json.loads(cleaned)
        return parsed

    except json.JSONDecodeError as json_err:
        print("❌ JSON parsing failed:", str(json_err))
        return {
            "intent": "unknown",
            "intent_confidence": 0.0,
            "business_value": {
                "relevant": False,
                "category": "unknown",
                "confidence": 0.0
            },
            "notes": f"Failed to parse JSON: {str(json_err)}"
        }

    except Exception as e:
        print("⚠️ OpenAI call failed:", str(e))
        return {
            "intent": "unknown",
            "intent_confidence": 0.0,
            "business_value": {
                "relevant": False,
                "category": "unknown",
                "confidence": 0.0
            },
            "notes": f"Exception occurred: {str(e)}"
        }
