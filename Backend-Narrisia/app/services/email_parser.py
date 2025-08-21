from app.models.schemas import Email
from email.utils import parseaddr
from datetime import datetime
from typing import List, Dict

class EmailParser:
    @staticmethod
    def parse_emails(raw_emails: List[Dict]) -> List[Email]:
        parsed = []
        for e in raw_emails:
            sender = parseaddr(e.get("from", ""))[1]
            date_str = e.get("date", "")
            try:
                date_obj = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
            except Exception:
                date_obj = datetime.utcnow()
            email_obj = Email(
                id=e.get("id"),
                subject=e.get("subject", ""),
                sender=sender,
                date=date_obj,
                snippet=e.get("snippet", ""),
            )
            parsed.append(email_obj)
        return parsed
