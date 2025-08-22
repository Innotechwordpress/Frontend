import re
import logging

# ✅ Single sender extraction
def extract_domain_as_company_name(sender: str) -> str:
    """
    Extract company name from sender email with improved logic.
    """
    print(f"🎯 Extracting company from sender: '{sender}'")

    if not sender or sender.strip() == "":
        print("⚠️ Empty or None sender")
        return "Unknown"

    sender = sender.strip()

    # Handle display names like "Company Name <email@domain.com>"
    if '<' in sender and '>' in sender:
        # Extract display name
        display_name_match = re.search(r'^([^<]+)', sender)
        if display_name_match:
            display_name = display_name_match.group(1).strip().strip('"').strip("'")

            # Clean up common suffixes from display names
            display_name = re.sub(r'\s+(team|hiring|recruitment|hr|support|noreply|no-reply)(\s|$)', r'\2', display_name, flags=re.IGNORECASE)
            display_name = display_name.strip()

            print(f"🎯 Extracted company from display name: '{display_name}'")

            # Special handling for known patterns
            if "from internshala" in display_name.lower() or "internshala" in display_name.lower():
                return "Internshala"
            elif "indeed" in display_name.lower():
                return "Indeed"
            elif "krish technolabs" in display_name.lower():
                return "Krish TechnoLabs"
            elif "2coms" in display_name.lower():
                return "2COMS"

            if display_name and display_name.lower() not in ["noreply", "no-reply", "support", "team", "hiring"]:
                return display_name

        # Otherwise extract from email domain
        match = re.search(r'<([^>]+)>', sender)
        email_address = match.group(1) if match else sender.strip()
    else:
        email_address = sender.strip()

    domain_match = re.search(r'@([\w.-]+)', email_address)
    domain = domain_match.group(1).lower() if domain_match else ""

    if domain:
        generic_domains = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "protonmail.com"}
        if domain in generic_domains:
            print(f"⚠️ Skipped generic domain: {domain}")
            return "Generic"

        # Common patterns for company domains
        known_company_domains = {
            "google.com": "Google",
            "microsoft.com": "Microsoft",
            "apple.com": "Apple",
            "amazon.com": "Amazon",
            "facebook.com": "Facebook",
            "meta.com": "Meta",
            "twitter.com": "Twitter",
            "linkedin.com": "LinkedIn",
            "youtube.com": "Youtube",
            "instagram.com": "Instagram",
            "replit.com": "Replit",
            "2coms.com": "2COMS",
            "indeed.com": "Indeed",
            "internshala.com": "Internshala",
            "krishtechnolabs.com": "Krish TechnoLabs",
            "kekamail.com": "Krish TechnoLabs"  # Common email service used by Krish
        }

        # Check if it's a known company domain (handles subdomains)
        for known_domain, company_name in known_company_domains.items():
            if domain.endswith(known_domain):
                print(f"🎯 Recognized company domain: {domain} -> {company_name}")
                return company_name

        # For unknown domains, extract the main part
        domain_parts = domain.split(".")
        if len(domain_parts) >= 2:
            main_domain = domain_parts[-2]  # Get the main domain name
            return main_domain.capitalize()
        else:
            return domain.capitalize()

    print(f"⚠️ Could not extract company name from: {sender}")
    return "Unknown"

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