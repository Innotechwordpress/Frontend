# app/routes/fetch.py
from fastapi import APIRouter, Header, HTTPException, Depends
from typing import List, Dict
from app.models.schemas import FetchEmailsResponse, Email
from app.services.email_parser import EmailParser
from app.services.gmail_oauth_service import GmailOAuthService
from app.services.research_engine import ResearchEngine
from app.services.intent_classifier import classify_intent
from app.services.company_details_service import CompanyDetailsService
from app.models.schemas import EmailClassification, BusinessValue
from app.utils.extract import extract_domain_as_company_name
from app.api.deps import get_settings
from app.core.config import Settings
import logging
import asyncio
import os # Import os module for environment variables
from starlette.requests import Request # Import Request object
import json # Import json for parsing API responses

router = APIRouter()

async def process_single_email(email, settings, oauth_token):
    """Process a single email for company details, intent, and summary."""
    try:
        sender = email.get("sender", "")
        subject = email.get("subject", "")
        body = email.get("body", "") or email.get("snippet", "")

        logging.info(f"📧 Processing: {sender[:50]}...")

        # Use enhanced company extraction
        from app.utils.extract import extract_company_name_from_email_content
        company_name = extract_company_name_from_email_content(
            sender=sender, subject=subject, body=body, email_data=email
        )

        # Simplified processing - make one combined OpenAI call instead of multiple
        from openai import AsyncOpenAI
        import httpx

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, http_client=httpx.AsyncClient(timeout=15.0))

        # Combined prompt for efficiency
        combined_prompt = f"""
        Analyze this email and provide a JSON response with:
        1. Company analysis for "{company_name}"
        2. Email intent classification
        3. Brief email summary

        Email from: {sender}
        Subject: {subject}
        Body: {body[:800]}

        Respond ONLY with JSON:
        {{
          "company_analysis": {{
            "company_name": "string",
            "industry": "string", 
            "credibility_score": 0-100,
            "employee_count": number,
            "founded_year": number,
            "business_verified": boolean
          }},
          "email_intent": "job_application|business_inquiry|promotional|newsletter|other",
          "email_summary": "1-2 sentence summary",
          "intent_confidence": 0.0-1.0
        }}
        """

        response = await client.chat.completions.create(
            model=settings.MODEL,
            messages=[{"role": "user", "content": combined_prompt}],
            temperature=0.3,
            max_tokens=300
        )

        try:
            result_data = json.loads(response.choices[0].message.content.strip())
            company_analysis = result_data.get("company_analysis", {})

            return {
                # Basic info
                "company_name": company_analysis.get("company_name", company_name),
                "industry": company_analysis.get("industry", "Unknown"),
                "credibility_score": company_analysis.get("credibility_score", 50),
                "employee_count": company_analysis.get("employee_count", 0),
                "founded": company_analysis.get("founded_year", 2020),
                "business_verified": company_analysis.get("business_verified", False),

                # Email analysis
                "intent": result_data.get("email_intent", "unknown"),
                "email_intent": result_data.get("email_intent", "unknown"),
                "email_summary": result_data.get("email_summary", body[:100] + "..."),
                "intent_confidence": result_data.get("intent_confidence", 0.5),
                "sender": sender,
                "sender_domain": sender.split('@')[-1].split('>')[0] if '@' in sender else "Unknown",

                # Default values for compatibility
                "market_cap": 0,
                "revenue": 0,
                "funding_status": "Unknown",
                "domain_age": 5,
                "ssl_certificate": True,
                "contact_quality": "Medium",
                "business_relevant": True,
                "sentiment_score": 0.5,
                "certified": False,
                "funded_by_top_investors": False,
                "headquarters": "Unknown",
                "company_gist": f"Company in {company_analysis.get('industry', 'Unknown')} industry",
                "notes": "Fast processing mode"
            }
        except (json.JSONDecodeError, KeyError) as e:
            logging.warning(f"Failed to parse OpenAI response for {company_name}: {e}")
            # Fallback data
            return {
                "company_name": company_name,
                "industry": "Unknown", 
                "credibility_score": 50,
                "intent": "unknown",
                "email_summary": body[:100] + "..." if body else "No content",
                "sender": sender,
                "sender_domain": sender.split('@')[-1].split('>')[0] if '@' in sender else "Unknown"
            }

    except Exception as e:
        logging.error(f"❌ Failed to process email: {e}")
        return None

async def trigger_auto_processing(raw_emails, oauth_token):
    """Auto-process emails through research pipeline concurrently"""
    try:
        # Validate OAuth token first
        if not oauth_token or oauth_token.strip() == "":
            raise ValueError("OAuth token is empty or invalid")

        # Get settings for API keys
        from app.core.config import settings

        # Process emails concurrently with limited concurrency
        semaphore = asyncio.Semaphore(5)  # Limit to 5 concurrent requests

        async def process_with_semaphore(email):
            async with semaphore:
                return await process_single_email(email, settings, oauth_token)

        # Execute all email processing concurrently
        tasks = [process_with_semaphore(email) for email in raw_emails]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out None results and exceptions
        valid_results = [r for r in results if r is not None and not isinstance(r, Exception)]

        logging.info(f"🎯 Fast processing complete. Processed {len(valid_results)} emails in parallel")
        return valid_results

    except Exception as e:
        logging.error(f"❌ Auto-processing failed: {e}")
        return []


@router.get("/fetch", response_model=FetchEmailsResponse)
async def fetch_unread_emails(
    oauth_token: str = Header(
        ..., alias="oauth-token"
    ),  # Frontend must send the OAuth access token as 'oauth-token'
):
    """
    Fetch unread emails from Gmail using OAuth token and parse them for frontend.
    This endpoint is fast and only fetches/parses emails without processing.
    """
    if not oauth_token:
        raise HTTPException(status_code=401, detail="OAuth token required")

    # Log the first 10 characters and last 5 chars of the token for debugging
    display_token = f"{oauth_token[:10]}...{oauth_token[-5:]}" if len(
        oauth_token) > 15 else oauth_token
    logging.info(f"📩 Received oauth_token: {display_token}")

    logging.info("📩 Fetching unread emails using OAuth token (fast mode)")

    try:
        gmail_service = GmailOAuthService(access_token=oauth_token)
        raw_emails = await gmail_service.fetch_unread_emails()
        parsed_emails = EmailParser.parse_emails(raw_emails)
        logging.info(f"✅ Fetched {len(parsed_emails)} unread emails")

        return FetchEmailsResponse(emails=parsed_emails)
    except Exception as e:
        logging.error(f"Error fetching emails: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch emails: {str(e)}")

@router.get("/weekly-count")
async def get_weekly_email_count(
    oauth_token: str = Header(..., alias="oauth-token")
):
    """Get count of emails received this week"""
    if not oauth_token:
        raise HTTPException(status_code=401, detail="OAuth token required")

    try:
        gmail_service = GmailOAuthService(access_token=oauth_token)
        weekly_count = await gmail_service.fetch_emails_this_week()

        return {
            "weekly_count": weekly_count,
            "message": f"Found {weekly_count} emails this week"
        }
    except Exception as e:
        logging.error(f"Error fetching weekly email count: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weekly count: {str(e)}")

@router.get("/fetch/processed", response_model=Dict)
async def get_processed_emails(
    request: Request # Inject the request object to access headers
):
    """Get processed emails with credibility analysis via internal call"""
    try:
        logging.info("🚀 Fetching and processing emails for credibility analysis")

        # Extract OAuth token from Authorization header or oauth-token header
        oauth_token = None

        # Try to get token from various header formats
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            oauth_token = auth_header.split("Bearer ")[1]

        if not oauth_token:
            oauth_token = request.headers.get("oauth-token")

        if not oauth_token:
            logging.warning("No OAuth token found in request headers")
            # Return empty result instead of mock data
            return {
                "emails": [],
                "count": 0,
                "credibility_analysis": [],
                "message": "OAuth token required"
            }

        # Initialize Gmail service and fetch real emails
        gmail_service = GmailOAuthService(access_token=oauth_token)
        raw_emails = await gmail_service.fetch_unread_emails()

        logging.info(f"📧 Retrieved {len(raw_emails)} emails from Gmail API")

        if not raw_emails:
            return {
                "emails": [],
                "count": 0,
                "credibility_analysis": [],
                "message": "No emails found"
            }

        # Process emails through the auto-processing pipeline
        processed_results = await trigger_auto_processing(raw_emails, oauth_token)

        return {
            "emails": raw_emails,
            "count": len(raw_emails),
            "credibility_analysis": processed_results,
            "message": f"Successfully processed {len(raw_emails)} emails"
        }

    except Exception as e:
        logging.error(f"Error processing emails: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process emails: {str(e)}")