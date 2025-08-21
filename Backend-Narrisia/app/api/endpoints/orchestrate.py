from fastapi import APIRouter, Depends, Header, HTTPException
from typing import List, Dict
from app.api.deps import get_settings
from app.services.gmail_oauth_service import GmailOAuthService
from app.services.research_engine import ResearchEngine
from app.services.intent_classifier import classify_intent
from app.models.schemas import ResearchReport, EmailClassification, BusinessValue
from app.core.config import Settings
from app.utils.extract import extract_domain_as_company_name
import logging

router = APIRouter()

@router.post("/orchestrate/", response_model=List[Dict])  # Returning dicts for full visibility
async def orchestrate(
    oauth_token: str = Header(..., alias="oauth-token"),
    settings: Settings = Depends(get_settings)
):
    if not oauth_token:
        raise HTTPException(status_code=401, detail="OAuth token required")

    logging.info("🚀 Starting orchestration with OAuth Gmail service")

    # ✅ Fetch unread emails using OAuth
    gmail_service = GmailOAuthService(oauth_token)
    emails = await gmail_service.fetch_unread_emails()
    logging.info(f"📩 Fetched {len(emails)} emails for processing")

    # ✅ Initialize research engine
    engine = ResearchEngine(
        settings.OPENAI_API_KEY,
        settings.SERPER_API_KEY,
        settings.MODEL
    )

    results = []

    for email in emails:
        try:
            sender = email.get("sender", "")
            company_name = extract_domain_as_company_name(sender)
            print(f"🔍 Extracted company from sender '{sender}': {company_name}")

            # ✅ Step 1: Research company
            report = await engine.research_company(company_name)

            # ✅ Step 2: Extract email body and snippet
            email_body = email.get("body") or email.get("snippet", "")
            email_snippet = email.get("snippet", "")[:300]

            # ✅ Step 3: Classify intent
            try:
                classification = await classify_intent(
                    email_body=email_body,
                    openai_api_key=settings.OPENAI_API_KEY,
                    model=settings.MODEL
                )

                print("🧠 Classification Raw Response:", classification)

                if not isinstance(classification, dict) or "intent" not in classification:
                    raise ValueError("Invalid classification format")

                classification_model = EmailClassification(
                    intent=classification["intent"],
                    intent_confidence=classification["intent_confidence"],
                    business_value=BusinessValue(**classification["business_value"]),
                    notes=classification.get("notes")
                )

            except Exception as classify_error:
                print(f"⚠️ Classification failed for {company_name}: {classify_error}")
                classification_model = EmailClassification(
                    intent="unknown",
                    intent_confidence=0.0,
                    business_value=BusinessValue(
                        relevant=False,
                        category="unknown",
                        confidence=0.0
                    ),
                    notes=f"Classification failed: {str(classify_error)}"
                )

            # ✅ Step 4: Combine and append
            report_dict = report.dict()
            report_dict["email_classification"] = classification_model.dict()  # Serialized
            report_dict["email_sender"] = sender
            report_dict["email_snippet"] = email_snippet

            results.append(report_dict)  # ✅ Append serialized dict

        except Exception as e:
            print(f"❌ Failed to process email from '{email.get('sender', 'unknown')}': {e}")
            # Continue processing other emails instead of failing completely
            continue

    return results