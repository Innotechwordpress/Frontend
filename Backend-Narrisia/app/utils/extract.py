import re
import logging

# ✅ Single sender extraction
def extract_domain_as_company_name(sender: str) -> str:
    """
    Extract a company name from a single sender string.
    E.g., "John <john@pictory.ai>" -> "Pictory"
    E.g., "Google <no-reply@accounts.google.com>" -> "Google"
    E.g., "2COMS Recruitment <noreply@2coms.com>" -> "2COMS Recruitment"
    """
    if not sender or sender.strip() == "" or sender == "Unknown Sender":
        print(f"⚠️ Empty or unknown sender provided: '{sender}'")
        return "Unknown"

    # First try to extract company name from the sender display name
    if "<" in sender and ">" in sender:
        display_name = sender.split("<")[0].strip()
        email_address = sender.split("<")[1].split(">")[0].strip()

        # If display name exists and is not just the email, use it
        if display_name and display_name != email_address and "@" not in display_name:
            # Clean up common suffixes that might be part of the display name but not the company
            if " via " in display_name:
                display_name = display_name.split(" via ")[0].strip()
            if display_name.lower().endswith(" team"):
                display_name = display_name[:-5].strip()
            if display_name.lower().endswith(" hiring team"):
                display_name = display_name[:-12].strip()
            if display_name.lower().endswith(" alerts"):
                display_name = display_name[:-7].strip()

            print(f"🎯 Extracted company from display name: '{display_name}'")
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
            "instagram.com": "Instagram",
            "replit.com": "Replit",
            "2coms.com": "2COMS"
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