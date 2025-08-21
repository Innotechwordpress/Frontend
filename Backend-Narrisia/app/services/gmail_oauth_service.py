# FILE: app/services/gmail_oauth_service.py
from typing import List, Dict
import aiohttp  # for async HTTP calls
from datetime import datetime
import base64

class GmailOAuthService:
    def __init__(self, oauth_token: str):
        self.oauth_token = oauth_token

    async def fetch_unread_emails(self) -> List[Dict]:
        """
        Use Gmail API to fetch unread emails using the OAuth token.
        Returns a list of emails as dictionaries.
        """
        headers = {"Authorization": f"Bearer {self.oauth_token}"}
        url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                if resp.status != 200:
                    raise Exception(f"Failed to fetch messages list: {resp.status}")
                data = await resp.json()
                emails = []
                for msg in data.get("messages", []):
                    # Fetch each message with full content
                    msg_id = msg["id"]
                    msg_url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}?format=full"
                    async with session.get(msg_url, headers=headers) as msg_resp:
                        if msg_resp.status != 200:
                            continue
                        msg_data = await msg_resp.json()

                        # Extract headers
                        headers_list = {h["name"]: h["value"] for h in msg_data.get("payload", {}).get("headers", [])}

                        # Extract snippet and body
                        snippet = msg_data.get("snippet", "")
                        body = self._extract_body(msg_data.get("payload", {}))

                        # Convert internal date to readable format
                        internal_date = msg_data.get("internalDate")
                        if internal_date:
                            # Convert from milliseconds to seconds and format
                            date_obj = datetime.fromtimestamp(int(internal_date) / 1000)
                            date_str = date_obj.strftime("%a, %d %b %Y %H:%M:%S %z")
                        else:
                            date_str = ""

                        emails.append({
                            "id": msg_id,
                            "subject": headers_list.get("Subject", ""),
                            "from": headers_list.get("From", ""),
                            "sender": headers_list.get("From", ""),
                            "date": date_str,
                            "snippet": snippet,
                            "body": body
                        })
                return emails

    def _extract_body(self, payload: Dict) -> str:
        """Extract plain text body from Gmail message payload"""
        body = ""

        if "parts" in payload:
            # Multipart message
            for part in payload["parts"]:
                if part.get("mimeType") == "text/plain":
                    body_data = part.get("body", {}).get("data", "")
                    if body_data:
                        # Gmail API returns body data in base64url encoding
                        body = base64.urlsafe_b64decode(body_data + "===").decode("utf-8", errors="ignore")
                        break
        else:
            # Single part message
            if payload.get("mimeType") == "text/plain":
                body_data = payload.get("body", {}).get("data", "")
                if body_data:
                    body = base64.urlsafe_b64decode(body_data + "===").decode("utf-8", errors="ignore")

        return body