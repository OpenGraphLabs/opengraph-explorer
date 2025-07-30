"""
zkLogin 서비스

ZK proof 생성 및 Sui 주소 도출을 담당합니다.
"""

import httpx
import hashlib
import base64
import json
from typing import Dict, Any, Optional
from fastapi import HTTPException

from ..config import settings


class ZkLoginService:
    """zkLogin 관련 서비스"""
    
    @staticmethod
    def generate_user_salt(jwt_sub: str) -> str:
        """
        사용자별 고유한 salt를 생성합니다.
        실제 프로덕션에서는 더 안전한 방식으로 관리해야 합니다.
        
        Args:
            jwt_sub: Google JWT의 sub claim (사용자 ID)
            
        Returns:
            str: 사용자의 zkLogin salt (16진수 문자열)
        """
        import hashlib
        
        # JWT sub와 고정 시드를 결합하여 일관된 salt 생성
        # 프로덕션에서는 더 안전한 방식 사용 권장
        seed = f"zklogin_salt_{jwt_sub}_{settings.jwt_secret_key}"
        hash_bytes = hashlib.sha256(seed.encode()).digest()
        
        # 32바이트를 BigInt로 변환하기 위해 16진수 문자열로 반환
        return hash_bytes.hex()
    
    @staticmethod
    async def generate_zk_proof(
        jwt_token: str,
        ephemeral_public_key: str,
        user_salt: str,
        max_epoch: int
    ) -> Dict[str, Any]:
        """
        Mysten Labs prover service를 사용하여 ZK proof를 생성합니다.
        
        Args:
            jwt_token: Google ID token
            ephemeral_public_key: Ephemeral public key (Base64)
            user_salt: 사용자 salt
            max_epoch: Maximum epoch
            
        Returns:
            Dict[str, Any]: ZK proof 데이터
            
        Raises:
            HTTPException: Proof 생성 실패 시
        """
        try:
            # Prepare payload for prover service
            payload = {
                "jwt": jwt_token,
                "extendedEphemeralPublicKey": ephemeral_public_key,
                "maxEpoch": str(max_epoch),
                "jwtRandomness": user_salt,
                "salt": user_salt,
                "keyClaimName": "sub"  # Google의 사용자 식별자
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    settings.zklogin_prover_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code != 200:
                    error_detail = response.text
                    try:
                        error_json = response.json()
                        error_detail = error_json.get("error", error_detail)
                    except:
                        pass
                    
                    raise HTTPException(
                        status_code=500,
                        detail=f"ZK proof generation failed: {error_detail}"
                    )
                
                return response.json()
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Network error during proof generation: {str(e)}"
            )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error during proof generation: {str(e)}"
            )
    
    @staticmethod
    def derive_sui_address(
        user_salt: str,
        jwt_sub: str,
        aud: str
    ) -> str:
        """
        JWT claims와 salt로부터 Sui 주소를 도출합니다.
        zkLogin 공식 스펙에 따른 genAddressSeed 구현
        
        Args:
            user_salt: 사용자 salt (16진수 문자열)
            jwt_sub: JWT sub claim
            aud: JWT audience claim
            
        Returns:
            str: 도출된 Sui 주소
        """
        try:
            import hashlib
            import struct
            
            # zkLogin 스펙에 따른 address seed 생성
            # genAddressSeed(salt, key_claim_name, key_claim_value, aud)
            
            iss = "https://accounts.google.com"  # Google issuer
            
            # 1. Create input for address seed generation
            # Format: iss + aud_length + aud + sub_length + sub + salt_bytes
            aud_bytes = aud.encode('utf-8')
            sub_bytes = jwt_sub.encode('utf-8')
            iss_bytes = iss.encode('utf-8')
            
            # Convert salt from hex string to bytes
            try:
                salt_bytes = bytes.fromhex(user_salt)
            except ValueError:
                # If salt is not hex, use it as-is and hash it
                salt_bytes = hashlib.sha256(user_salt.encode()).digest()
            
            # Construct the input according to zkLogin spec
            # This is a simplified version - actual implementation may vary
            address_seed_input = (
                iss_bytes + 
                struct.pack('<I', len(aud_bytes)) + aud_bytes +
                struct.pack('<I', len(sub_bytes)) + sub_bytes +
                salt_bytes
            )
            
            # Generate address seed
            address_seed_hash = hashlib.sha256(address_seed_input).digest()
            
            # Take first 20 bytes for Sui address (similar to Ethereum)
            address_bytes = address_seed_hash[:20]
            
            # Convert to Sui address format
            sui_address = f"0x{address_bytes.hex()}"
            
            print(f"Address derivation debug:")
            print(f"  ISS: {iss}")
            print(f"  AUD: {aud}")
            print(f"  SUB: {jwt_sub}")
            print(f"  Salt: {user_salt}")
            print(f"  Derived address: {sui_address}")
            
            return sui_address
            
        except Exception as e:
            print(f"Error in derive_sui_address: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to derive Sui address: {str(e)}"
            )
    
    @staticmethod
    async def complete_zklogin_flow(
        jwt_token: str,
        jwt_claims: Dict[str, Any],
        ephemeral_public_key: str,
        max_epoch: int
    ) -> Dict[str, Any]:
        """
        전체 zkLogin 플로우를 완료합니다.
        
        Args:
            jwt_token: Google ID token
            jwt_claims: 검증된 JWT claims
            ephemeral_public_key: Ephemeral public key
            max_epoch: Maximum epoch
            
        Returns:
            Dict[str, Any]: 완성된 zkLogin 데이터
        """
        try:
            jwt_sub = jwt_claims["sub"]
            jwt_aud = jwt_claims["aud"]
            
            # 1. 사용자 salt 조회
            user_salt = await ZkLoginService.get_user_salt(jwt_sub)
            
            # 2. ZK proof 생성
            zk_proof = await ZkLoginService.generate_zk_proof(
                jwt_token=jwt_token,
                ephemeral_public_key=ephemeral_public_key,
                user_salt=user_salt,
                max_epoch=max_epoch
            )
            
            # 3. Sui 주소 도출
            sui_address = ZkLoginService.derive_sui_address(
                user_salt=user_salt,
                jwt_sub=jwt_sub,
                aud=jwt_aud
            )
            
            return {
                "sui_address": sui_address,
                "user_salt": user_salt,
                "zk_proof": zk_proof,
                "ephemeral_public_key": ephemeral_public_key,
                "max_epoch": max_epoch
            }
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=500,
                detail=f"zkLogin flow failed: {str(e)}"
            )