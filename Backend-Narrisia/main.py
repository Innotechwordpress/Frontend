import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import bcrypt
import jwt
from datetime import datetime, timedelta
import httpx
from typing import Dict, Any, Optional
import secrets
from pydantic import BaseModel
import stripe

from app.api.endpoints import fetch, research, report, orchestrate
from app.core.config import settings
from app.core.logging_config import setup_logging

# Debug OAuth configuration
print(f"🔧 Google Client ID loaded: {'Yes' if settings.GOOGLE_CLIENT_ID else 'No'}")
print(f"🔧 Google Client Secret loaded: {'Yes' if settings.GOOGLE_CLIENT_SECRET else 'No'}")
if settings.GOOGLE_CLIENT_ID:
    print(f"🔧 Client ID preview: {settings.GOOGLE_CLIENT_ID[:20]}...")

app = FastAPI(title="Narrisia AI Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "your-secret-key-change-in-production"),
    max_age=24 * 60 * 60,  # 24 hours
    same_site="lax",
    https_only=False
)

# Include existing API routers
app.include_router(fetch.router, prefix="/fetch", tags=["fetch"])
app.include_router(research.router, prefix="/research", tags=["research"])
app.include_router(report.router, prefix="/report", tags=["report"])
app.include_router(orchestrate.router, prefix="/orchestrate", tags=["orchestrate"])

# Setup custom logging
setup_logging()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Simple in-memory storage for users
users: Dict[str, Dict[str, Any]] = {}
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")

# Pydantic models
class SignupData(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    role: str
    companyName: str
    companySize: str
    industry: str
    goals: list

class LoginData(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    role: Optional[str] = None
    companyName: Optional[str] = None
    companySize: Optional[str] = None
    industry: Optional[str] = None
    goals: Optional[list] = None

# Helper functions
def generate_token(user_id: str) -> str:
    return jwt.encode(
        {"userId": user_id, "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256"
    )

def generate_id() -> str:
    return secrets.token_urlsafe(16)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def get_current_user(request: Request) -> Optional[Dict[str, Any]]:
    session = request.session
    if "userId" in session:
        # Check if user exists in memory storage (email signup)
        user = users.get(session["userId"])
        if user:
            return user
        
        # If not found in storage, check if it's a Google OAuth user
        if "user" in session:
            return session["user"]
    
    return None

# Auth endpoints
@app.post("/api/auth/signup")
async def signup(data: SignupData):
    # Check if user exists
    for user in users.values():
        if user["email"] == data.email:
            raise HTTPException(status_code=400, detail="User already exists with this email")

    # Create user
    user_id = generate_id()
    hashed_password = hash_password(data.password)

    user = {
        "id": user_id,
        "email": data.email,
        "password": hashed_password,
        "firstName": data.firstName,
        "lastName": data.lastName,
        "role": data.role,
        "companyName": data.companyName,
        "companySize": data.companySize,
        "industry": data.industry,
        "goals": data.goals,
        "createdAt": datetime.utcnow().isoformat()
    }

    users[user_id] = user

    # Generate token
    token = generate_token(user_id)

    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != "password"}

    return {
        "message": "User created successfully",
        "user": user_response,
        "token": token
    }

@app.post("/api/auth/login")
async def login(data: LoginData, request: Request):
    # Find user
    user = None
    for u in users.values():
        if u["email"] == data.email:
            user = u
            break

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Set session
    request.session["userId"] = user["id"]
    request.session["user"] = user

    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != "password"}

    return {
        "message": "Login successful",
        "user": user_response
    }

@app.get("/api/auth/google")
async def google_auth(request: Request):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not google_client_id:
        raise HTTPException(status_code=400, detail="Google OAuth not configured")

    # Build redirect URI
    protocol = "https" if request.headers.get("x-forwarded-proto") == "https" else "http"
    host = request.headers.get("host")
    redirect_uri = f"{protocol}://{host}/api/auth/google/callback"

    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={google_client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=email profile openid https://www.googleapis.com/auth/gmail.readonly&"
        f"access_type=offline&"
        f"prompt=consent"
    )

    return RedirectResponse(url=auth_url)

@app.get("/api/auth/google/callback")
async def google_callback(request: Request, code: str = None, state: str = None):
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")

    try:
        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        
        # Build the exact redirect URI that was used in the auth request
        protocol = "https" if request.headers.get("x-forwarded-proto") == "https" else "http"
        host = request.headers.get("host")
        redirect_uri = f"{protocol}://{host}/api/auth/google/callback"
        
        token_data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }

        print(f"🔧 OAuth Debug - Redirect URI: {redirect_uri}")
        print(f"🔧 OAuth Debug - Client ID: {settings.GOOGLE_CLIENT_ID[:20]}...")
        print(f"🔧 OAuth Debug - Has Client Secret: {'Yes' if settings.GOOGLE_CLIENT_SECRET else 'No'}")
        print(f"🔧 OAuth Debug - Code length: {len(code) if code else 0}")

        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            if token_response.status_code != 200:
                error_details = token_response.text
                print(f"❌ Google OAuth token exchange failed: {token_response.status_code}")
                print(f"❌ Error response: {error_details}")
                raise HTTPException(status_code=400, detail=f"Failed to exchange authorization code: {error_details}")

            token_info = token_response.json()
            access_token = token_info.get('access_token')

            if not access_token:
                raise HTTPException(status_code=400, detail="Access token not received")

            print(f"✅ OAuth token received: {access_token[:10]}...{access_token[-5:] if len(access_token) > 15 else access_token}")

            # Get user info from Google
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )

            if user_info_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")

            user_info = user_info_response.json()

            # Store user session
            user_id = user_info.get('sub')
            request.session['userId'] = user_id
            request.session['accessToken'] = access_token  # Store the access token
            request.session['user'] = {
                'id': user_id,
                'email': user_info.get('email'),
                'firstName': user_info.get('given_name'),
                'lastName': user_info.get('family_name'),
                'picture': user_info.get('picture'),
                'role': 'user'
            }

            print(f"✅ User session created for: {user_info.get('email')}")
            return RedirectResponse(url="/dashboard")

    except Exception as e:
        print(f"OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@app.get("/api/user")
async def get_current_user_endpoint(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Remove password if it exists (for email signup users)
    user_response = {k: v for k, v in user.items() if k != "password"}
    return user_response

@app.put("/api/user/profile")
async def update_profile(profile_data: UserProfile, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Update user data
    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            user[key] = value

    users[user["id"]] = user
    request.session["user"] = user

    user_response = {k: v for k, v in user.items() if k != "password"}
    return user_response

@app.post("/api/auth/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}

@app.get("/api/debug/session")
async def debug_session(request: Request):
    session = request.session
    return {
        "hasSession": bool(session),
        "user": session.get("user"),
        "tokens": {
            "accessToken": session.get("accessToken"),
            "refreshToken": session.get("refreshToken")
        }
    }

# Email endpoints
@app.get("/api/emails/unread")
async def get_unread_emails(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    access_token = request.session.get("accessToken")
    if not access_token:
        return {
            "emails": [],
            "count": 0,
            "message": "OAuth token required. Please reconnect your Google account."
        }

    try:
        # Use the existing fetch endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://localhost:5000/fetch",
                headers={"oauth-token": access_token}
            )

            if response.status_code == 200:
                email_data = response.json()
                emails = email_data.get("emails", [])
                return {
                    "emails": emails,
                    "count": len(emails),
                    "credibility_analysis": []
                }
    except Exception as e:
        print(f"Error fetching emails: {e}")

    return {
        "emails": [],
        "count": 0,
        "message": "Failed to fetch emails"
    }

@app.post("/api/emails/start-parsing")
async def start_parsing(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    access_token = request.session.get("accessToken")
    if not access_token:
        raise HTTPException(status_code=401, detail="OAuth token required")

    try:
        # Use the existing processed fetch endpoint with longer timeout
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.get(
                f"http://localhost:5000/fetch/processed",
                headers={"oauth-token": access_token}
            )

            if response.status_code == 200:
                processed_data = response.json()
                emails = processed_data.get("emails", [])
                credibility_analysis = processed_data.get("credibility_analysis", [])

                return {
                    "emails": emails,
                    "count": len(emails),
                    "credibility_analysis": credibility_analysis
                }
            else:
                error_text = response.text
                print(f"FastAPI processed endpoint error: {response.status_code} - {error_text}")
                raise HTTPException(status_code=response.status_code, detail=f"Processing failed: {error_text}")
                
    except httpx.TimeoutException:
        print("Timeout error during email processing")
        raise HTTPException(status_code=408, detail="Email processing timed out. Please try again.")
    except Exception as e:
        print(f"Error processing emails: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process emails: {str(e)}")

# Stripe payment endpoints
@app.post("/api/create-payment-intent")
async def create_payment_intent(request: Request, amount: float, plan: str = "pro"):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={
                "userId": user["id"],
                "plan": plan
            }
        )
        return {"clientSecret": payment_intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment intent: {str(e)}")

@app.post("/api/create-setup-intent")
async def create_setup_intent(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        # Create or get customer
        customer_id = user.get("stripeCustomerId")
        if not customer_id:
            customer = stripe.Customer.create(
                email=user["email"],
                name=f"{user['firstName']} {user['lastName']}",
                metadata={"userId": user["id"]}
            )
            customer_id = customer.id
            user["stripeCustomerId"] = customer_id
            users[user["id"]] = user

        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            usage="off_session",
            payment_method_types=["card"]
        )

        return {"clientSecret": setup_intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating setup intent: {str(e)}")

# Serve static files 
import os
from pathlib import Path

# Check if dist/public exists (Vite build output)
client_dist_path = Path("../dist/public")
if client_dist_path.exists() and client_dist_path.is_dir():
    app.mount("/", StaticFiles(directory="../dist/public", html=True), name="static")
else:
    @app.get("/")
    async def root():
        return {"message": "Welcome to Narrisia AI Platform - Please build the frontend first"}

    @app.get("/{path:path}")
    async def catch_all(path: str):
        return {"message": "Frontend not built. Please run: cd client && npm run build"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)