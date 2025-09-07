
from openai import AsyncOpenAI
import json
import re
import httpx


async def calculate_relevancy_score(email_content: str, company_info: str, domain_context: str, openai_api_key: str, model: str = "gpt-4o-mini") -> dict:
    """Calculate how relevant an email is to the user's business domain"""
    
    if not domain_context.strip():
        return {
            "relevancy_score": 50,  # Default neutral score
            "relevancy_explanation": "No domain context provided",
            "relevancy_confidence": 0.0
        }
    
    client = AsyncOpenAI(api_key=openai_api_key, http_client=httpx.AsyncClient(timeout=30.0))

    prompt = f"""
You are a business relevancy analyst. Analyze how relevant this email is to the user's business context.

User's Business Context:
"{domain_context}"

Email Information:
Company: {company_info}
Subject: {email_content.get('subject', 'No Subject')}
Email Content: {email_content.get('body', email_content.get('snippet', 'No content'))}

Calculate a relevancy score from 0-100 based on:
1. Industry alignment (does the sender's business align with user's industry?)
2. Business opportunity (partnership, sales, procurement, etc.)
3. Professional relevance (is this business-related vs spam/personal?)
4. Potential value (could this lead to meaningful business outcomes?)

Return ONLY valid JSON in this format:
{{
  "relevancy_score": 85,
  "relevancy_explanation": "High relevance due to industry alignment and potential partnership opportunity",
  "relevancy_confidence": 0.9
}}

Score Guidelines:
- 90-100: Highly relevant (direct industry match, clear business opportunity)
- 70-89: Very relevant (related industry or clear business value)
- 50-69: Moderately relevant (some business potential)
- 30-49: Low relevance (minimal business connection)
- 0-29: Not relevant (spam, personal, or unrelated)
"""

    try:
        print(f"🚀 Starting relevancy calculation for company: {company_info}")
        print(f"🎯 Domain context: {domain_context[:100]}...")
        
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        result = response.choices[0].message.content.strip()
        print(f"🔍 Raw relevancy response: {result[:200]}...")
        
        # Strip code block markers
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", result.strip(), flags=re.IGNORECASE)
        
        # Parse JSON
        parsed = json.loads(cleaned)
        
        # Ensure score is within bounds
        relevancy_score = max(0, min(100, parsed.get('relevancy_score', 50)))
        
        print(f"✅ RELEVANCY CALCULATION SUCCESS!")
        print(f"📊 Score: {relevancy_score}%")
        print(f"💡 Explanation: {parsed.get('relevancy_explanation', 'No explanation')[:100]}...")
        print(f"🎯 Confidence: {parsed.get('relevancy_confidence', 0.5)}")
        
        return {
            "relevancy_score": float(relevancy_score),  # Ensure it's a float in 0-100 scale
            "relevancy_explanation": parsed.get('relevancy_explanation', 'No explanation provided'),
            "relevancy_confidence": max(0, min(1, parsed.get('relevancy_confidence', 0.5)))
        }

    except json.JSONDecodeError as json_err:
        print("❌ JSON parsing failed for relevancy:", str(json_err))
        print(f"❌ Failed content: {result[:500]}...")
        return {
            "relevancy_score": 50.0,
            "relevancy_explanation": f"Failed to parse relevancy analysis: {str(json_err)}",
            "relevancy_confidence": 0.0
        }

    except Exception as e:
        print("⚠️ OpenAI relevancy call failed:", str(e))
        return {
            "relevancy_score": 50.0,
            "relevancy_explanation": f"Error calculating relevancy: {str(e)}",
            "relevancy_confidence": 0.0
        }
