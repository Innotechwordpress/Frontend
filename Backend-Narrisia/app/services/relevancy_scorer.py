
from openai import AsyncOpenAI
import json
import re
import httpx


async def calculate_relevancy_score(email_content: dict, company_info: str, domain_context: str, openai_api_key: str, model: str = "gpt-4o-mini") -> dict:
    """Calculate how relevant an email is to the user's business domain"""
    
    if not domain_context or not domain_context.strip():
        print("⚠️ No domain context provided for relevancy calculation")
        return {
            "relevancy_score": 50.0,
            "relevancy_explanation": "No domain context provided",
            "relevancy_confidence": 0.0
        }
    
    try:
        client = AsyncOpenAI(api_key=openai_api_key, http_client=httpx.AsyncClient(timeout=30.0))

        # Extract email details safely
        subject = email_content.get('subject', 'No Subject') if isinstance(email_content, dict) else 'No Subject'
        body = email_content.get('body', email_content.get('snippet', 'No content')) if isinstance(email_content, dict) else str(email_content)
        
        prompt = f"""
You are a business relevancy analyst. Analyze how relevant this email is to the user's business context.

User's Business Context:
"{domain_context}"

Email Information:
Company: {company_info}
Subject: {subject}
Email Content: {body[:1000]}

Calculate a relevancy score from 0-100 based on:
1. Industry alignment (does the sender's business align with user's industry?)
2. Business opportunity (partnership, sales, procurement, etc.)
3. Professional relevance (is this business-related vs spam/personal?)
4. Potential value (could this lead to meaningful business outcomes?)

Return ONLY valid JSON in this exact format:
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

IMPORTANT: Always return a valid number between 0-100 for relevancy_score.
"""

        print(f"🚀 Starting relevancy calculation for company: {company_info}")
        print(f"🎯 Domain context: {domain_context[:100]}...")
        print(f"📧 Email subject: {subject}")
        
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=300
        )

        result = response.choices[0].message.content.strip()
        print(f"🔍 Raw relevancy response: {result}")
        
        # Clean JSON response
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        elif result.startswith("```"):
            result = result.replace("```", "").strip()
        
        # Parse JSON
        parsed = json.loads(result)
        
        # Ensure score is within bounds and is a valid number
        relevancy_score = parsed.get('relevancy_score', 50)
        if not isinstance(relevancy_score, (int, float)):
            relevancy_score = 50
        relevancy_score = max(0, min(100, float(relevancy_score)))
        
        relevancy_explanation = parsed.get('relevancy_explanation', 'No explanation provided')
        relevancy_confidence = parsed.get('relevancy_confidence', 0.5)
        if not isinstance(relevancy_confidence, (int, float)):
            relevancy_confidence = 0.5
        relevancy_confidence = max(0, min(1, float(relevancy_confidence)))
        
        print(f"✅ RELEVANCY CALCULATION SUCCESS!")
        print(f"📊 Score: {relevancy_score}%")
        print(f"💡 Explanation: {relevancy_explanation[:100]}...")
        print(f"🎯 Confidence: {relevancy_confidence}")
        
        return {
            "relevancy_score": relevancy_score,
            "relevancy_explanation": relevancy_explanation,
            "relevancy_confidence": relevancy_confidence
        }

    except json.JSONDecodeError as json_err:
        print(f"❌ JSON parsing failed for relevancy: {json_err}")
        print(f"❌ Failed content: {result[:500]}...")
        return {
            "relevancy_score": 50.0,
            "relevancy_explanation": f"Failed to parse relevancy analysis: {str(json_err)}",
            "relevancy_confidence": 0.0
        }

    except Exception as e:
        print(f"⚠️ OpenAI relevancy call failed: {e}")
        return {
            "relevancy_score": 50.0,
            "relevancy_explanation": f"Error calculating relevancy: {str(e)}",
            "relevancy_confidence": 0.0
        }
