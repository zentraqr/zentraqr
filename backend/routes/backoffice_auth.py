"""
Backoffice Authentication Module
Secure session-based authentication for ZentraQR backoffice
"""
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import secrets
import os

router = APIRouter(prefix="/api/backoffice/auth", tags=["backoffice-auth"])

# Configuration from environment
BACKOFFICE_PASSWORD = os.environ.get('BACKOFFICE_PASSWORD', 'zentra2024admin')
SESSION_HOURS = int(os.environ.get('BACKOFFICE_SESSION_HOURS', '12'))
COOKIE_SECURE = os.environ.get('COOKIE_SECURE', 'false').lower() == 'true'
COOKIE_NAME = "backoffice_session"

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str

class MeResponse(BaseModel):
    authenticated: bool
    expires_at: str = None

async def get_db(request: Request):
    """Get database from app state"""
    return request.app.state.db

async def validate_session(request: Request) -> dict:
    """Validate backoffice session from cookie"""
    db = request.app.state.db
    
    # Get session token from cookie
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    
    # Find session in database
    session = await db.backoffice_sessions.find_one(
        {"token": token, "type": "backoffice"},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiration
    expires_at = session.get('expires_at')
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
    
    if datetime.now(timezone.utc) > expires_at:
        # Session expired, delete it
        await db.backoffice_sessions.delete_one({"token": token})
        return None
    
    return session

async def require_backoffice_auth(request: Request):
    """Dependency to require backoffice authentication"""
    session = await validate_session(request)
    if not session:
        raise HTTPException(status_code=401, detail="Não autenticado")
    return session

@router.post("/login", response_model=LoginResponse)
async def login(request: Request, response: Response, login_data: LoginRequest):
    """
    Authenticate to backoffice with password
    Creates session in MongoDB and sets HttpOnly cookie
    """
    db = request.app.state.db
    
    # Validate password
    if login_data.password != BACKOFFICE_PASSWORD:
        raise HTTPException(status_code=401, detail="Senha incorreta")
    
    # Generate secure token
    token = secrets.token_urlsafe(32)
    
    # Calculate expiration
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
    
    # Create session document
    session_doc = {
        "token": token,
        "type": "backoffice",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at.isoformat()
    }
    
    # Store in MongoDB
    await db.backoffice_sessions.insert_one(session_doc)
    
    # Set HttpOnly cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=SESSION_HOURS * 3600,
        path="/"
    )
    
    return LoginResponse(success=True, message="Login realizado com sucesso")

@router.get("/me", response_model=MeResponse)
async def get_me(request: Request):
    """
    Check if current session is valid
    Returns authentication status
    """
    session = await validate_session(request)
    
    if not session:
        return MeResponse(authenticated=False)
    
    return MeResponse(
        authenticated=True,
        expires_at=session.get('expires_at')
    )

@router.post("/logout")
async def logout(request: Request, response: Response):
    """
    Logout from backoffice
    Deletes session from MongoDB and clears cookie
    """
    db = request.app.state.db
    
    # Get token from cookie
    token = request.cookies.get(COOKIE_NAME)
    
    if token:
        # Delete session from MongoDB
        await db.backoffice_sessions.delete_one({"token": token})
    
    # Clear cookie
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/"
    )
    
    return {"success": True, "message": "Logout realizado com sucesso"}

# Function to create TTL index (called on startup)
async def setup_backoffice_indexes(db):
    """Create necessary indexes for backoffice sessions"""
    try:
        # Create unique index on token
        await db.backoffice_sessions.create_index("token", unique=True)
        
        # Create TTL index on expires_at for automatic session cleanup
        # Note: TTL index works with actual Date objects, so we need to store as datetime
        await db.backoffice_sessions.create_index(
            "expires_at",
            expireAfterSeconds=0
        )
        print("✅ Backoffice session indexes created")
    except Exception as e:
        print(f"⚠️ Index creation warning: {e}")
