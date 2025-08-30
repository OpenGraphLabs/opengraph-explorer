"""
Google OAuth 인증 서비스

Google ID token의 서명, audience, expiration을 검증합니다.
"""

import httpx
from google.auth.transport import requests
from google.oauth2 import id_token
from typing import Dict, Any, Optional
from fastapi import HTTPException

from ..config import settings


class GoogleAuthService:
    """Google OAuth 인증 서비스"""
    
    @staticmethod
    async def verify_id_token(token: str) -> Dict[str, Any]:
        """
        Google ID token을 검증합니다.
        
        Args:
            token: Google ID token
            
        Returns:
            Dict[str, Any]: 검증된 사용자 정보
            
        Raises:
            HTTPException: 토큰 검증 실패 시
        """
        try:
            # Google의 공개 키를 사용하여 ID token 검증
            # audience는 우리의 Google Client ID여야 함
            # clock_skew_in_seconds=30: 시계 동기화 오차 10초까지 허용
            id_info = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.google_client_id,
                clock_skew_in_seconds=10
            )
            
            # issuer 검증
            if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            # 추가 검증
            if 'sub' not in id_info:
                raise ValueError('Missing sub claim.')
            
            if 'email' not in id_info:
                raise ValueError('Missing email claim.')
            
            return id_info
            
        except ValueError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid Google ID token: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Token verification failed: {str(e)}"
            )
    
    @staticmethod
    async def exchange_code_for_tokens(
        code: str, 
        redirect_uri: str
    ) -> Dict[str, Any]:
        """
        Authorization code를 access token과 ID token으로 교환합니다.
        
        Args:
            code: Google authorization code
            redirect_uri: 리다이렉트 URI
            
        Returns:
            Dict[str, Any]: 토큰 정보
            
        Raises:
            HTTPException: 토큰 교환 실패 시
        """
        try:
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": settings.google_client_id,
                        "client_secret": settings.google_client_secret,
                        "redirect_uri": redirect_uri,
                        "grant_type": "authorization_code"
                    },
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                )
                
                if token_response.status_code != 200:
                    error_data = token_response.json() if token_response.content else {}
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to exchange code for token: {error_data.get('error_description', 'Unknown error')}"
                    )
                
                return token_response.json()
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Network error during token exchange: {str(e)}"
            )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error during token exchange: {str(e)}"
            )
    
    @staticmethod
    def validate_nonce(id_token_claims: Dict[str, Any], expected_nonce: str) -> bool:
        """
        ID token의 nonce를 검증합니다.
        
        Args:
            id_token_claims: ID token의 claims
            expected_nonce: 예상되는 nonce 값
            
        Returns:
            bool: nonce가 유효한지 여부
        """
        token_nonce = id_token_claims.get('nonce')
        if not token_nonce:
            return False
        
        return token_nonce == expected_nonce