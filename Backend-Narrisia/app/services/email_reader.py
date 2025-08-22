import imaplib
import email
from email.header import decode_header
from datetime import datetime

class EmailReader:
    def __init__(self, user: str, password: str, server: str = "imap.gmail.com"):
        self.user = user
        self.password = password
        self.server = server

    def fetch_unread_emails(self):
        mail = imaplib.IMAP4_SSL(self.server)
        mail.login(self.user, self.password)
        mail.select("inbox")

        status, messages = mail.search(None, '(UNSEEN)')
        email_ids = messages[0].split()

        emails = []
        for num in email_ids:
            _, data = mail.fetch(num, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])

            # Decode subject
            subject, encoding = decode_header(msg["Subject"])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding or "utf-8", errors="ignore")

            # Extract sender with better handling
            sender_raw = msg.get("From", "Unknown Sender")
            
            # Clean up sender format
            if sender_raw and sender_raw != "Unknown Sender":
                # Try to extract email from "Name <email@domain.com>" format
                if "<" in sender_raw and ">" in sender_raw:
                    # Keep the full format for display
                    sender = sender_raw.strip()
                elif "@" in sender_raw:
                    # Just email address
                    sender = sender_raw.strip()
                else:
                    # Fallback to raw sender
                    sender = sender_raw.strip()
            else:
                sender = "Unknown Sender"

            # Decode date
            date_str = msg.get("Date")
            try:
                date = email.utils.parsedate_to_datetime(date_str)
            except Exception:
                date = datetime.now()

            # Get plain text body
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))

                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        try:
                            body = part.get_payload(decode=True).decode(
                                part.get_content_charset() or "utf-8", errors="ignore"
                            )
                            break
                        except:
                            continue
            else:
                content_type = msg.get_content_type()
                if content_type == "text/plain":
                    body = msg.get_payload(decode=True).decode(
                        msg.get_content_charset() or "utf-8", errors="ignore"
                    )

            snippet = body.strip().replace("\n", " ")[:200]

            emails.append({
                "id": num.decode(),
                "subject": subject,
                "sender": sender,
                "date": date,
                "snippet": snippet,
                "body": body
            })

        mail.logout()
        return emails