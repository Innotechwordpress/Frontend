import re
import logging

# ✅ Single sender extraction
def extract_company_name_from_email_content(sender: str, subject: str = "", body: str = "", email_data: dict = None) -> str:
    """
    Extract company name by analyzing email sender, subject, body, and signature.
    This provides more accurate company identification than domain-only analysis.
    """
    print(f"🎯 Analyzing email content to extract company name")
    print(f"📧 Sender: '{sender}'")
    print(f"📝 Subject: '{subject[:100]}...' " if len(subject) > 100 else f"📝 Subject: '{subject}'")
    
    if not sender or sender.strip() == "":
        print(f"⚠️ Empty sender provided")
        return "Unknown"

    # Step 1: Try to extract from sender display name first
    company_from_sender = _extract_from_sender_display_name(sender)
    if company_from_sender and company_from_sender != "Unknown":
        print(f"✅ Company found from sender display: {company_from_sender}")
        return company_from_sender

    # Step 2: Analyze email signature and body for company mentions
    company_from_content = _extract_from_email_content(body, subject)
    if company_from_content and company_from_content != "Unknown":
        print(f"✅ Company found from email content: {company_from_content}")
        return company_from_content

    # Step 3: Fallback to domain analysis
    company_from_domain = _extract_from_domain(sender)
    print(f"🔄 Fallback to domain analysis: {company_from_domain}")
    return company_from_domain

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

def _is_likely_company_name(name: str) -> bool:
    """Check if a string is likely a company name vs personal name"""
    name_lower = name.lower()
    
    # Company indicators
    company_indicators = [
        "technologies", "labs", "inc", "corp", "ltd", "llc", "solutions", 
        "systems", "group", "company", "enterprises", "consulting", "services",
        "platform", "tech", "software", "digital", "ai", "data"
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
    return extract_company_name_from_email_content(sender)

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