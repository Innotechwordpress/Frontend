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

router = APIRouter()

async def trigger_auto_processing(raw_emails, oauth_token):
    """Auto-process emails through research pipeline"""
    try:
        # Validate OAuth token first
        if not oauth_token or oauth_token.strip() == "":
            raise ValueError("OAuth token is empty or invalid")
            
        # Get settings for API keys
        from app.core.config import settings
        
        # Initialize research engine and company details service
        engine = ResearchEngine(
            settings.OPENAI_API_KEY,
            settings.SERPER_API_KEY,
            settings.MODEL
        )
        
        company_details_service = CompanyDetailsService(
            settings.OPENAI_API_KEY,
            settings.MODEL
        )

        results = []
        for email in raw_emails:
            try:
                sender = email.get("sender", "")
                logging.info(f"📧 Email raw data - ID: {email.get('id', 'N/A')}, Sender: '{sender}', Subject: '{email.get('subject', 'N/A')}'")
                company_name = extract_domain_as_company_name(sender)
                logging.info(f"🔍 Processing company: {company_name} from sender: {sender}")

                # Get comprehensive company details from OpenAI
                comprehensive_details = await company_details_service.get_comprehensive_details(company_name)
                
                # Research company and get credibility score
                report = await engine.research_company(company_name)
                
                # Extract email content for classification
                email_body = email.get("body") or email.get("snippet", "")
                
                # Classify email intent
                try:
                    classification = await classify_intent(
                        email_body=email_body,
                        openai_api_key=settings.OPENAI_API_KEY,
                        model=settings.MODEL
                    )
                    
                    if isinstance(classification, dict) and "intent" in classification:
                        classification_model = EmailClassification(
                            intent=classification["intent"],
                            intent_confidence=classification["intent_confidence"],
                            business_value=BusinessValue(**classification["business_value"]),
                            notes=classification.get("notes")
                        )
                    else:
                        raise ValueError("Invalid classification format")
                        
                except Exception as classify_error:
                    logging.warning(f"⚠️ Classification failed for {company_name}: {classify_error}")
                    classification_model = EmailClassification(
                        intent="unknown",
                        intent_confidence=0.0,
                        business_value=BusinessValue(
                            relevant=False,
                            category="unknown",
                            confidence=0.0
                        ),
                        notes="Classification failed."
                    )

                # Extract detailed company information
                credibility_score = report.credibility.score if report.credibility else 0
                raw_metrics = report.credibility.raw_metrics if report.credibility else {}
                score_breakdown = report.credibility.score_breakdown if report.credibility else {}
                
                # If we have comprehensive details, recalculate credibility score with better data
                if comprehensive_details:
                    from app.utils.credibility import compute_credibility_score
                    
                    # Calculate age from founded year
                    current_year = 2024
                    founded_year = comprehensive_details.get("founded", raw_metrics.get("founded_year"))
                    age_years = current_year - founded_year if founded_year and isinstance(founded_year, int) else raw_metrics.get("age_years", 5)
                    
                    # Use comprehensive details with fallback to raw metrics
                    enhanced_credibility_params = {
                        "age_years": age_years,
                        "market_cap": comprehensive_details.get("market_cap", raw_metrics.get("market_cap", 0)),
                        "employees": comprehensive_details.get("employee_count", raw_metrics.get("employee_count", 100)),
                        "domain_age": comprehensive_details.get("domain_age", raw_metrics.get("domain_age", 5)),
                        "sentiment_score": comprehensive_details.get("sentiment_score", raw_metrics.get("sentiment_score", 0.5)),
                        "certified": comprehensive_details.get("business_verified", raw_metrics.get("certified", False)),
                        "funded_by_top_investors": len(comprehensive_details.get("investors", [])) > 0 or raw_metrics.get("funded_by_top_investors", False)
                    }
                    credibility_score, score_breakdown = compute_credibility_score(**enhanced_credibility_params)
                
                # Calculate founded year from age_years if not available
                current_year = 2024
                founded_year = comprehensive_details.get("founded", raw_metrics.get("founded_year", current_year - raw_metrics.get("age_years", 0)))
                
                # Determine contact quality based on credibility score and intent
                contact_quality = "High" if credibility_score > 70 else "Medium" if credibility_score > 40 else "Low"
                
                # Extract sender domain for analysis
                sender_domain = sender.split('@')[-1].split('>')[0] if '@' in sender else "Unknown"
                
                logging.info(f"✅ {company_name}: Credibility Score = {credibility_score}, Intent = {classification_model.intent}")
                
                # Merge comprehensive details with analysis results
                results.append({
                    # Basic Company Info (from comprehensive details)
                    "company_name": comprehensive_details.get("company_name", company_name),
                    "industry": comprehensive_details.get("industry", "Unknown"),
                    "company_size": comprehensive_details.get("company_size", "Unknown"),
                    "founded": comprehensive_details.get("founded", founded_year),
                    "market_cap": comprehensive_details.get("market_cap", raw_metrics.get("market_cap", 0)),
                    "revenue": comprehensive_details.get("revenue", raw_metrics.get("revenue", 0)),
                    "funding_status": comprehensive_details.get("funding_status", "Unknown"),
                    "investors": comprehensive_details.get("investors", ["Unknown"]),
                    
                    # Technical Info
                    "domain_age": comprehensive_details.get("domain_age", raw_metrics.get("domain_age", 0)),
                    "ssl_certificate": comprehensive_details.get("ssl_certificate", True),
                    "business_verified": comprehensive_details.get("business_verified", True),
                    "employee_count": comprehensive_details.get("employee_count", raw_metrics.get("employee_count", 0)),
                    
                    # Email Analysis
                    "email_intent": classification_model.intent,
                    "contact_quality": contact_quality,
                    "sender_domain": sender_domain,
                    "sender": sender,
                    
                    # Scoring & Analysis
                    "credibility_score": credibility_score,
                    "business_relevant": classification_model.business_value.relevant,
                    "intent_confidence": classification_model.intent_confidence,
                    "business_value_confidence": classification_model.business_value.confidence,
                    "sentiment_score": raw_metrics.get("sentiment_score", 0.5),
                    "certified": raw_metrics.get("certified", False),
                    "funded_by_top_investors": raw_metrics.get("funded_by_top_investors", False),
                    
                    # Enhanced Company Info
                    "headquarters": comprehensive_details.get("headquarters", "Unknown"),
                    "website": comprehensive_details.get("website", f"https://{company_name.lower()}.com"),
                    "key_products": comprehensive_details.get("key_products", ["Unknown"]),
                    "competitors": comprehensive_details.get("competitors", ["Unknown"]),
                    "business_model": comprehensive_details.get("business_model", "Unknown"),
                    "reputation_score": comprehensive_details.get("reputation_score", 0.5),
                    
                    # Additional Info
                    "company_gist": comprehensive_details.get("description", report.company_profile.description if report.company_profile else "No description available"),
                    "score_breakdown": score_breakdown,
                    "company_age_years": raw_metrics.get("age_years", 2024 - comprehensive_details.get("founded", 2020)),
                    "notes": classification_model.notes or "No additional notes"
                })
                
            except Exception as e:
                logging.error(f"❌ Failed to process email from '{email.get('sender', 'unknown')}': {e}")

        logging.info(f"🎯 Auto-processing complete. Processed {len(results)} emails with credibility scores")
        return results
        
    except Exception as e:
        logging.error(f"❌ Auto-processing failed: {e}")
        return []


@router.get("/", response_model=FetchEmailsResponse)
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
    logging.info(f"Received oauth_token: {display_token}")

    logging.info("📩 Fetching unread emails using OAuth token (fast mode)")

    try:
        gmail_service = GmailOAuthService(oauth_token)
        raw_emails = await gmail_service.fetch_unread_emails()
        parsed_emails = EmailParser.parse_emails(raw_emails)
        logging.info(f"✅ Fetched {len(parsed_emails)} unread emails")
        
        return FetchEmailsResponse(emails=parsed_emails)
    except Exception as e:
        logging.error(f"Error fetching emails: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch emails")
@router.get("/processed", response_model=Dict)
async def fetch_and_process_emails(
        oauth_token: str = Header(
            ..., alias="oauth-token"
        ),
):
    """
    Fetch unread emails and automatically process them to get company credibility scores.
    Returns both parsed emails and credibility analysis.
    """
    if not oauth_token:
        raise HTTPException(status_code=401, detail="OAuth token required")

    logging.info("🚀 Fetching and processing emails for credibility analysis")

    try:
        gmail_service = GmailOAuthService(oauth_token)
        raw_emails = await gmail_service.fetch_unread_emails()
        logging.info(f"📩 Fetched {len(raw_emails)} unread emails")
        
        # Parse emails for frontend display
        from app.services.email_parser import EmailParser
        parsed_emails = EmailParser.parse_emails(raw_emails)
        
        if not raw_emails:
            return {
                "emails": [],
                "credibility_analysis": []
            }

        # Process emails through research pipeline
        credibility_results = await trigger_auto_processing(raw_emails, oauth_token)
        
        return {
            "emails": [email.dict() for email in parsed_emails],
            "credibility_analysis": credibility_results
        }
        
    except ValueError as ve:
        logging.error(f"Validation error: {ve}")
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        logging.error(f"Error processing emails: {e}")
        error_message = str(e)
        if "OAuth token expired" in error_message or "401" in error_message:
            raise HTTPException(status_code=401, detail="OAuth token expired. Please reconnect your Google account.")
        elif "403" in error_message or "Insufficient permissions" in error_message:
            raise HTTPException(status_code=403, detail="Insufficient permissions. Please re-authorize the application.")
        raise HTTPException(status_code=500, detail=f"Failed to process emails: {error_message}")
