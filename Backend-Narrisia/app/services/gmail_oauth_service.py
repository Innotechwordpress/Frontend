# FILE: app/services/gmail_oauth_service.py
from typing import List, Dict
import aiohttp  # for async HTTP calls
from datetime import datetime
import base64
import logging
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import email
import email.utils
import asyncio
import concurrent.futures

class GmailOAuthService:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.service = None

    async def _get_service(self):
        """Initialize Gmail service with OAuth token"""
        if self.service is None:
            try:
                if not self.access_token:
                    raise ValueError("Access token is required")

                # Create credentials from access token
                credentials = Credentials(token=self.access_token)

                # Test the credentials by making a simple API call
                test_service = build('gmail', 'v1', credentials=credentials)
                try:
                    # Test with a simple profile request
                    test_service.users().getProfile(userId='me').execute()
                except HttpError as e:
                    if e.resp.status == 401:
                        raise ValueError(f"Invalid or expired OAuth token: {e}")
                    raise

                self.service = test_service
                logging.info("Gmail service initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Gmail service: {e}")
                raise
        return self.service

    async def fetch_unread_emails(self) -> List[Dict]:
        """Fetch unread emails using Gmail OAuth API"""
        try:
            service = await self._get_service()

            def fetch_messages():
                try:
                    # Get list of unread messages
                    results = service.users().messages().list(
                        userId='me', 
                        q='is:unread',
                        maxResults=10
                    ).execute()

                    messages = results.get('messages', [])
                    logging.info(f"Found {len(messages)} unread messages")

                    if not messages:
                        logging.info("No unread messages found")
                        return []

                    emails = []
                    for message in messages:
                        try:
                            msg = service.users().messages().get(
                                userId='me', 
                                id=message['id'],
                                format='full'
                            ).execute()

                            # Parse email data
                            email_data = self._parse_email_message(msg)
                            emails.append(email_data)
                        except Exception as msg_error:
                            logging.warning(f"Failed to fetch message {message['id']}: {msg_error}")
                            continue

                    return emails
                except HttpError as error:
                    logging.error(f"Gmail API error: {error}")
                    if error.resp.status == 401:
                        raise Exception("OAuth token expired or invalid. Please reconnect your Google account.")
                    elif error.resp.status == 403:
                        raise Exception("Insufficient permissions. Please re-authorize the application.")
                    else:
                        raise Exception(f"Gmail API error: {error.resp.status} - {error}")
                except Exception as e:
                    logging.error(f"Unexpected error fetching emails: {e}")
                    raise

            # Use a ThreadPoolExecutor to run the synchronous Gmail API calls in a separate thread
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as pool:
                emails = await loop.run_in_executor(pool, fetch_messages)
            
            return emails

        except ValueError as ve:
            logging.error(f"Authentication error: {ve}")
            raise Exception(f"Authentication error: {ve}")
        except Exception as e:
            logging.error(f"Error processing emails: {e}")
            raise

    def _parse_email_message(self, msg: Dict) -> Dict:
        """Parse a single email message from Gmail API response"""
        headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
        subject = headers.get("Subject", "No Subject")
        sender = headers.get("From", "No Sender")
        date_header = headers.get("Date", "")
        
        # Try to parse the date header, default to None if parsing fails
        date_obj = None
        if date_header:
            try:
                # Example date format: 'Tue, 15 Aug 2023 10:30:00 +0000'
                # We can use email.utils.parsedate_to_datetime for robust parsing
                date_obj = email.utils.parsedate_to_datetime(date_header)
            except Exception as e:
                logging.warning(f"Could not parse date header '{date_header}': {e}")

        snippet = msg.get("snippet", "")
        
        # Extract plain text body
        body = self._extract_body(msg.get("payload", {}))

        return {
            "id": msg["id"],
            "subject": subject,
            "sender": sender,
            "date": date_obj.strftime("%a, %d %b %Y %H:%M:%S %z") if date_obj else "",
            "snippet": snippet,
            "body": body
        }

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
                        break # Found plain text part, no need to check further
                elif "parts" in part: # Recursively check nested parts
                    nested_body = self._extract_body(part)
                    if nested_body:
                        body = nested_body
                        break # Found plain text in nested part
        else:
            # Single part message
            if payload.get("mimeType") == "text/plain":
                body_data = payload.get("body", {}).get("data", "")
                if body_data:
                    body = base64.urlsafe_b64decode(body_data + "===").decode("utf-8", errors="ignore")
        
        return body