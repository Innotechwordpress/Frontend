import re

# ✅ Single sender extraction
def extract_domain_as_company_name(sender: str) -> str:
    """
    Extract a company name from a single sender string.
    E.g., "John <john@pictory.ai>" -> "Pictory"
    E.g., "Google <no-reply@accounts.google.com>" -> "Google"
    """
    match = re.search(r'<([^>]+)>', sender)
    email_address = match.group(1) if match else sender.strip()

    domain_match = re.search(r'@([\w.-]+)', email_address)
    domain = domain_match.group(1).lower() if domain_match else ""

    if domain:
        generic_domains = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "protonmail.com"}
        if domain in generic_domains:
            print(f"⚠️ Skipped generic domain: {domain}")
            return "Generic"

        # Handle subdomains - extract the main company domain
        domain_parts = domain.split(".")

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
            "instagram.com": "Instagram"
        }

        # Check if it's a known company domain (handles subdomains)
        for known_domain, company_name in known_company_domains.items():
            if domain.endswith(known_domain):
                print(f"🎯 Recognized company domain: {domain} -> {company_name}")
                return company_name

        # For other domains, if it has subdomains, try to extract the main domain
        if len(domain_parts) >= 3:
            # Extract last two parts (e.g., accounts.google.com -> google.com)
            main_domain = ".".join(domain_parts[-2:])
            company_name = domain_parts[-2].capitalize()
            print(f"🔍 Extracted from subdomain: {domain} -> {company_name}")
            return company_name
        else:
            # Regular domain, use first part
            return domain_parts[0].capitalize()

    print(f"⚠️ Could not parse domain from sender: {sender}")
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