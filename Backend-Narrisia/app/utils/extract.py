import re
import logging

# ✅ Single sender extraction
def extract_company_name_from_email_content(sender: str, subject: str, body: str, email_data: dict = None) -> dict:
    """
    Enhanced company name extraction from email content with better accuracy
    """
    print(f"🔍 COMPANY EXTRACTION INPUT:")
    print(f"   Sender: {sender}")
    print(f"   Subject: {subject}")
    print(f"   Body preview: {body[:200] if body else 'No body'}")

    # First try to extract from sender email address
    company_from_sender = extract_domain_as_company_name(sender)
    print(f"   Company from sender domain: {company_from_sender}")

    if company_from_sender and company_from_sender.lower() not in ['gmail', 'yahoo', 'hotmail', 'outlook', 'unknown']:
        return {
            "company_name": company_from_sender,
            "is_personal_email": False,
            "extraction_source": "sender_domain"
        }

    # Check if it's a personal email
    personal_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
    sender_domain = sender.split('@')[-1].split('>')[0].lower() if '@' in sender else ""
    is_personal = any(domain in sender_domain for domain in personal_domains)

    if is_personal:
        # For personal emails, try to extract company from email content
        company_from_content = extract_company_from_text_content(body, subject)
        if company_from_content:
            return {
                "company_name": company_from_content,
                "is_personal_email": True,
                "extraction_source": "email_content"
            }
        else:
            return {
                "company_name": sender.split('<')[0].strip().strip('"') if '<' in sender else sender,
                "is_personal_email": True,
                "extraction_source": "sender_name"
            }

    # Fallback: extract from email content if domain extraction failed
    company_from_content = extract_company_from_text_content(body, subject)
    if company_from_content:
        return {
            "company_name": company_from_content,
            "is_personal_email": False,
            "extraction_source": "email_content"
        }

    # Final fallback
    return {
        "company_name": company_from_sender or "Unknown Company",
        "is_personal_email": is_personal,
        "extraction_source": "fallback"
    }


def extract_company_from_text_content(body: str, subject: str) -> str:
    """
    Extract company name from email body and subject, avoiding common signature words
    """
    if not body and not subject:
        return None

    # Avoid extracting from common email signatures and closings
    signature_words = [
        'thanks', 'thank you', 'regards', 'best regards', 'sincerely',
        'yours truly', 'kind regards', 'warm regards', 'cheers', 'best',
        'yours', 'cordially', 'respectfully', 'faithfully'
    ]

    # Look for company mentions in the body first
    text_to_search = f"{subject} {body}".lower()

    # Known company patterns to look for
    company_patterns = [
        r'from\s+([A-Z][a-zA-Z\s]+?)[\s\n]',
        r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:team|support|service|department)',
        r'(?:at|from)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)',
        r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+is\s+(?:expanding|launching|announcing)',
    ]

    import re

    for pattern in company_patterns:
        matches = re.findall(pattern, body if body else subject, re.MULTILINE)
        for match in matches:
            match = match.strip()
            # Skip if it's a signature word
            if match.lower() not in signature_words and len(match) > 2:
                print(f"   Found company from content pattern: {match}")
                return match

    # Look for well-known companies directly mentioned
    known_companies = [
        'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla',
        'Zomato', 'Swiggy', 'Uber', 'Ola', 'Flipkart', 'Myntra', 'Naukri',
        'Indeed', 'LinkedIn', 'Internshala', 'Accenture', 'TCS', 'Infosys',
        'Wipro', 'HCL', 'Cognizant', 'Deloitte', 'EY', 'KPMG', 'PwC'
    ]

    for company in known_companies:
        if company.lower() in text_to_search:
            print(f"   Found known company: {company}")
            return company

    return None

def _extract_from_sender_display_name(sender: str) -> str:
    """Extract company from sender display name"""
    # Clean the sender string and extract email
    email_match = re.search(r'<([^>]+)>', sender)
    if email_match:
        display_name = sender.split('<')[0].strip().strip('"').strip("'")
        if display_name and len(display_name) > 1:
            # Clean up display name
            clean_name = display_name
            if " via " in clean_name:
                clean_name = clean_name.split(" via ")[0].strip()
            if clean_name.lower().endswith(" team"):
                clean_name = clean_name[:-5].strip()
            if clean_name.lower().endswith(" hiring team"):
                clean_name = clean_name[:-12].strip()
            if clean_name.lower().endswith(" hiring"):
                clean_name = clean_name[:-7].strip()
            if clean_name.lower().endswith(" hr"):
                clean_name = clean_name[:-3].strip()

            # Check if it's a meaningful company name (not just a person's name)
            if _is_likely_company_name(clean_name):
                return clean_name

    return "Unknown"

def _extract_from_email_content(body: str, subject: str) -> str:
    """Extract company name from email body and subject using patterns"""
    content = f"{subject} {body}".lower()

    # Common company indicators in email content
    company_patterns = [
        # Direct company mentions
        r'(?:from|at|@)\s+([A-Z][a-zA-Z\s&]+(?:Technologies|Labs|Inc|Corp|Ltd|LLC|Solutions|Systems|Group|Company)?)',
        r'(?:regards|best\s+regards|sincerely)[\s,]*\n*([A-Z][a-zA-Z\s&]+(?:Team|HR|Hiring)?)',
        r'(?:team\s+at|hr\s+at|hiring\s+at)\s+([A-Z][a-zA-Z\s&]+)',
        # Signature patterns
        r'([A-Z][a-zA-Z\s&]+(?:Technologies|Labs|Inc|Corp|Ltd|LLC|Solutions|Systems|Group))',
        # Job-related patterns
        r'(?:join|career|job|position)\s+(?:at|with)\s+([A-Z][a-zA-Z\s&]+)',
        # Email signature patterns
        r'\n([A-Z][a-zA-Z\s&]+(?:Technologies|Labs|Inc|Corp|Ltd|LLC))\n',
    ]

    # Known companies to look for in content
    known_companies = [
        "Krish Technolabs", "Krish TechnoLabs", "2COMS", "Indeed", "LinkedIn",
        "Internshala", "Naukri", "Hirist", "Google", "Microsoft", "Amazon",
        "Meta", "Facebook", "Apple", "Netflix", "Uber", "Airbnb"
    ]

    # Check for known companies in content
    for company in known_companies:
        if company.lower() in content:
            print(f"🎯 Found known company '{company}' in email content")
            return company

    # Try pattern matching
    for pattern in company_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            if isinstance(match, tuple):
                match = match[0] if match else ""

            clean_match = match.strip()
            if len(clean_match) > 2 and _is_likely_company_name(clean_match):
                print(f"🎯 Pattern matched company: '{clean_match}'")
                return clean_match.title()

    return "Unknown"

def _extract_from_domain(sender: str) -> str:
    """Extract company from email domain (fallback method)"""
    # Extract email from sender
    email_match = re.search(r'<([^>]+)>', sender)
    email = email_match.group(1) if email_match else sender.strip()

    # Extract domain from email
    if "@" in email:
        domain = email.split("@")[1].lower()

        # Known company domains mapping
        known_company_domains = {
            "2coms.com": "2COMS",
            "linkedin.com": "LinkedIn",
            "github.com": "GitHub",
            "google.com": "Google",
            "microsoft.com": "Microsoft",
            "apple.com": "Apple",
            "amazon.com": "Amazon",
            "meta.com": "Meta",
            "facebook.com": "Meta",
            "twitter.com": "Twitter",
            "indeed.com": "Indeed",
            "glassdoor.com": "Glassdoor",
            "monster.com": "Monster",
            "naukri.com": "Naukri",
            "internshala.com": "Internshala",
            "wellfound.com": "Wellfound",
            "angellist.com": "Wellfound",
            "stripe.com": "Stripe",
            "paypal.com": "PayPal",
            "shopify.com": "Shopify",
            "salesforce.com": "Salesforce",
            "hubspot.com": "HubSpot",
            "slack.com": "Slack",
            "zoom.us": "Zoom",
            "dropbox.com": "Dropbox",
            "atlassian.com": "Atlassian",
            "netflix.com": "Netflix",
            "spotify.com": "Spotify",
            "uber.com": "Uber",
            "lyft.com": "Lyft",
            "airbnb.com": "Airbnb",
            "krishtechnolabs.com": "Krish Technolabs",
            "kekamail.com": "Unknown"  # Will be determined by content analysis
        }

        # Check known domains
        for known_domain, company_name in known_company_domains.items():
            if domain.endswith(known_domain):
                if company_name != "Unknown":
                    return company_name

        # For unknown domains, extract main part
        domain_parts = domain.split(".")
        if len(domain_parts) >= 2:
            main_domain = domain_parts[-2]
            if main_domain.lower() == "gmail":
                return "Personal Gmail"
            elif main_domain.lower() in ["outlook", "hotmail"]:
                return "Personal Outlook"
            else:
                return main_domain.capitalize()

    return "Unknown"

def _is_personal_email_domain(sender: str) -> bool:
    """Check if the email sender is from a personal email domain"""
    email_match = re.search(r'<([^>]+)>', sender)
    email = email_match.group(1) if email_match else sender.strip()

    if "@" in email:
        domain = email.split("@")[1].lower()
        personal_domains = [
            "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in",
            "hotmail.com", "outlook.com", "live.com", "msn.com",
            "aol.com", "icloud.com", "me.com", "mac.com",
            "protonmail.com", "tutanota.com", "rediffmail.com",
            "yandex.com", "mail.com", "zoho.com"
        ]
        return domain in personal_domains

    return False

def _extract_from_email_signature(body: str) -> str:
    """Extract company name from email signature"""
    if not body:
        return "Unknown"

    lines = body.strip().split('\n')
    signature_start = -1

    # Look for signature indicators
    signature_indicators = [
        "best regards", "regards", "sincerely", "thanks", "thank you",
        "cheers", "sent from", "--", "___"
    ]

    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for indicator in signature_indicators:
            if indicator in line_lower:
                signature_start = i
                break
        if signature_start != -1:
            break

    if signature_start == -1:
        signature_start = max(0, len(lines) - 10)  # Last 10 lines as potential signature

    # Analyze signature lines for company names
    for i in range(signature_start, len(lines)):
        line = lines[i].strip()
        if not line or len(line) < 3:
            continue

        # Skip lines that look like contact info
        if any(x in line.lower() for x in ["phone:", "email:", "tel:", "mobile:", "@"]):
            continue

        # Look for company patterns in signature
        if _is_likely_company_name(line):
            return line.strip()

    return "Unknown"

def _is_likely_company_name(name: str) -> bool:
    """Check if a string is likely a company name vs personal name"""
    name_lower = name.lower()

    # Company indicators
    company_indicators = [
        "technologies", "labs", "inc", "corp", "ltd", "llc", "solutions",
        "systems", "group", "company", "enterprises", "consulting", "services",
        "platform", "tech", "software", "digital", "ai", "data", "pvt", "private",
        "limited", "co.", "corporation", "incorporated"
    ]

    # Personal name indicators (to exclude)
    personal_indicators = [
        "dear", "hello", "hi", "mr", "mrs", "ms", "dr", "prof"
    ]

    # Check for company indicators
    for indicator in company_indicators:
        if indicator in name_lower:
            return True

    # Check for personal indicators (exclude)
    for indicator in personal_indicators:
        if indicator in name_lower:
            return False

    # If name has multiple words and starts with capital, likely company
    words = name.split()
    if len(words) >= 2 and name[0].isupper():
        return True

    # Single word companies (like "Indeed", "Google")
    if len(words) == 1 and len(name) > 3 and name[0].isupper():
        return True

    return False

# Legacy function for backward compatibility
def extract_domain_as_company_name(sender: str) -> str:
    """Legacy function - now uses content analysis"""
    result = extract_company_name_from_email_content(sender)
    if isinstance(result, dict):
        return result["company_name"]
    return result

# ✅ Batch extractor — uses the above
def extract_company_names(emails):
    """
    Extracts company names from a list of emails using their sender fields.
    Skips generic email domains.
    """
    return [
        extract_domain_as_company_name(email.get("sender", ""))
        for email in emails
    ]