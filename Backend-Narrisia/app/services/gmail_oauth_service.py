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
import os # Import os module for accessing environment variables

class GmailOAuthService:
    # Define SCOPES as a class attribute, assuming it's a list of strings
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'] # Example scopes, adjust as needed

    def __init__(self, access_token: str = None, stored_credentials: Dict = None):
        # If access_token is provided directly, use it. Otherwise, try to get it from stored_credentials.
        self.access_token = access_token if access_token else (stored_credentials.get('access_token') if stored_credentials else None)
        self.stored_credentials = stored_credentials
        self.service = None
        
        # If we have an access token, create minimal credentials immediately
        if self.access_token:
            self._initialize_with_token()

    async def _get_service(self):
        """Initialize Gmail service with OAuth token"""
        if self.service is None:
            try:
                if not self.access_token and not self.stored_credentials:
                    raise ValueError("Access token or stored credentials are required")

                # If service is not initialized, try to initialize it
                if self.service is None:
                    if not self.initialize_service():
                        # If initialization fails and we have stored credentials,
                        # try to refresh the token and re-initialize.
                        if self.stored_credentials and self.stored_credentials.get('refresh_token'):
                            logging.info("Attempting to refresh token and re-initialize Gmail service...")
                            if not await self._refresh_and_initialize_service():
                                raise Exception("Failed to refresh token and initialize Gmail service.")
                        else:
                            raise Exception("Failed to initialize Gmail service with provided token or stored credentials.")

                # Test the credentials by making a simple API call
                test_service = build('gmail', 'v1', credentials=self.service._http.credentials) # Access credentials via the service's http object
                try:
                    # Test with a simple profile request
                    test_service.users().getProfile(userId='me').execute()
                except HttpError as e:
                    if e.resp.status == 401:
                        logging.warning("OAuth token might be invalid or expired. Attempting refresh.")
                        if await self._refresh_and_initialize_service():
                            # If refresh was successful, retry the profile request
                            test_service = build('gmail', 'v1', credentials=self.service._http.credentials)
                            test_service.users().getProfile(userId='me').execute()
                        else:
                            raise ValueError(f"Invalid or expired OAuth token and refresh failed: {e}")
                    else:
                        raise
                except Exception as e:
                    logging.error(f"Error during Gmail service test: {e}")
                    raise

                logging.info("Gmail service is ready.")
            except ValueError as ve:
                logging.error(f"Authentication error during service get: {ve}")
                raise Exception(f"Authentication error: {ve}")
            except Exception as e:
                logging.error(f"Failed to get or validate Gmail service: {e}")
                self.service = None # Ensure service is None if any error occurs
                raise
        return self.service

    async def _refresh_and_initialize_service(self):
        """Refresh the access token and re-initialize the Gmail service."""
        if not self.stored_credentials or not self.stored_credentials.get('refresh_token'):
            logging.error("Cannot refresh token: missing refresh token or stored credentials.")
            return False

        try:
            creds = Credentials(
                token=self.access_token, # Use current access token if available
                refresh_token=self.stored_credentials.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.getenv('GOOGLE_CLIENT_ID'),
                client_secret=self.stored_credentials.get('client_secret', os.getenv('GOOGLE_CLIENT_SECRET')),
                scopes=self.SCOPES
            )

            # Refresh the token
            request = Request()
            creds.refresh(request)

            # Update stored credentials with new tokens and expiry
            self.access_token = creds.token
            self.stored_credentials['access_token'] = creds.token
            self.stored_credentials['expiry'] = creds.expiry
            self.stored_credentials['refresh_token'] = creds.refresh_token if creds.refresh_token else self.stored_credentials.get('refresh_token') # Keep existing if new one not provided

            # Re-initialize the service with refreshed credentials
            self.service = build('gmail', 'v1', credentials=creds)
            logging.info("Gmail service refreshed and initialized successfully.")
            return True

        except Exception as e:
            logging.error(f"Failed to refresh token or initialize Gmail service: {e}")
            self.service = None
            self.access_token = None
            return False


    def _initialize_with_token(self):
        """Initialize service with just access token for basic operations"""
        try:
            if self.access_token:
                # Create credentials with minimal required fields
                credentials = Credentials(
                    token=self.access_token,
                    scopes=self.SCOPES
                )
                
                # Build Gmail service
                self.service = build('gmail', 'v1', credentials=credentials)
                logging.info("Gmail service initialized with access token")
                return True
        except Exception as e:
            logging.error(f"Failed to initialize with access token: {e}")
            self.service = None
        return False

    def initialize_service(self):
        """Initialize Gmail service with stored credentials"""
        try:
            if not self.stored_credentials:
                raise ValueError("No stored credentials available")

            # Extract tokens from stored credentials
            access_token = self.stored_credentials.get('access_token')
            refresh_token = self.stored_credentials.get('refresh_token')

            if not access_token:
                raise ValueError("No access token found in stored credentials")

            # Create credentials object with all required fields
            credentials = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.getenv('GOOGLE_CLIENT_ID'),
                client_secret=self.stored_credentials.get('client_secret', os.getenv('GOOGLE_CLIENT_SECRET')),
                scopes=self.SCOPES
            )

            # Build Gmail service
            self.service = build('gmail', 'v1', credentials=credentials)
            logging.info("Gmail service initialized successfully")
            return True

        except Exception as e:
            logging.error(f"Failed to initialize Gmail service: {e}")
            self.service = None
            return False


    async def fetch_unread_emails(self) -> List[Dict]:
        """Fetch unread emails using Gmail OAuth API"""
        try:
            service = await self._get_service()

            def fetch_messages():
                try:
                    # First, try to get any recent emails to debug the issue
                    debug_results = service.users().messages().list(
                        userId='me',
                        q='in:inbox',
                        maxResults=10
                    ).execute()
                    debug_messages = debug_results.get('messages', [])
                    logging.info(f"Debug: Found {len(debug_messages)} total inbox messages")

                    # Search for unread emails in primary inbox only
                    results = service.users().messages().list(
                        userId='me',
                        q='is:unread in:inbox',
                        maxResults=50
                    ).execute()

                    messages = results.get('messages', [])
                    logging.info(f"Found {len(messages)} unread messages with query 'is:unread in:inbox'")

                    # If no unread found, try a broader search
                    if not messages:
                        logging.info("No unread messages found with primary query, trying broader search...")
                        
                        # Try searching for recent emails (last 3 days)
                        import datetime
                        three_days_ago = (datetime.datetime.now() - datetime.timedelta(days=3)).strftime('%Y/%m/%d')
                        
                        results = service.users().messages().list(
                            userId='me',
                            q=f'in:inbox after:{three_days_ago}',
                            maxResults=20
                        ).execute()
                        
                        messages = results.get('messages', [])
                        logging.info(f"Found {len(messages)} recent messages in last 3 days")
                        
                        if not messages:
                            logging.info("No recent messages found either")
                            return []

                    emails = []
                    for message in messages:
                        try:
                            msg = service.users().messages().get(
                                userId='me',
                                id=message['id'],
                                format='full'
                            ).execute()

                            # Check if message is actually unread
                            labels = msg.get('labelIds', [])
                            is_unread = 'UNREAD' in labels
                            is_inbox = 'INBOX' in labels
                            
                            logging.info(f"Message {message['id']}: labels={labels}, unread={is_unread}, inbox={is_inbox}")

                            # Parse email data
                            email_data = self._parse_email_message(msg)
                            email_data['is_unread'] = is_unread
                            email_data['labels'] = labels
                            
                            # For debugging, include all recent emails but mark their status
                            emails.append(email_data)
                            
                        except Exception as msg_error:
                            logging.warning(f"Failed to fetch message {message['id']}: {msg_error}")
                            continue

                    # Log summary of what we found
                    unread_count = sum(1 for email in emails if email.get('is_unread', False))
                    logging.info(f"Summary: {len(emails)} total emails, {unread_count} actually unread")
                    
                    return emails
                except HttpError as error:
                    logging.error(f"Gmail API error: {error}")
                    if error.resp.status == 401:
                        # Attempt to refresh token if it's expired or invalid
                        if not asyncio.get_event_loop().run_until_complete(self._refresh_and_initialize_service()):
                            raise Exception("OAuth token expired or invalid. Please reconnect your Google account.")
                        # If refresh was successful, retry the fetch_messages operation
                        return fetch_messages() # Recursive call to retry
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

        # Extract sender from headers with better fallback logic
        sender_raw = None
        for header_key in ["From", "from", "Sender", "Return-Path", "Reply-To"]:
            if header_key in headers and headers[header_key]:
                sender_raw = headers[header_key]
                break

        if sender_raw and sender_raw.strip():
            sender = sender_raw.strip()
            logging.info(f"Raw sender extracted: '{sender}'")
            
            # Clean up sender format and extract meaningful company name
            if "<" in sender and ">" in sender:
                # Format: "Company Name <email@domain.com>"
                name_part = sender.split("<")[0].strip()
                email_part = sender.split("<")[1].split(">")[0].strip()
                
                # Remove quotes if present
                name_part = name_part.strip('"').strip("'")
                
                # Use company name if available and meaningful
                if name_part and name_part != email_part and len(name_part) > 1:
                    # Clean up common email prefixes/suffixes
                    if " via " in name_part:
                        name_part = name_part.split(" via ")[0].strip()
                    if name_part.lower().endswith(" team"):
                        name_part = name_part[:-5].strip()
                    if name_part.lower().endswith(" hiring team"):
                        name_part = name_part[:-12].strip()
                    
                    sender = f"{name_part} <{email_part}>"
                else:
                    # Extract company from domain
                    if "@" in email_part:
                        domain = email_part.split("@")[-1]
                        company_name = domain.split(".")[0].capitalize()
                        # Handle common cases
                        if company_name.lower() == "gmail":
                            company_name = "Personal Gmail"
                        elif company_name.lower() == "outlook" or company_name.lower() == "hotmail":
                            company_name = "Personal Outlook"
                        sender = f"{company_name} <{email_part}>"
                    else:
                        sender = f"Unknown <{email_part}>"
            elif "@" in sender:
                # Just email address - extract company from domain
                email_part = sender.strip()
                domain = email_part.split("@")[-1]
                company_name = domain.split(".")[0].capitalize()
                # Handle common cases
                if company_name.lower() == "gmail":
                    company_name = "Personal Gmail"
                elif company_name.lower() == "outlook" or company_name.lower() == "hotmail":
                    company_name = "Personal Outlook"
                sender = f"{company_name} <{email_part}>"
            else:
                # Fallback for unusual formats
                sender = sender_raw
            
            logging.info(f"Processed sender: '{sender}'")
        else:
            sender = "Unknown Sender"
            logging.warning(f"No sender found in email headers. Available headers: {list(headers.keys())}")

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