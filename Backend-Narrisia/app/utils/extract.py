import re
import logging

# ✅ Single sender extraction
def extract_domain_as_company_name(sender: str) -> str:
    """
    Extract company name from email sender.
    Examples:
    - "jobs-noreply@linkedin.com" -> "LinkedIn"
    - "notifications@github.com" -> "GitHub"
    - "John Doe <john@example.com>" -> "Example"
    - "Indeed <noreply@indeed.com>" -> "Indeed"
    """
    print(f"🎯 Extracting company from sender: '{sender}'")

    if not sender or sender.strip() == "":
        print(f"⚠️ Empty sender provided")
        return "Unknown"

    # Clean the sender string and extract email
    email_match = re.search(r'<([^>]+)>', sender)
    if email_match:
        email = email_match.group(1)
        # Also extract display name for better company identification
        display_name = sender.split('<')[0].strip().strip('"').strip("'")
        if display_name:
            # Clean up display name
            if " via " in display_name:
                display_name = display_name.split(" via ")[0].strip()
            if display_name.lower().endswith(" team"):
                display_name = display_name[:-5].strip()
            if display_name.lower().endswith(" hiring team"):
                display_name = display_name[:-12].strip()
            if display_name.lower().endswith(" hiring"):
                display_name = display_name[:-7].strip()

            print(f"🎯 Extracted company from display name: '{display_name}'")
            return display_name
    else:
        # Assume the entire sender is an email
        email = sender.strip()

    # Extract domain from email
    if "@" in email:
        domain = email.split("@")[1].lower()
        print(f"🎯 Extracted domain: '{domain}'")

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
            "krishtechnolabs.com": "Krish TechnoLabs",
            "kekamail.com": "Keka (HR Platform)"
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