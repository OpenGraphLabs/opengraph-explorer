"""
인증 관련 라우터

Google OAuth 및 zkLogin 인증을 처리합니다.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta, timezone
import secrets

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_user
from ..config import settings
from ..models.user import User
from ..services.user_service import UserService
from ..services.google_auth_service import GoogleAuthService
from ..services.zklogin_service import ZkLoginService


router = APIRouter(prefix="/auth", tags=["Authentication"])


class ZkLoginInitRequest(BaseModel):
    """zkLogin 초기화 요청"""
    nonce: str


class ZkLoginInitResponse(BaseModel):
    """zkLogin 초기화 응답"""
    nonce: str
    oauth_url: str


class TokenResponse(BaseModel):
    """토큰 응답"""
    access_token: str
    token_type: str = "bearer"
    user: dict


class ZkProofRequest(BaseModel):
    """ZK proof 생성 요청"""
    jwt_token: str
    ephemeral_public_key: str
    max_epoch: int


class ZkProofResponse(BaseModel):
    """ZK proof 생성 응답"""
    sui_address: str
    user_salt: str
    zk_proof: dict
    success: bool = True


class UpdateSuiAddressRequest(BaseModel):
    """Sui 주소 업데이트 요청"""
    sui_address: str


class UpdateSuiAddressResponse(BaseModel):
    """Sui 주소 업데이트 응답"""
    success: bool
    sui_address: str


class CurrentUserResponse(BaseModel):
    """현재 사용자 응답"""
    id: int
    email: str
    display_name: str | None = None
    profile_image_url: str | None = None
    sui_address: str | None = None
    google_id: str | None = None
    zklogin_salt: str | None = None
    created_at: str


@router.post("/zklogin/init", response_model=ZkLoginInitResponse)
async def zklogin_init(
    request: ZkLoginInitRequest,
) -> ZkLoginInitResponse:
    """
    zkLogin 초기화
    
    1. Ephemeral public key를 받아서 nonce 생성
    2. Google OAuth URL 생성 및 반환
    """
    nonce = request.nonce
    
    # Store ephemeral key and nonce in state parameter
    state_data = {
        "nonce": nonce
    }
    state = jwt.encode(state_data, settings.jwt_secret_key, algorithm="HS256")
    
    # Check if Google OAuth is configured
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
        )
    
    # Generate Google OAuth URL - redirect to SERVER callback
    server_callback_uri = f"http://localhost:8000/api/v1/auth/google/callback"
    oauth_params = {
        "client_id": settings.google_client_id,
        "redirect_uri": server_callback_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "nonce": nonce,
        "state": state
    }
    
    oauth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + "&".join(
        f"{k}={v}" for k, v in oauth_params.items()
    )
    
    return ZkLoginInitResponse(
        nonce=nonce,
        oauth_url=oauth_url
    )


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Google OAuth 콜백 처리
    
    1. Authorization code를 access token으로 교환
    2. Google 사용자 정보 조회
    3. 사용자 생성 또는 업데이트
    4. JWT 토큰 생성 및 클라이언트로 리다이렉트
    """
    try:
        # Decode state to get ephemeral key and nonce
        state_data = jwt.decode(state, settings.jwt_secret_key, algorithms=["HS256"])
        nonce = state_data.get("nonce")

        if not nonce:
            raise HTTPException(
                status_code=400,
                detail="Invalid state parameter - missing nonce"
            )

        # Exchange authorization code for tokens using Google Auth Service
        server_callback_uri = f"http://localhost:8000/api/v1/auth/google/callback"
        token_data = await GoogleAuthService.exchange_code_for_tokens(code, server_callback_uri)
        
        id_token_str = token_data.get("id_token")
        if not id_token_str:
            raise HTTPException(
                status_code=400,
                detail="No ID token received from Google"
            )
        
        # Verify Google ID token
        google_user = await GoogleAuthService.verify_id_token(id_token_str)
        
        # Validate nonce if present (zkLogin 용)
        if not GoogleAuthService.validate_nonce(google_user, nonce):
            raise HTTPException(
                status_code=400,
                detail="Invalid nonce in ID token"
            )
        
        print(f"Verified Google user: {google_user.get('email')}")
        
        # Get or create user
        user_service = UserService(db)
        user = await user_service.get_or_create_google_user(
            google_id=google_user.get("sub"),
            email=google_user.get("email"),
            name=google_user.get("name"),
            picture=google_user.get("picture")
        )
        
        # Generate zkLogin salt if not exists (클라이언트에서 사용할 수 있도록)
        if not user.zklogin_salt:
            # Generate a proper zkLogin salt (16 bytes as Base64)
            # This way the client can use it directly without conversion
            salt_bytes = secrets.token_bytes(16)
            
            # Store as Base64 string (24 characters for 16 bytes)
            import base64
            user.zklogin_salt = base64.b64encode(salt_bytes).decode('utf-8')

            # TODO(Jerry): ensure every salt generation is unique and users have their unique salt.
            
            await db.commit()
            print(f"Generated zkLogin salt for user {user.email}: {user.zklogin_salt} (Base64, {len(user.zklogin_salt)} chars)")
        
        # Create JWT token for our app
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token_data = {
            "sub": str(user.id),
            "email": user.email,
            "exp": datetime.now(timezone.utc) + access_token_expires
        }
        access_token = jwt.encode(
            access_token_data, 
            settings.jwt_secret_key, 
            algorithm=settings.jwt_algorithm
        )
        
        # Redirect to frontend with token, JWT, and zklogin_salt for client-side processing
        zklogin_salt = user.zklogin_salt or ""
        
        redirect_url = f"http://localhost:5173/auth/success?token={access_token}&jwt={id_token_str}&zklogin_salt={zklogin_salt}"
        return RedirectResponse(url=redirect_url)
            
    except Exception as e:
        print(f"Error during Google OAuth callback: {str(e)}")

        # Redirect to frontend with error
        error_url = f"http://localhost:5173/auth/error?message={str(e)}"
        return RedirectResponse(url=error_url)


@router.post("/zklogin/prove", response_model=ZkProofResponse)
async def generate_zk_proof(
    request: ZkProofRequest,
    db: AsyncSession = Depends(get_db)
) -> ZkProofResponse:
    """
    ZK proof를 생성하고 Sui 주소를 도출합니다.
    
    1. JWT 토큰 검증
    2. 사용자 salt 조회
    3. ZK proof 생성
    4. Sui 주소 도출
    5. 사용자 계정에 Sui 주소 연결
    """
    try:
        # JWT 토큰 검증
        jwt_claims = await GoogleAuthService.verify_id_token(request.jwt_token)
        
        # zkLogin 플로우 완료
        zklogin_result = await ZkLoginService.complete_zklogin_flow(
            jwt_token=request.jwt_token,
            jwt_claims=jwt_claims,
            ephemeral_public_key=request.ephemeral_public_key,
            max_epoch=request.max_epoch
        )
        
        # 사용자 계정에 Sui 주소 및 salt 업데이트
        user_service = UserService(db)
        user = await user_service.get_or_create_google_user(
            google_id=jwt_claims["sub"],
            email=jwt_claims["email"],
            name=jwt_claims.get("name"),
            picture=jwt_claims.get("picture")
        )
        
        # Sui 주소와 salt 업데이트
        user.sui_address = zklogin_result["sui_address"]
        user.zklogin_salt = zklogin_result["user_salt"]
        await db.commit()
        
        return ZkProofResponse(
            sui_address=zklogin_result["sui_address"],
            user_salt=zklogin_result["user_salt"],
            zk_proof=zklogin_result["zk_proof"]
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"ZK proof generation failed: {str(e)}"
        )


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> CurrentUserResponse:
    """현재 로그인한 사용자 정보 조회"""
    return CurrentUserResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        profile_image_url=current_user.profile_image_url,
        sui_address=current_user.sui_address,
        google_id=current_user.google_id,
        zklogin_salt=current_user.zklogin_salt,
        created_at=current_user.created_at.isoformat()
    )


@router.post("/sui-address", response_model=UpdateSuiAddressResponse)
async def update_sui_address(
    request: UpdateSuiAddressRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UpdateSuiAddressResponse:
    """
    클라이언트에서 생성한 Sui 주소를 사용자 계정에 업데이트합니다.
    
    Args:
        request: Sui 주소 업데이트 요청
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션
        
    Returns:
        UpdateSuiAddressResponse: 업데이트 결과
    """
    try:
        # Sui 주소 형식 검증 (0x로 시작하는 64자리 16진수)
        if not request.sui_address.startswith("0x") or len(request.sui_address) != 66:
            raise HTTPException(
                status_code=400,
                detail="Invalid Sui address format"
            )
        
        # 사용자의 Sui 주소 업데이트
        current_user.sui_address = request.sui_address
        await db.commit()
        
        print(f"Sui address updated for user {current_user.email}: {request.sui_address}")
        
        return UpdateSuiAddressResponse(
            success=True,
            sui_address=request.sui_address
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating Sui address: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update Sui address: {str(e)}"
        )