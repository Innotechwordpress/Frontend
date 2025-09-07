
from openai import AsyncOpenAI
import json
import re
import httpx


async def calculate_relevancy_score(email_content: dict, company_info: str, domain_context: str, openai_api_key: str, model: str = "gpt-4o-mini") -> dict:
    """Calculate how relevant an email is to the user's business domain"""
    
    print(f"🔍🔍🔍 RELEVANCY SCORER INPUT CHECK 🔍🔍🔍")
    print(f"   Domain context received: '{domain_context}'")
    print(f"   Domain context length: {len(domain_context) if domain_context else 0}")
    print(f"   Domain context type: {type(domain_context)}")
    print(f"   Domain context stripped: '{domain_context.strip() if domain_context else 'EMPTY'}'")
    
    if not domain_context or not domain_context.strip():
        print("⚠️⚠️⚠️ NO DOMAIN CONTEXT PROVIDED FOR RELEVANCY CALCULATION ⚠️⚠️⚠️")
        return {
            "relevancy_score": 50.0,
            "relevancy_explanation": "No domain context provided",
            "relevancy_confidence": 0.0
        }
    
    try:
        client = AsyncOpenAI(api_key=openai_api_key, http_client=httpx.AsyncClient(timeout=15.0))

        # Extract email details safely
        subject = email_content.get('subject', 'No Subject') if isinstance(email_content, dict) else 'No Subject'
        body = email_content.get('body', email_content.get('snippet', 'No content')) if isinstance(email_content, dict) else str(email_content)
        
        print(f"📧📧📧 RELEVANCY SCORER EMAIL DATA CHECK 📧📧📧")
        print(f"   Email content type: {type(email_content)}")
        print(f"   Email content keys: {list(email_content.keys()) if isinstance(email_content, dict) else 'Not a dict'}")
        print(f"   Subject extracted: {subject}")
        print(f"   Body extracted (first 300 chars): {body[:300]}")
        print(f"   Company info: {company_info}")
        print(f"📧📧📧 END RELEVANCY EMAIL DATA 📧📧📧")
        
        prompt = f"""
Analyze this specific email's relevance to the user's business context.

User's Business Context: "{domain_context}"

THIS SPECIFIC EMAIL:
Company: {company_info}
Subject: {subject}
Email Content: {body[:1500]}

Rate relevance 0-100 based on:
1. Industry alignment with user's business
2. Business opportunity potential
3. Professional vs personal nature
4. Actionable value for user

Return ONLY this JSON:
{{
  "relevancy_score": [0-100 number],
  "relevancy_explanation": "[Specific reason why this email got this score - mention actual email content]",
  "relevancy_confidence": [0.0-1.0]
}}

Score ranges:
- 90-100: Highly relevant (direct business match)
- 70-89: Very relevant (strong business connection)
- 50-69: Moderately relevant (some business value)
- 30-49: Low relevance (minimal connection)
- 0-29: Not relevant (spam/personal/unrelated)

CRITICAL: Base your explanation on the ACTUAL email content above, not generic assumptions.
"""

        print(f"🚀🚀🚀 STARTING RELEVANCY CALCULATION 🚀🚀🚀")
        print(f"🏢 Company: {company_info}")
        print(f"🎯 Domain context: {domain_context[:100]}...")
        print(f"📧 Email subject: {subject}")
        print(f"📝 Email body preview: {body[:200]}...")
        print(f"🤖 Model: {model}")
        print(f"🔑 API Key present: {bool(openai_api_key)}")
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",  # Faster and cheaper model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200  # Reduced token limit
        )

        result = response.choices[0].message.content.strip()
        print(f"🔍 Raw OpenAI relevancy response:")
        print(f"📄 {result}")
        
        # Clean JSON response
        original_result = result
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        elif result.startswith("```"):
            result = result.replace("```", "").strip()
        
        print(f"🧹 Cleaned response: {result}")
        
        # Parse JSON
        try:
            parsed = json.loads(result)
            print(f"✅ JSON parsing successful: {parsed}")
        except json.JSONDecodeError as json_err:
            print(f"❌ JSON parsing failed: {json_err}")
            print(f"❌ Original response: {original_result}")
            print(f"❌ Cleaned response: {result}")
            raise json_err
        
        # Ensure score is within bounds and is a valid number
        relevancy_score = parsed.get('relevancy_score', 50)
        print(f"🎯 Raw relevancy score from API: {relevancy_score} (type: {type(relevancy_score)})")
        
        if not isinstance(relevancy_score, (int, float)):
            print(f"⚠️ Invalid relevancy score type, defaulting to 50")
            relevancy_score = 50
        relevancy_score = max(0, min(100, float(relevancy_score)))
        
        relevancy_explanation = parsed.get('relevancy_explanation', 'No explanation provided')
        relevancy_confidence = parsed.get('relevancy_confidence', 0.5)
        if not isinstance(relevancy_confidence, (int, float)):
            relevancy_confidence = 0.5
        relevancy_confidence = max(0, min(1, float(relevancy_confidence)))
        
        print(f"✅✅✅ RELEVANCY CALCULATION SUCCESS! ✅✅✅")
        print(f"📊 Final Score: {relevancy_score}% (type: {type(relevancy_score)})")
        print(f"💡 Explanation: {relevancy_explanation[:100]}...")
        print(f"🎯 Confidence: {relevancy_confidence}")
        
        # Return as percentage (0-100 scale)
        final_result = {
            "relevancy_score": float(relevancy_score),  # Ensure it's a float percentage
            "relevancy_explanation": relevancy_explanation,
            "relevancy_confidence": relevancy_confidence
        }
        
        print(f"📦📦📦 RETURNING RELEVANCY RESULT 📦📦📦")
        print(f"   Score: {final_result['relevancy_score']} (type: {type(final_result['relevancy_score'])})")
        print(f"   Explanation: {final_result['relevancy_explanation'][:50]}...")
        print(f"   Confidence: {final_result['relevancy_confidence']}")
        print(f"   Full object: {final_result}")
        
        return final_result

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
